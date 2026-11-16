import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { open, seal } from '../../../src/main/crypto/aead'
import { DEFAULT_ARGON2, type Argon2Params } from '../../../src/main/crypto/kdf'
import {
  changePassword,
  createKeystore,
  isDeviceBound,
  KEYSTORE_FORMAT,
  KeystoreError,
  rebindWithDataKey,
  rotateDataKey,
  unlockWithDataKey,
  unlockWithPassword,
  type DeviceProtector,
  type Keystore,
} from '../../../src/main/crypto/keystore'

// 测试用小参数，保证速度；默认参数单独测一次
const FAST: Argon2Params = { memoryKiB: 64, iterations: 1, parallelism: 1 }
const PWD = 'correct horse battery'

/** 模拟一台电脑的设备密钥保护。不同实例代表不同电脑 / 不同 Windows 账户。 */
class FakeDevice implements DeviceProtector {
  private readonly key = randomBytes(32)
  async protect(secret: Buffer): Promise<Buffer> {
    const s = seal(this.key, secret, Buffer.from('device'))
    return Buffer.concat([s.nonce, s.ciphertext])
  }
  async unprotect(blob: Buffer): Promise<Buffer> {
    return open(
      this.key,
      { nonce: blob.subarray(0, 12), ciphertext: blob.subarray(12) },
      Buffer.from('device'),
    )
  }
}

async function setup(device = new FakeDevice()) {
  const created = await createKeystore({ password: PWD, device, params: FAST })
  return { device, ...created }
}

/** 深拷贝并保持 Buffer 类型（structuredClone 会把 Buffer 变成 Uint8Array） */
function cloneKeystore(ks: Keystore): Keystore {
  const b = (x: Buffer) => Buffer.from(x)
  const wrap = (w: { nonce: Buffer; ciphertext: Buffer }) => ({
    nonce: b(w.nonce),
    ciphertext: b(w.ciphertext),
  })
  return {
    ...ks,
    slots: {
      password: {
        kdf: { ...ks.slots.password.kdf, salt: b(ks.slots.password.kdf.salt) },
        deviceSecret: b(ks.slots.password.deviceSecret),
        wrap: wrap(ks.slots.password.wrap),
      },
      dataKey: {
        kdf: { alg: 'HKDF-SHA256', salt: b(ks.slots.dataKey.kdf.salt) },
        wrap: wrap(ks.slots.dataKey.wrap),
      },
    },
  }
}

async function expectKeystoreError(p: Promise<unknown>, code: string) {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  )
  expect(err).toBeInstanceOf(KeystoreError)
  expect((err as KeystoreError).code).toBe(code)
}

describe('初始化', () => {
  it('同一主密钥可由登录密码与数据密钥分别解开', async () => {
    const { keystore, device, mk, dataKey } = await setup()
    expect((await unlockWithPassword(keystore, PWD, device)).equals(mk)).toBe(true)
    expect(unlockWithDataKey(keystore, dataKey).equals(mk)).toBe(true)
  })

  it('记录格式版本与库标识，且两次初始化的库标识不同', async () => {
    const a = await setup()
    const b = await setup()
    expect(a.keystore.format).toBe(KEYSTORE_FORMAT)
    expect(a.keystore.vaultId).not.toBe(b.keystore.vaultId)
  })

  it('密码过短时拒绝初始化', async () => {
    await expectKeystoreError(
      createKeystore({ password: 'short', device: new FakeDevice(), params: FAST }),
      'password-too-short',
    )
  })

  it('默认 Argon2id 参数下往返正常', async () => {
    const device = new FakeDevice()
    const { keystore, mk } = await createKeystore({ password: PWD, device })
    expect(keystore.slots.password.kdf).toMatchObject({
      memoryKiB: DEFAULT_ARGON2.memoryKiB,
      iterations: DEFAULT_ARGON2.iterations,
      parallelism: DEFAULT_ARGON2.parallelism,
    })
    expect((await unlockWithPassword(keystore, PWD, device)).equals(mk)).toBe(true)
  }, 30_000)
})

describe('登录', () => {
  it('密码错误 → bad-credentials', async () => {
    const { keystore, device } = await setup()
    await expectKeystoreError(unlockWithPassword(keystore, 'wrong password!', device), 'bad-credentials')
  })

  it('数据密钥错误 → bad-credentials', async () => {
    const { keystore } = await setup()
    expect(() => unlockWithDataKey(keystore, randomBytes(32))).toThrowError(KeystoreError)
    try {
      unlockWithDataKey(keystore, randomBytes(32))
    } catch (e) {
      expect((e as KeystoreError).code).toBe('bad-credentials')
    }
  })

  it('换到另一台电脑（设备密钥解不开）→ device-unavailable，且 isDeviceBound 为 false', async () => {
    const { keystore } = await setup()
    const otherDevice = new FakeDevice()
    expect(await isDeviceBound(keystore, otherDevice)).toBe(false)
    await expectKeystoreError(unlockWithPassword(keystore, PWD, otherDevice), 'device-unavailable')
  })

  it('本机设备可解开时 isDeviceBound 为 true', async () => {
    const { keystore, device } = await setup()
    expect(await isDeviceBound(keystore, device)).toBe(true)
  })
})

describe('修改登录密码', () => {
  it('旧密码失效、新密码生效，主密钥与数据密钥都不变', async () => {
    const { keystore, device, mk, dataKey } = await setup()
    const next = await changePassword(keystore, PWD, 'brand new password', device, FAST)

    await expectKeystoreError(unlockWithPassword(next, PWD, device), 'bad-credentials')
    expect((await unlockWithPassword(next, 'brand new password', device)).equals(mk)).toBe(true)
    expect(unlockWithDataKey(next, dataKey).equals(mk)).toBe(true)
  })

  it('旧密码不对时拒绝修改', async () => {
    const { keystore, device } = await setup()
    await expectKeystoreError(
      changePassword(keystore, 'nope nope nope', 'brand new password', device, FAST),
      'bad-credentials',
    )
  })

  it('新密码过短时拒绝修改', async () => {
    const { keystore, device } = await setup()
    await expectKeystoreError(changePassword(keystore, PWD, 'short', device, FAST), 'password-too-short')
  })

  it('每次修改都换新的盐', async () => {
    const { keystore, device } = await setup()
    const next = await changePassword(keystore, PWD, 'brand new password', device, FAST)
    expect(next.slots.password.kdf.salt.equals(keystore.slots.password.kdf.salt)).toBe(false)
  })
})

describe('重新生成数据密钥', () => {
  it('旧数据密钥失效，新数据密钥可解开，登录密码不变', async () => {
    const { keystore, device, mk, dataKey } = await setup()
    const rotated = await rotateDataKey(keystore, PWD, device)

    expect(() => unlockWithDataKey(rotated.keystore, dataKey)).toThrowError(KeystoreError)
    expect(unlockWithDataKey(rotated.keystore, rotated.dataKey).equals(mk)).toBe(true)
    expect((await unlockWithPassword(rotated.keystore, PWD, device)).equals(mk)).toBe(true)
  })

  it('需要登录密码确认', async () => {
    const { keystore, device } = await setup()
    await expectKeystoreError(rotateDataKey(keystore, 'nope nope nope', device), 'bad-credentials')
  })
})

describe('换电脑 / 忘记密码：用数据密钥重新绑定', () => {
  it('数据密钥正确时，在新设备上设置新密码即可登录', async () => {
    const { keystore, mk, dataKey } = await setup()
    const newDevice = new FakeDevice()
    const rebound = await rebindWithDataKey(keystore, dataKey, 'new laptop pwd', newDevice, FAST)

    expect(rebound.mk.equals(mk)).toBe(true)
    expect((await unlockWithPassword(rebound.keystore, 'new laptop pwd', newDevice)).equals(mk)).toBe(true)
    expect(await isDeviceBound(rebound.keystore, newDevice)).toBe(true)
  })

  it('重新绑定时生成新的设备密钥，旧设备的保护数据被替换', async () => {
    const { keystore, dataKey } = await setup()
    const rebound = await rebindWithDataKey(keystore, dataKey, 'new laptop pwd', new FakeDevice(), FAST)
    expect(rebound.keystore.slots.password.deviceSecret.equals(keystore.slots.password.deviceSecret)).toBe(false)
  })

  it('数据密钥错误时拒绝', async () => {
    const { keystore } = await setup()
    await expect(
      rebindWithDataKey(keystore, randomBytes(32), 'new laptop pwd', new FakeDevice(), FAST),
    ).rejects.toMatchObject({ code: 'bad-credentials' })
  })
})

describe('完整性', () => {
  it('密码槽的密文被改动即解封失败', async () => {
    const { keystore, device } = await setup()
    const tampered = cloneKeystore(keystore)
    tampered.slots.password.wrap.ciphertext[0] ^= 0x01
    await expectKeystoreError(unlockWithPassword(tampered, PWD, device), 'bad-credentials')
  })

  it('数据密钥槽的密文被改动即解封失败', async () => {
    const { keystore, dataKey } = await setup()
    const tampered = cloneKeystore(keystore)
    tampered.slots.dataKey.wrap.ciphertext[0] ^= 0x01
    expect(() => unlockWithDataKey(tampered, dataKey)).toThrowError(KeystoreError)
  })

  it('改动库标识（不改密文）导致解封失败，即 AAD 生效', async () => {
    const { keystore, device } = await setup()
    const tampered: Keystore = { ...keystore, vaultId: '00000000-0000-4000-8000-000000000000' }
    await expectKeystoreError(unlockWithPassword(tampered, PWD, device), 'bad-credentials')
  })

  it('改动 KDF 参数（降低强度）导致解封失败', async () => {
    const { keystore, device } = await setup()
    const weakened = cloneKeystore(keystore)
    weakened.slots.password.kdf.memoryKiB = 8
    await expectKeystoreError(unlockWithPassword(weakened, PWD, device), 'bad-credentials')
  })

  it('格式版本高于程序支持时拒绝打开', async () => {
    const { keystore, device } = await setup()
    const future = { ...keystore, format: KEYSTORE_FORMAT + 1 }
    await expectKeystoreError(unlockWithPassword(future, PWD, device), 'format-too-new')
  })
})
