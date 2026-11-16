import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { AeadError, open, seal } from '../../../src/main/crypto/aead'

describe('aead: AES-256-GCM', () => {
  const key = randomBytes(32)
  const aad = Buffer.from('aad-v1')
  const plain = Buffer.from('主密钥明文')

  it('解封得到原文', () => {
    const sealed = seal(key, plain, aad)
    expect(open(key, sealed, aad).equals(plain)).toBe(true)
  })

  it('同一明文两次加密得到不同的 nonce 与密文', () => {
    const a = seal(key, plain, aad)
    const b = seal(key, plain, aad)
    expect(a.nonce.equals(b.nonce)).toBe(false)
    expect(a.ciphertext.equals(b.ciphertext)).toBe(false)
  })

  it('密文被改动一个字节即解封失败', () => {
    const sealed = seal(key, plain, aad)
    sealed.ciphertext[0] ^= 0x01
    expect(() => open(key, sealed, aad)).toThrow(AeadError)
  })

  it('认证标签被改动即解封失败', () => {
    const sealed = seal(key, plain, aad)
    sealed.ciphertext[sealed.ciphertext.length - 1] ^= 0x01
    expect(() => open(key, sealed, aad)).toThrow(AeadError)
  })

  it('附加数据不同即解封失败', () => {
    const sealed = seal(key, plain, aad)
    expect(() => open(key, sealed, Buffer.from('aad-v2'))).toThrow(AeadError)
  })

  it('密钥不同即解封失败', () => {
    const sealed = seal(key, plain, aad)
    expect(() => open(randomBytes(32), sealed, aad)).toThrow(AeadError)
  })

  it('过短的密文直接拒绝', () => {
    const sealed = seal(key, plain, aad)
    expect(() => open(key, { nonce: sealed.nonce, ciphertext: Buffer.alloc(4) }, aad)).toThrow(
      AeadError,
    )
  })

  it('非 32 字节的密钥被拒绝', () => {
    expect(() => seal(Buffer.alloc(16), plain, aad)).toThrow(RangeError)
  })
})
