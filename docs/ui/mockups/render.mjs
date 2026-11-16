// 把 HTML 原型渲染成 PNG 示例图。零依赖：调用本机 Edge / Chrome 的无头模式截图。
// 用法：node docs/ui/mockups/render.mjs [页面名 ...]   （不带参数则渲染全部）
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '..');
const WIDTH = 1280, HEIGHT = 800, SCALE = 2;

const browser = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find(existsSync);
if (!browser) throw new Error('未找到 Edge 或 Chrome，无法截图');

// 从 pages.js 读取页面清单（页面名 -> 输出文件名），避免在两处维护。
const ctx = vm.createContext({});
vm.runInContext(
  readFileSync(join(here, 'shared.js'), 'utf8') + '\n' + readFileSync(join(here, 'pages.js'), 'utf8') + '\nglobalThis.__pages = PAGES;',
  ctx,
);
const pages = Object.fromEntries(Object.entries(ctx.__pages).map(([k, v]) => [k, v.file]));

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(pages);
const profile = mkdtempSync(join(tmpdir(), 'pwvault-mock-'));
let failed = 0;

function shoot(url, out, width, height, scale) {
  const res = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, `--force-device-scale-factor=${scale}`, `--window-size=${width},${height}`,
    `--screenshot=${out}`, url,
  ], { timeout: 90_000 });
  return res.status === 0 && existsSync(out);
}

try {
  for (const name of names) {
    if (name === 'overview') continue;
    if (!pages[name]) { console.error(`未知页面：${name}`); failed++; continue; }
    const out = join(outDir, pages[name]);
    if (existsSync(out)) rmSync(out);
    const ok = shoot(pathToFileURL(join(here, 'index.html')).href + `?p=${name}`, out, WIDTH, HEIGHT, SCALE);
    console.log(ok ? `ok    ${pages[name]}  ${(statSync(out).size / 1024).toFixed(0)} KB` : `FAIL  ${pages[name]}`);
    if (!ok) failed++;
  }
  // 总览图：把所有单页缩略图拼在一张图里，依赖上面已生成的 PNG。
  if (!wanted.length || wanted.includes('overview')) {
    const out = join(outDir, '00-overview.png');
    if (existsSync(out)) rmSync(out);
    const ok = shoot(pathToFileURL(join(here, 'overview.html')).href, out, 2000, 1872, 1);
    console.log(ok ? `ok    00-overview.png  ${(statSync(out).size / 1024).toFixed(0)} KB` : 'FAIL  00-overview.png');
    if (!ok) failed++;
  }
} finally {
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* 浏览器进程可能仍占用临时目录，忽略 */ }
}
process.exit(failed ? 1 : 0);
