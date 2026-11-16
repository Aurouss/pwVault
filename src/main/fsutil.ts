import { copyFile, open, rename, stat, unlink } from 'node:fs/promises'

/**
 * 原子写入：写临时文件 → 刷盘 → 原子替换（设计文档 8.6）。
 * 写入中断时原文件保持不变。
 */
export async function atomicWriteText(path: string, text: string): Promise<void> {
  const tmp = `${path}.tmp`
  const handle = await open(tmp, 'w')
  try {
    await handle.writeFile(text, 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
  try {
    await rename(tmp, path)
  } catch (e) {
    await unlink(tmp).catch(() => undefined)
    throw e
  }
}

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/** 把现有文件另存一份（如 keystore.prev.json）。文件不存在时什么也不做。 */
export async function keepPreviousCopy(path: string, prevPath: string): Promise<void> {
  if (await exists(path)) {
    await copyFile(path, prevPath)
  }
}
