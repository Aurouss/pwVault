import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { crc16, decodeDataKey, DataKeyError, encodeDataKey } from '../../../src/main/crypto/datakey'

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function expectReason(fn: () => unknown, reason: string) {
  try {
    fn()
  } catch (e) {
    expect(e).toBeInstanceOf(DataKeyError)
    expect((e as DataKeyError).reason).toBe(reason)
    return
  }
  throw new Error('应当抛出 DataKeyError')
}

describe('crc16/CCITT-FALSE', () => {
  it('标准测试向量 "123456789" → 0x29B1', () => {
    expect(crc16(Buffer.from('123456789', 'ascii'))).toBe(0x29b1)
  })
})

describe('数据密钥编码', () => {
  it('输出 11 组、每组 5 个字符，字符集不含 I L O U', () => {
    const text = encodeDataKey(randomBytes(32))
    const groups = text.split('-')
    expect(groups).toHaveLength(11)
    for (const g of groups) expect(g).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}$/)
  })

  it('编码后解码得到原密钥（多次随机）', () => {
    for (let i = 0; i < 50; i++) {
      const key = randomBytes(32)
      expect(decodeDataKey(encodeDataKey(key)).equals(key)).toBe(true)
    }
  })

  it('容忍小写、空格、缺少连字符', () => {
    const key = randomBytes(32)
    const text = encodeDataKey(key)
    expect(decodeDataKey(text.toLowerCase()).equals(key)).toBe(true)
    expect(decodeDataKey(text.replace(/-/g, ' ')).equals(key)).toBe(true)
    expect(decodeDataKey(text.replace(/-/g, '')).equals(key)).toBe(true)
  })

  it('易混淆字符：I、L 视为 1，O 视为 0', () => {
    const key = randomBytes(32)
    const text = encodeDataKey(key)
    // 字母表本身不含 I、O，所以 1→I、0→O 不会与原字符冲突，解码必须还原
    const asI_O = text.replace(/1/g, 'I').replace(/0/g, 'O')
    expect(decodeDataKey(asI_O).equals(key)).toBe(true)
    const asL_o = text.replace(/1/g, 'L').replace(/0/g, 'o')
    expect(decodeDataKey(asL_o).equals(key)).toBe(true)
  })

  it('任意单个字符被抄错都能被发现（穷举每个位置与每个替换字符）', () => {
    const text = encodeDataKey(randomBytes(32)).replace(/-/g, '')
    for (let pos = 0; pos < text.length; pos++) {
      for (const ch of ALPHABET) {
        if (ch === text[pos]) continue
        const broken = text.slice(0, pos) + ch + text.slice(pos + 1)
        expect(() => decodeDataKey(broken), `位置 ${pos} 替换为 ${ch}`).toThrow(DataKeyError)
      }
    }
  })

  it('字符数不对报 length', () => {
    const text = encodeDataKey(randomBytes(32)).replace(/-/g, '')
    expect(() => decodeDataKey(text.slice(1))).toThrowError(DataKeyError)
    expectReason(() => decodeDataKey(text.slice(1)), 'length')
  })

  it('非字母表字符（如 U）报 alphabet', () => {
    const text = encodeDataKey(randomBytes(32)).replace(/-/g, '')
    const bad = 'U' + text.slice(1)
    expectReason(() => decodeDataKey(bad), 'alphabet')
  })

  it('非 32 字节的输入被拒绝', () => {
    expect(() => encodeDataKey(Buffer.alloc(31))).toThrow(RangeError)
  })
})
