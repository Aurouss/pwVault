import { randomBytes, randomUUID } from 'node:crypto'
import { KEY_BYTES, open, seal, AeadError, type Sealed } from './aead'
import { DEFAULT_ARGON2, deriveArgon2id, hkdfSha256, wipe, type Argon2Params } from './kdf'

/**
 * 密钥体系（设计文档 5.2、5.3、8.1）。
 *
 * 主密钥 MK 终身不变，被两个槽分别封装：
 *   - password 槽：KEK_P = HKDF(K_pwd ‖ K_dev)，K_pwd 由登录密码经 Argon2id 得到，K_dev 由系统 DPAPI 保护
 *   - dataKey 槽：KEK_D = HKDF(dataKey)
 *
 * 本模块只做纯密码学运算，不接触文件系统和 Electron。设备密钥的保护通过 DeviceProtector 注入。
 */

export const KEYSTORE_FORMAT = 1
export const MIN_PASSWORD_LENGTH = 8

const INFO_PASSWORD = 'pwvault/v1/slot-password'
const INFO_DATAKEY = 'pwvault/v1/slot-datakey'
const SALT_BYTES = 16

/** 由系统保护设备密钥。生产环境用 safeStorage（Windows 上即 DPAPI）。 */
export interface DeviceProtector {
  protect(secret: Buffer): Promise<Buffer>
  unprotect(blob: Buffer): Promise<Buffer>
}

export type KeystoreErrorCode =
  | 'bad-credentials'
  | 'device-unavailable'
  | 'password-too-short'
  | 'format-too-new'
  | 'corrupt'

export class KeystoreError extends Error {
  constructor(
    readonly code: KeystoreErrorCode,
    message?: string,
  ) {
    super(message ?? code)
    this.name = 'KeystoreError'
  }
}

export interface PasswordSlot {
  kdf: Argon2Params & { alg: 'argon2id'; salt: Buffer }
  /** 经 DeviceProtector 保护后的 K_dev */
  deviceSecret: Buffer
  wrap: Sealed
}

export interface DataKeySlot {
  kdf: { alg: 'HKDF-SHA256'; salt: Buffer }
  wrap: Sealed
}

export interface Keystore {
  format: number
  vaultId: string
  createdAt: string
  slots: {
    password: PasswordSlot
    dataKey: DataKeySlot
  }
}

export interface CreateResult {
  keystore: Keystore
  /** 主密钥。调用方用完后需 wipe。 */
  mk: Buffer
  /** 数据密钥，仅用于一次性展示给用户。调用方展示后需 wipe。 */
  dataKey: Buffer
}

export function assertPasswordPolicy(password: string): void {
  if (Array.from(password).length < MIN_PASSWORD_LENGTH) {
    throw new KeystoreError('password-too-short', `密码至少 ${MIN_PASSWORD_LENGTH} 位`)
  }
}

interface Meta {
  format: number
  vaultId: string
}

/** 槽的 AAD：格式版本、库标识、槽名、KDF 参数。被改动即解封失败。 */
function slotAad(meta: Meta, slot: 'password' | 'dataKey', kdf: object): Buffer {
  return Buffer.from(
    JSON.stringify({ format: meta.format, vaultId: meta.vaultId, slot, kdf }),
    'utf8',
  )
}

function passwordKdfAad(meta: Meta, params: Argon2Params): Buffer {
  return slotAad(meta, 'password', {
    alg: 'argon2id',
    memoryKiB: params.memoryKiB,
    iterations: params.iterations,
    parallelism: params.parallelism,
  })
}

function dataKeyAad(meta: Meta): Buffer {
  return slotAad(meta, 'dataKey', { alg: 'HKDF-SHA256' })
}

async function passwordKek(
  password: string,
  salt: Buffer,
  params: Argon2Params,
  kDev: Buffer,
): Promise<Buffer> {
  const pwd = Buffer.from(password, 'utf8')
  const kPwd = await deriveArgon2id(pwd, salt, params)
  wipe(pwd)
  const ikm = Buffer.concat([kPwd, kDev])
  wipe(kPwd)
  const kek = hkdfSha256(ikm, salt, INFO_PASSWORD)
  wipe(ikm)
  return kek
}

async function buildPasswordSlot(
  meta: Meta,
  password: string,
  mk: Buffer,
  kDev: Buffer,
  params: Argon2Params,
  device: DeviceProtector,
): Promise<PasswordSlot> {
  const salt = randomBytes(SALT_BYTES)
  const kek = await passwordKek(password, salt, params, kDev)
  const wrap = seal(kek, mk, passwordKdfAad(meta, params))
  wipe(kek)
  return {
    kdf: { alg: 'argon2id', ...params, salt },
    deviceSecret: await device.protect(kDev),
    wrap,
  }
}

function buildDataKeySlot(meta: Meta, dataKey: Buffer, mk: Buffer): DataKeySlot {
  const salt = randomBytes(SALT_BYTES)
  const kek = hkdfSha256(dataKey, salt, INFO_DATAKEY)
  const wrap = seal(kek, mk, dataKeyAad(meta))
  wipe(kek)
  return { kdf: { alg: 'HKDF-SHA256', salt }, wrap }
}

function metaOf(ks: Keystore): Meta {
  return { format: ks.format, vaultId: ks.vaultId }
}

function paramsOf(kdf: Argon2Params): Argon2Params {
  return { memoryKiB: kdf.memoryKiB, iterations: kdf.iterations, parallelism: kdf.parallelism }
}

function assertFormat(ks: Keystore): void {
  if (ks.format > KEYSTORE_FORMAT) {
    throw new KeystoreError('format-too-new', '数据格式高于本程序支持的版本，请升级程序')
  }
}

/** 初始化：生成全部密钥并封装。 */
export async function createKeystore(options: {
  password: string
  device: DeviceProtector
  params?: Argon2Params
  now?: Date
}): Promise<CreateResult> {
  assertPasswordPolicy(options.password)
  const params = options.params ?? DEFAULT_ARGON2
  const meta: Meta = { format: KEYSTORE_FORMAT, vaultId: randomUUID() }
  const mk = randomBytes(KEY_BYTES)
  const kDev = randomBytes(KEY_BYTES)
  const dataKey = randomBytes(KEY_BYTES)

  const password = await buildPasswordSlot(meta, options.password, mk, kDev, params, options.device)
  const dataKeySlot = buildDataKeySlot(meta, dataKey, mk)
  wipe(kDev)

  return {
    keystore: {
      ...meta,
      createdAt: (options.now ?? new Date()).toISOString(),
      slots: { password, dataKey: dataKeySlot },
    },
    mk,
    dataKey,
  }
}

/** 登录：返回主密钥。任何解封失败都映射为 bad-credentials 或 device-unavailable。 */
export async function unlockWithPassword(
  ks: Keystore,
  password: string,
  device: DeviceProtector,
): Promise<Buffer> {
  assertFormat(ks)
  const slot = ks.slots.password
  const params = paramsOf(slot.kdf)
  const kDev = await unprotectDevice(device, slot.deviceSecret)
  const kek = await passwordKek(password, slot.kdf.salt, params, kDev)
  wipe(kDev)
  try {
    return open(kek, slot.wrap, passwordKdfAad(metaOf(ks), params))
  } catch (e) {
    if (e instanceof AeadError) throw new KeystoreError('bad-credentials')
    throw e
  } finally {
    wipe(kek)
  }
}

/** 迁移与忘记密码恢复：用数据密钥解封主密钥。 */
export function unlockWithDataKey(ks: Keystore, dataKey: Buffer): Buffer {
  assertFormat(ks)
  const slot = ks.slots.dataKey
  const kek = hkdfSha256(dataKey, slot.kdf.salt, INFO_DATAKEY)
  try {
    return open(kek, slot.wrap, dataKeyAad(metaOf(ks)))
  } catch (e) {
    if (e instanceof AeadError) throw new KeystoreError('bad-credentials')
    throw e
  } finally {
    wipe(kek)
  }
}

/** 判断本机能否解开设备密钥（启动流程中区分“本机数据”与“其他设备数据”）。 */
export async function isDeviceBound(ks: Keystore, device: DeviceProtector): Promise<boolean> {
  try {
    const kDev = await device.unprotect(ks.slots.password.deviceSecret)
    wipe(kDev)
    return true
  } catch {
    return false
  }
}

/** 修改登录密码：只重建密码槽，主密钥与数据库都不变。 */
export async function changePassword(
  ks: Keystore,
  oldPassword: string,
  newPassword: string,
  device: DeviceProtector,
  params?: Argon2Params,
): Promise<Keystore> {
  assertPasswordPolicy(newPassword)
  const mk = await unlockWithPassword(ks, oldPassword, device)
  try {
    const kDev = await unprotectDevice(device, ks.slots.password.deviceSecret)
    const password = await buildPasswordSlot(
      metaOf(ks),
      newPassword,
      mk,
      kDev,
      params ?? paramsOf(ks.slots.password.kdf),
      device,
    )
    wipe(kDev)
    return { ...ks, slots: { ...ks.slots, password } }
  } finally {
    wipe(mk)
  }
}

/** 重新生成数据密钥：作废旧密钥，只重建数据密钥槽。需要登录密码确认。 */
export async function rotateDataKey(
  ks: Keystore,
  password: string,
  device: DeviceProtector,
): Promise<{ keystore: Keystore; dataKey: Buffer }> {
  const mk = await unlockWithPassword(ks, password, device)
  try {
    const dataKey = randomBytes(KEY_BYTES)
    const dataKeySlot = buildDataKeySlot(metaOf(ks), dataKey, mk)
    return { keystore: { ...ks, slots: { ...ks.slots, dataKey: dataKeySlot } }, dataKey }
  } finally {
    wipe(mk)
  }
}

/**
 * 用数据密钥在本机重新绑定：生成本机新的 K_dev，并用新登录密码重建密码槽。
 * 用于换电脑导入（设计文档 8.5）与忘记密码恢复（4.1.3）。
 */
export async function rebindWithDataKey(
  ks: Keystore,
  dataKey: Buffer,
  newPassword: string,
  device: DeviceProtector,
  params?: Argon2Params,
): Promise<{ keystore: Keystore; mk: Buffer }> {
  assertPasswordPolicy(newPassword)
  const mk = unlockWithDataKey(ks, dataKey)
  const kDev = randomBytes(KEY_BYTES)
  const password = await buildPasswordSlot(
    metaOf(ks),
    newPassword,
    mk,
    kDev,
    params ?? paramsOf(ks.slots.password.kdf),
    device,
  )
  wipe(kDev)
  return { keystore: { ...ks, slots: { ...ks.slots, password } }, mk }
}

async function unprotectDevice(device: DeviceProtector, blob: Buffer): Promise<Buffer> {
  try {
    return await device.unprotect(blob)
  } catch {
    throw new KeystoreError('device-unavailable', '无法解开本机设备密钥')
  }
}
