import { z } from 'zod'
import { MIN_PASSWORD_LENGTH } from '../crypto/keystore'

/**
 * user.json（设计文档 4.1.1）。
 *
 * 首次初始化前文件含 initialPassword；初始化成功后程序重写文件，只保留 username。
 * 模板的 initialPassword 为空字符串，程序把空值视为“尚未填写”，绝不把模板文字当作密码。
 */

const schema = z.object({
  username: z.string().trim().min(1, '用户名不能为空'),
  initialPassword: z.string().optional(),
})

export interface UserFile {
  username: string
  initialPassword?: string
}

export type UserFileReadResult =
  | { kind: 'missing' }
  | { kind: 'invalid'; reason: string }
  | { kind: 'ok'; user: UserFile }

export function parseUserFile(text: string | null): UserFileReadResult {
  if (text === null) return { kind: 'missing' }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { kind: 'invalid', reason: 'user.json 不是合法的 JSON' }
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { kind: 'invalid', reason: parsed.error.issues[0]?.message ?? 'user.json 结构不正确' }
  }
  const user: UserFile = { username: parsed.data.username }
  if (parsed.data.initialPassword !== undefined && parsed.data.initialPassword !== '') {
    user.initialPassword = parsed.data.initialPassword
  }
  return { kind: 'ok', user }
}

/** “生成模板文件”按钮写入的内容。 */
export function userFileTemplate(): string {
  return (
    JSON.stringify(
      {
        username: '',
        initialPassword: '',
      },
      null,
      2,
    ) + '\n'
  )
}

/** 初始化完成后重写的 user.json：只保留用户名，不含密码。 */
export function userFileAfterInit(username: string): string {
  return JSON.stringify({ username }, null, 2) + '\n'
}

export function checkInitialPassword(password: string): string | null {
  if (Array.from(password).length < MIN_PASSWORD_LENGTH) {
    return `初始密码至少 ${MIN_PASSWORD_LENGTH} 位，建议 12 位以上`
  }
  return null
}
