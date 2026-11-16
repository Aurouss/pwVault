import { describe, expect, it } from 'vitest'
import { decideStartup } from '../../../src/main/bootstrap/startup'
import {
  checkInitialPassword,
  parseUserFile,
  userFileAfterInit,
  userFileTemplate,
} from '../../../src/main/bootstrap/userfile'

describe('user.json 解析', () => {
  it('文件不存在', () => {
    expect(parseUserFile(null)).toEqual({ kind: 'missing' })
  })

  it('合法内容', () => {
    const r = parseUserFile(JSON.stringify({ username: 'wencong', initialPassword: 'long enough pwd' }))
    expect(r).toEqual({ kind: 'ok', user: { username: 'wencong', initialPassword: 'long enough pwd' } })
  })

  it('模板文件被视为未填写密码（空字符串不当作密码）', () => {
    const r = parseUserFile(userFileTemplate())
    expect(r.kind).toBe('invalid') // 用户名为空，本身不合法
    const withName = parseUserFile(userFileTemplate().replace('"username": ""', '"username": "wencong"'))
    expect(withName).toEqual({ kind: 'ok', user: { username: 'wencong' } })
  })

  it('JSON 损坏、缺用户名均报 invalid', () => {
    expect(parseUserFile('{').kind).toBe('invalid')
    expect(parseUserFile(JSON.stringify({ initialPassword: 'x'.repeat(12) })).kind).toBe('invalid')
  })

  it('初始化后的文件只保留用户名', () => {
    const text = userFileAfterInit('wencong')
    expect(JSON.parse(text)).toEqual({ username: 'wencong' })
    expect(text).not.toMatch(/initialPassword/)
  })
})

describe('初始密码检查', () => {
  it('少于 8 位拒绝', () => {
    expect(checkInitialPassword('1234567')).not.toBeNull()
    expect(checkInitialPassword('12345678')).toBeNull()
  })

  it('按字符计数而非字节', () => {
    expect(checkInitialPassword('一二三四五六七')).not.toBeNull()
    expect(checkInitialPassword('一二三四五六七八')).toBeNull()
  })
})

describe('启动状态判定（设计文档 3.3）', () => {
  const ok = (initialPassword?: string) => ({
    kind: 'ok' as const,
    user: initialPassword === undefined ? { username: 'wencong' } : { username: 'wencong', initialPassword },
  })

  it('无 keystore、无 user.json → no-user', () => {
    expect(
      decideStartup({ keystoreExists: false, deviceBound: false, userFile: { kind: 'missing' } }).state,
    ).toBe('no-user')
  })

  it('无 keystore、user.json 没有初始密码 → no-user', () => {
    expect(decideStartup({ keystoreExists: false, deviceBound: false, userFile: ok() }).state).toBe('no-user')
  })

  it('无 keystore、初始密码太短 → init-rejected', () => {
    expect(
      decideStartup({ keystoreExists: false, deviceBound: false, userFile: ok('short') }).state,
    ).toBe('init-rejected')
  })

  it('无 keystore、有合格初始密码 → initialize', () => {
    const d = decideStartup({ keystoreExists: false, deviceBound: false, userFile: ok('long enough pwd') })
    expect(d).toEqual({
      state: 'initialize',
      username: 'wencong',
      initialPassword: 'long enough pwd',
      ignoredInitialPassword: false,
    })
  })

  it('有 keystore 且本机可解 → locked', () => {
    expect(decideStartup({ keystoreExists: true, deviceBound: true, userFile: ok() })).toEqual({
      state: 'locked',
      ignoredInitialPassword: false,
    })
  })

  it('有 keystore 且本机不可解（其他设备的数据）→ foreign-data', () => {
    expect(decideStartup({ keystoreExists: true, deviceBound: false, userFile: ok() }).state).toBe('foreign-data')
  })

  it('有 keystore 时残留的初始密码被忽略并标记', () => {
    const d = decideStartup({ keystoreExists: true, deviceBound: true, userFile: ok('long enough pwd') })
    expect(d).toEqual({ state: 'locked', ignoredInitialPassword: true })
  })
})
