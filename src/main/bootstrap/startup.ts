import type { UserFileReadResult } from './userfile'
import { checkInitialPassword } from './userfile'

/**
 * 启动状态判定（设计文档 3.3 节流程图）。纯函数，便于测试。
 *
 * 返回的 state 与接口 app:getState 的取值一一对应：
 *   no-user        未配置用户页
 *   locked         登录页
 *   foreign-data   导入向导
 *   initialize     需要执行初始化（由调用方完成后进入 datakey-pending）
 */

export type StartupDecision =
  | { state: 'no-user'; reason: string }
  | { state: 'init-rejected'; reason: string }
  | { state: 'initialize'; username: string; initialPassword: string; ignoredInitialPassword: false }
  | { state: 'locked'; ignoredInitialPassword: boolean }
  | { state: 'foreign-data'; ignoredInitialPassword: boolean }

export interface StartupInput {
  /** 数据目录下是否存在 keystore.json */
  keystoreExists: boolean
  /** 本机能否解开设备密钥。仅在 keystoreExists 为 true 时有意义 */
  deviceBound: boolean
  userFile: UserFileReadResult
}

export function decideStartup(input: StartupInput): StartupDecision {
  const { userFile } = input
  const hasInitialPassword = userFile.kind === 'ok' && userFile.user.initialPassword !== undefined

  if (!input.keystoreExists) {
    if (userFile.kind === 'missing') {
      return { state: 'no-user', reason: '未找到 user.json' }
    }
    if (userFile.kind === 'invalid') {
      return { state: 'no-user', reason: userFile.reason }
    }
    if (userFile.user.initialPassword === undefined) {
      return { state: 'no-user', reason: 'user.json 中尚未填写初始密码' }
    }
    const weak = checkInitialPassword(userFile.user.initialPassword)
    if (weak) {
      return { state: 'init-rejected', reason: weak }
    }
    return {
      state: 'initialize',
      username: userFile.user.username,
      initialPassword: userFile.user.initialPassword,
      ignoredInitialPassword: false,
    }
  }

  // 已有 keystore：文件里残留的初始密码一律忽略（设计文档 4.1.1）
  const ignoredInitialPassword = hasInitialPassword
  return input.deviceBound
    ? { state: 'locked', ignoredInitialPassword }
    : { state: 'foreign-data', ignoredInitialPassword }
}
