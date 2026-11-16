import { safeStorage } from 'electron'
import type { DeviceProtector } from './keystore'
import { KeystoreError } from './keystore'

/**
 * 设备密钥保护：Electron safeStorage（Windows 上即 DPAPI，绑定当前 Windows 用户）。
 * Electron 45 已弃用同步接口，这里统一使用异步接口。
 */
export function createSafeStorageProtector(): DeviceProtector {
  return {
    async protect(secret: Buffer): Promise<Buffer> {
      if (!(await safeStorage.isAsyncEncryptionAvailable())) {
        throw new KeystoreError('device-unavailable', '系统不提供加密存储，无法保护设备密钥')
      }
      const encrypted = await safeStorage.encryptStringAsync(secret.toString('base64'))
      return Buffer.from(encrypted)
    },
    async unprotect(blob: Buffer): Promise<Buffer> {
      // shouldReEncrypt 表示系统密钥已轮换，理论上应重新保存一次。
      // 目前 keystore 的设备密钥只在改密码、恢复时重写，这一点在 M1 验收时补上。
      const { result } = await safeStorage.decryptStringAsync(blob)
      return Buffer.from(result, 'base64')
    },
  }
}
