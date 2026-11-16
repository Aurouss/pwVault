/**
 * 数据密钥的编码（设计文档 8.2）。
 *
 * payload = dataKey(32 字节) ‖ CRC-16/CCITT-FALSE(dataKey)(2 字节, 大端)  共 34 字节
 * 文本    = Crockford Base32(payload ‖ 3 个零填充位)  共 55 个字符，每 5 个一组，共 11 组
 *
 * 填充位必须为零：否则最后一个字符的改动可能只落在填充位上而逃过校验。
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford，不含 I L O U
const DATA_BYTES = 32
const PAYLOAD_BYTES = DATA_BYTES + 2
const CHAR_COUNT = 55
const GROUP_SIZE = 5
const PAD_BITS = CHAR_COUNT * 5 - PAYLOAD_BYTES * 8 // 3

export type DataKeyErrorReason = 'length' | 'alphabet' | 'padding' | 'checksum'

export class DataKeyError extends Error {
  constructor(readonly reason: DataKeyErrorReason) {
    super(`数据密钥格式不正确：${reason}`)
    this.name = 'DataKeyError'
  }
}

export function crc16(data: Buffer): number {
  let crc = 0xffff
  for (const byte of data) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc
}

/** 返回带分组的展示文本，如 `ABCDE-FGHJK-…`（11 组）。 */
export function encodeDataKey(dataKey: Buffer): string {
  if (dataKey.length !== DATA_BYTES) {
    throw new RangeError(`数据密钥必须为 ${DATA_BYTES} 字节`)
  }
  const checksum = crc16(dataKey)
  const payload = Buffer.concat([dataKey, Buffer.from([checksum >> 8, checksum & 0xff])])
  let value = BigInt('0x' + payload.toString('hex')) << BigInt(PAD_BITS)

  let text = ''
  for (let i = 0; i < CHAR_COUNT; i++) {
    const shift = BigInt(5 * (CHAR_COUNT - 1 - i))
    text += ALPHABET[Number((value >> shift) & 31n)]
  }
  const groups: string[] = []
  for (let i = 0; i < CHAR_COUNT; i += GROUP_SIZE) {
    groups.push(text.slice(i, i + GROUP_SIZE))
  }
  return groups.join('-')
}

/** 解码用户输入。容忍空格、连字符、大小写，并把 I、L 视为 1、O 视为 0。 */
export function decodeDataKey(input: string): Buffer {
  const normalized = input
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0')

  if (normalized.length !== CHAR_COUNT) {
    throw new DataKeyError('length')
  }

  let value = 0n
  for (const ch of normalized) {
    const idx = ALPHABET.indexOf(ch)
    if (idx < 0) throw new DataKeyError('alphabet')
    value = value * 32n + BigInt(idx)
  }

  if (value & ((1n << BigInt(PAD_BITS)) - 1n)) {
    throw new DataKeyError('padding')
  }

  const payload = Buffer.from(
    (value >> BigInt(PAD_BITS)).toString(16).padStart(PAYLOAD_BYTES * 2, '0'),
    'hex',
  )
  const dataKey = payload.subarray(0, DATA_BYTES)
  const stored = payload.readUInt16BE(DATA_BYTES)
  if (crc16(dataKey) !== stored) {
    throw new DataKeyError('checksum')
  }
  return Buffer.from(dataKey)
}
