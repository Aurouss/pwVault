import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_ARGON2 } from '../../../src/main/crypto/kdf'
import {
  parseKeystore,
  readKeystoreFile,
  serializeKeystore,
  writeKeystoreFile,
} from '../../../src/main/crypto/keystore-file'
import {
  createKeystore,
  KeystoreError,
  unlockWithPassword,
  type DeviceProtector,
} from '../../../src/main/crypto/keystore'
import { open, seal } from '../../../src/main/crypto/aead'
import { randomBytes } from 'node:crypto'

const FAST = { memoryKiB: 64, iterations: 1, parallelism: 1 }

class FakeDevice implements DeviceProtector {
  private readonly key = randomBytes(32)
  async protect(secret: Buffer) {
    const s = seal(this.key, secret, Buffer.from('device'))
    return Buffer.concat([s.nonce, s.ciphertext])
  }
  async unprotect(blob: Buffer) {
    return open(this.key, { nonce: blob.subarray(0, 12), ciphertext: blob.subarray(12) }, Buffer.from('device'))
  }
}

let dir: string
let file: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'pwvault-test-'))
  file = join(dir, 'keystore.json')
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('keystore.json 读写', () => {
  it('文件不存在时返回 null', async () => {
    expect(await readKeystoreFile(file)).toBeNull()
  })

  it('写入后读回，序列化结果逐字节一致', async () => {
    const device = new FakeDevice()
    const { keystore, mk } = await createKeystore({ password: 'roundtrip pwd', device, params: FAST })
    await writeKeystoreFile(file, keystore)

    const loaded = await readKeystoreFile(file)
    expect(loaded).not.toBeNull()
    expect(serializeKeystore(loaded!)).toBe(await readFile(file, 'utf8'))
    expect((await unlockWithPassword(loaded!, 'roundtrip pwd', device)).equals(mk)).toBe(true)
  })

  it('文件中不含任何明文密钥或密码', async () => {
    const device = new FakeDevice()
    const password = 'plaintext-probe-123'
    const { keystore, mk, dataKey } = await createKeystore({ password, device, params: FAST })
    await writeKeystoreFile(file, keystore)
    const raw = await readFile(file)
    expect(raw.includes(Buffer.from(password))).toBe(false)
    expect(raw.includes(mk)).toBe(false)
    expect(raw.includes(dataKey)).toBe(false)
    expect(raw.toString('utf8').includes(mk.toString('base64'))).toBe(false)
  })

  it('再次写入时保留上一版为 keystore.prev.json，且不残留临时文件', async () => {
    const device = new FakeDevice()
    const { keystore } = await createKeystore({ password: 'first pass word', device, params: FAST })
    await writeKeystoreFile(file, keystore)
    await writeKeystoreFile(file, { ...keystore, createdAt: '2030-01-01T00:00:00.000Z' })

    const names = (await readdir(dir)).sort()
    expect(names).toEqual(['keystore.json', 'keystore.prev.json'])
    const prev = parseKeystore(await readFile(join(dir, 'keystore.prev.json'), 'utf8'))
    expect(prev.createdAt).toBe(keystore.createdAt)
  })

  it('JSON 损坏 → corrupt', () => {
    expect(() => parseKeystore('{ not json')).toThrowError(KeystoreError)
    try {
      parseKeystore('{ not json')
    } catch (e) {
      expect((e as KeystoreError).code).toBe('corrupt')
    }
  })

  it('结构缺字段 → corrupt', async () => {
    const device = new FakeDevice()
    const { keystore } = await createKeystore({ password: 'missing field', device, params: FAST })
    const obj = JSON.parse(serializeKeystore(keystore))
    delete obj.slots.dataKey
    await writeFile(file, JSON.stringify(obj))
    await expect(readKeystoreFile(file)).rejects.toBeInstanceOf(KeystoreError)
  })

  it('格式版本高于程序支持 → format-too-new', () => {
    try {
      parseKeystore(JSON.stringify({ format: 99 }))
      throw new Error('应当拒绝')
    } catch (e) {
      expect((e as KeystoreError).code).toBe('format-too-new')
    }
  })
})
