// PwVault 界面原型：图标、示例数据、公共布局片段（仅用于生成示例图，不是产品代码）
// 示例数据均为虚构：IP 为内网保留段，域名为 example.internal。

const P = {
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  folderOpen: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  drive: '<path d="M22 12H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M6 16h.01"/><path d="M10 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  arrowL: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  pkg: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
  folderIn: '<path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><path d="M2 13h10"/><path d="m9 16 3-3-3-3"/>',
};

function I(n, s = 16, cls = '') {
  return `<svg class="i ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg>`;
}

const LOGO = (s = 18) =>
  `<svg class="i" width="${s}" height="${s}" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0F766E"/><path fill="#fff" fill-rule="evenodd" d="M16 7a5.2 5.2 0 0 0-5.2 5.2V15h-.3A1.5 1.5 0 0 0 9 16.5v6.2a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-6.2a1.5 1.5 0 0 0-1.5-1.5h-.3v-2.8A5.2 5.2 0 0 0 16 7Zm-2.7 8v-2.8a2.7 2.7 0 0 1 5.4 0V15ZM16 17.8a1.6 1.6 0 0 0-.8 3v1.4h1.6v-1.4a1.6 1.6 0 0 0-.8-3Z"/></svg>`;

const CAP = `<div class="cap">
  <span><svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" stroke-width="1"/></svg></span>
  <span><svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1"/></svg></span>
  <span><svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10" stroke="currentColor" stroke-width="1"/></svg></span>
</div>`;

function titlebar({ search = true } = {}) {
  return `<div class="tb">
    <div class="tb-l">${LOGO(18)}<span class="name">PwVault</span></div>
    <div>${search ? `<div class="srch">${I('search', 14)}<span>搜索条目、地址、文档…</span><span class="kbd">Ctrl K</span></div>` : ''}</div>
    <div class="tb-r">${search ? `<span class="tb-btn">${I('lock', 14)}锁定</span>` : ''}${CAP}</div>
  </div>`;
}

function sidebar() {
  const row = (pad, chev, icon, label, cnt, on) =>
    `<div class="row${on ? ' on' : ''}" style="padding-left:${8 + pad * 16}px">` +
    (chev === null ? '' : chev ? I(chev, 14, 'chev') : '<span style="width:14px"></span>') +
    I(icon, 15, 'fi') + `<span>${label}</span>` + (cnt !== '' ? `<span class="cnt">${cnt}</span>` : '') + `</div>`;
  const type = (color, label, cnt) => `<div class="row"><span class="dot" style="background:${color}"></span><span>${label}</span><span class="cnt">${cnt}</span></div>`;
  return `<div class="sb">
    ${row(0, null, 'layers', '全部条目', 75)}
    ${row(0, null, 'star', '收藏', 9)}
    ${row(0, null, 'clock', '最近使用', '')}
    <h6><span>目录</span>${I('plus', 13)}</h6>
    ${row(0, 'chevD', 'folderOpen', '公司', '')}
    ${row(1, 'chevR', 'folder', '办公系统', 6)}
    ${row(1, 'chevD', 'folderOpen', '研发环境', '')}
    ${row(2, '', 'folder', '开发环境 DEV', 14)}
    ${row(2, '', 'folderOpen', '测试环境 SIT', 11, true)}
    ${row(2, '', 'folder', '生产环境 PROD', 9)}
    ${row(1, 'chevR', 'folder', '运维文档', 7)}
    ${row(0, 'chevD', 'folderOpen', '个人', '')}
    ${row(1, '', 'folder', '网站账号', 23)}
    ${row(1, '', 'folder', '金融理财', 5)}
    ${row(0, '', 'trash', '回收站', 2)}
    <h6><span>分类</span></h6>
    ${type('#0F766E', '账号密码', 34)}
    ${type('#1D4ED8', '服务地址', 15)}
    ${type('#B45309', '运维环境', 17)}
    ${type('#6741C0', 'Markdown 文档', 9)}
    <h6><span>标签</span></h6>
    <div class="tags"><span class="tag">数据库</span><span class="tag">Linux</span><span class="tag">中间件</span><span class="tag">VPN</span><span class="tag">生产</span></div>
    <div class="sb-f"><div class="ava">W</div><div class="u"><b>wencong</b><span>已解锁 · 空闲 5 分钟锁定</span></div><span class="sp"></span><span class="ib">${I('settings', 16)}</span></div>
  </div>`;
}

const ITEMS = [
  { k: 'env', ic: 'database', t: 'SIT-MySQL 主库', s: '10.20.30.11:3306 · app_rw', star: 1 },
  { k: 'env', ic: 'database', t: 'SIT-Redis 集群', s: '10.20.30.21:6379' },
  { k: 'env', ic: 'server', t: 'SIT 应用服务器 01', s: '10.20.30.101 · deploy' },
  { k: 'env', ic: 'server', t: 'SIT 应用服务器 02', s: '10.20.30.102 · deploy' },
  { k: 'svc', ic: 'globe', t: 'Nacos 控制台', s: 'nacos.sit.example.internal:8848', star: 1 },
  { k: 'svc', ic: 'globe', t: 'Jenkins 构建平台', s: 'ci.example.internal' },
  { k: 'svc', ic: 'globe', t: 'Kibana 日志平台', s: 'kibana.sit.example.internal' },
  { k: 'acc', ic: 'key', t: '网关管理后台', s: 'admin' },
  { k: 'acc', ic: 'key', t: 'RabbitMQ 管理台', s: 'mq_admin' },
  { k: 'doc', ic: 'file', t: 'SIT 环境部署手册', s: 'Markdown · 更新于 11-12' },
  { k: 'doc', ic: 'file', t: '常见故障排查记录', s: 'Markdown · 更新于 10-28' },
];

function listPane(sel = 0) {
  return `<div class="lp">
    <div class="lp-h">
      <div class="crumb">公司 / 研发环境</div>
      <div class="lp-t"><b>测试环境 SIT</b><span class="n">11 项</span><span class="sp"></span>
        <span class="ib">${I('sort', 15)}</span><span class="btn p sm">${I('plus', 14)}新建</span></div>
    </div>
    ${ITEMS.map((it, i) => `<div class="it${i === sel ? ' on' : ''}"><div class="ti ${it.k}">${I(it.ic, 17)}</div>
      <div class="m"><div class="t">${it.t}</div><div class="s">${it.s}</div></div>${it.star ? `<span class="star">${I('star', 14)}</span>` : ''}</div>`).join('')}
  </div>`;
}

function appShell(right, { sel = 0, overlay = '' } = {}) {
  return `<div class="win">${titlebar()}<div class="app">${sidebar()}${listPane(sel)}${right}</div>${overlay}</div>`;
}

function settingsShell(active, content) {
  const nav = [['monitor', '通用'], ['shield', '安全'], ['drive', '数据与迁移'], ['refresh', '更新'], ['info', '关于']];
  return `<div class="win">${titlebar({ search: false })}<div class="set">
    <div class="set-n">
      <div class="row mut" style="margin-bottom:2px">${I('arrowL', 15)}<span>返回</span></div>
      <div class="ttl">设置</div>
      ${nav.map(([ic, t]) => `<div class="row${t === active ? ' on' : ''}">${I(ic, 15, 'fi')}<span>${t}</span></div>`).join('')}
    </div>
    <div class="set-c"><div class="in">${content}</div></div>
  </div></div>`;
}
