import { hkdfSync } from 'node:crypto'
import { hashRaw } from '@node-rs/argon2'

// @node-rs/argon2 的 Algorithm / Version 是 const enum，isolatedModules 下不能取值，
// 这里直接使用其定义的数值：Algorithm.Argon2id = 2，Version.V0x13 = 1。
const ARGON2ID = 2
const ARGON2_VERSION_0X13 = 1

/** Argon2id 参数。写入 keystore.json，便于将来调高。 */
export interface Argon2Params {
  memoryKiB: number
  iterations: number
  parallelism: number
}

/** 设计文档 5.4：64 MiB、3 次迭代、并行度 4。 */
export const DEFAULT_ARGON2: Argon2Params = {
  memoryKiB: 64 * 1024,
  iterations: 3,
  parallelism: 4,
}

export async function deriveArgon2id(
  password: Buffer,
  salt: Buffer,
  params: Argon2Params,
): Promise<Buffer> {
  const out = await hashRaw(password, {
    algorithm: ARGON2ID,
    version: ARGON2_VERSION_0X13,
    salt,
    memoryCost: params.memoryKiB,
    timeCost: params.iterations,
    parallelism: params.parallelism,
    outputLen: 32,
  })
  return Buffer.from(out)
}

export function hkdfSha256(ikm: Buffer, salt: Buffer, info: string): Buffer {
  return Buffer.from(hkdfSync('sha256', ikm, salt, Buffer.from(info, 'utf8'), 32))
}

/** 把敏感缓冲区清零。调用方负责不再使用它。 */
export function wipe(...buffers: Buffer[]): void {
  for (const b of buffers) b.fill(0)
}
