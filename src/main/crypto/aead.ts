import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/** AES-256-GCM 封装。每次加密使用新的随机 nonce。 */

export const KEY_BYTES = 32
const NONCE_BYTES = 12
const TAG_BYTES = 16

export interface Sealed {
  nonce: Buffer
  /** 密文与 16 字节认证标签的拼接 */
  ciphertext: Buffer
}

export class AeadError extends Error {
  constructor() {
    super('解封失败')
    this.name = 'AeadError'
  }
}

function assertKey(key: Buffer): void {
  if (key.length !== KEY_BYTES) {
    throw new RangeError(`密钥必须为 ${KEY_BYTES} 字节`)
  }
}

export function seal(key: Buffer, plaintext: Buffer, aad: Buffer): Sealed {
  assertKey(key)
  const nonce = randomBytes(NONCE_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key, nonce, { authTagLength: TAG_BYTES })
  cipher.setAAD(aad)
  const body = Buffer.concat([cipher.update(plaintext), cipher.final()])
  return { nonce, ciphertext: Buffer.concat([body, cipher.getAuthTag()]) }
}

export function open(key: Buffer, sealed: Sealed, aad: Buffer): Buffer {
  assertKey(key)
  if (sealed.nonce.length !== NONCE_BYTES || sealed.ciphertext.length < TAG_BYTES) {
    throw new AeadError()
  }
  const body = sealed.ciphertext.subarray(0, sealed.ciphertext.length - TAG_BYTES)
  const tag = sealed.ciphertext.subarray(sealed.ciphertext.length - TAG_BYTES)
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, sealed.nonce, { authTagLength: TAG_BYTES })
    decipher.setAAD(aad)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(body), decipher.final()])
  } catch {
    throw new AeadError()
  }
}
