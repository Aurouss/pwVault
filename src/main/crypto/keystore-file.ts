import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { z } from 'zod'
import { atomicWriteText, keepPreviousCopy } from '../fsutil'
import { KEYSTORE_FORMAT, KeystoreError, type Keystore } from './keystore'

/** keystore.json 的磁盘格式。二进制字段用 base64 存放。 */

const b64 = z.base64()

const argon2Kdf = z.object({
  alg: z.literal('argon2id'),
  memoryKiB: z.number().int().positive(),
  iterations: z.number().int().positive(),
  parallelism: z.number().int().positive(),
  salt: b64,
})

const aeadWrap = z.object({
  alg: z.literal('AES-256-GCM'),
  nonce: b64,
  ciphertext: b64,
})

const diskSchema = z.object({
  format: z.number().int().positive(),
  vaultId: z.uuid(),
  createdAt: z.string().min(1),
  slots: z.object({
    password: z.object({
      kdf: argon2Kdf,
      deviceSecret: b64,
      wrap: aeadWrap,
    }),
    dataKey: z.object({
      kdf: z.object({ alg: z.literal('HKDF-SHA256'), salt: b64 }),
      wrap: aeadWrap,
    }),
  }),
})

type Disk = z.infer<typeof diskSchema>

function toDisk(ks: Keystore): Disk {
  const { password, dataKey } = ks.slots
  return {
    format: ks.format,
    vaultId: ks.vaultId,
    createdAt: ks.createdAt,
    slots: {
      password: {
        kdf: {
          alg: 'argon2id',
          memoryKiB: password.kdf.memoryKiB,
          iterations: password.kdf.iterations,
          parallelism: password.kdf.parallelism,
          salt: password.kdf.salt.toString('base64'),
        },
        deviceSecret: password.deviceSecret.toString('base64'),
        wrap: wrapToDisk(password.wrap),
      },
      dataKey: {
        kdf: { alg: 'HKDF-SHA256', salt: dataKey.kdf.salt.toString('base64') },
        wrap: wrapToDisk(dataKey.wrap),
      },
    },
  }
}

function wrapToDisk(w: { nonce: Buffer; ciphertext: Buffer }) {
  return {
    alg: 'AES-256-GCM' as const,
    nonce: w.nonce.toString('base64'),
    ciphertext: w.ciphertext.toString('base64'),
  }
}

function wrapFromDisk(w: z.infer<typeof aeadWrap>) {
  return {
    nonce: Buffer.from(w.nonce, 'base64'),
    ciphertext: Buffer.from(w.ciphertext, 'base64'),
  }
}

export function serializeKeystore(ks: Keystore): string {
  return JSON.stringify(toDisk(ks), null, 2) + '\n'
}

export function parseKeystore(text: string): Keystore {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new KeystoreError('corrupt', 'keystore.json 不是合法的 JSON')
  }

  const format = (raw as { format?: unknown } | null)?.format
  if (typeof format === 'number' && format > KEYSTORE_FORMAT) {
    throw new KeystoreError('format-too-new', '数据格式高于本程序支持的版本，请升级程序')
  }

  const parsed = diskSchema.safeParse(raw)
  if (!parsed.success) {
    throw new KeystoreError('corrupt', 'keystore.json 结构不完整或已损坏')
  }
  const d = parsed.data
  return {
    format: d.format,
    vaultId: d.vaultId,
    createdAt: d.createdAt,
    slots: {
      password: {
        kdf: {
          alg: 'argon2id',
          memoryKiB: d.slots.password.kdf.memoryKiB,
          iterations: d.slots.password.kdf.iterations,
          parallelism: d.slots.password.kdf.parallelism,
          salt: Buffer.from(d.slots.password.kdf.salt, 'base64'),
        },
        deviceSecret: Buffer.from(d.slots.password.deviceSecret, 'base64'),
        wrap: wrapFromDisk(d.slots.password.wrap),
      },
      dataKey: {
        kdf: {
          alg: 'HKDF-SHA256',
          salt: Buffer.from(d.slots.dataKey.kdf.salt, 'base64'),
        },
        wrap: wrapFromDisk(d.slots.dataKey.wrap),
      },
    },
  }
}

/** 读取 keystore.json；文件不存在返回 null。 */
export async function readKeystoreFile(path: string): Promise<Keystore | null> {
  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw e
  }
  return parseKeystore(text)
}

/**
 * 写入 keystore.json。先把现有版本另存为 keystore.prev.json，再原子替换（设计文档 8.6）。
 */
export async function writeKeystoreFile(path: string, ks: Keystore): Promise<void> {
  await keepPreviousCopy(path, join(dirname(path), 'keystore.prev.json'))
  await atomicWriteText(path, serializeKeystore(ks))
}
