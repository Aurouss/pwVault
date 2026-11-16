// PwVault 界面原型：各页面内容（仅用于生成示例图，不是产品代码）

const DATA_DIR = String.raw`C:\Users\wencong\AppData\Roaming\PwVault\data`;
const SRC_DIR = String.raw`D:\迁移\PwVault-data`;
const EXPORT_DIR = String.raw`D:\Export\PwVault-export-20261116`;
// 示例密钥（虚构）。字母表为 Crockford Base32：不含 I、L、O、U，避免抄写时混淆。
const KEY_GROUPS = ['7KQ2M', 'X4HTR', '9D3WB', 'FZ6NC', 'J8YPA', '2VE5G', 'VK0SH', 'R3C7T', 'M9XQ4', 'B6KDW', 'N2PF8'];

const fld = (l, v, acts, cls = '') =>
  `<div class="fld"><span class="l">${l}</span><span class="v ${cls}">${v}</span><span class="a">${acts.map((a) => `<span class="ib">${I(a, 15)}</span>`).join('')}</span></div>`;

function detailPane(toast = true) {
  return `<div class="dp">
    <div class="dp-h"><div class="ti env lg">${I('database', 20)}</div>
      <div style="min-width:0"><h1>SIT-MySQL 主库</h1><div class="sub"><span class="badge env">运维环境</span><span>公司 / 研发环境 / 测试环境 SIT</span></div></div>
      <span class="sp"></span>
      <span class="ib star">${I('star', 17)}</span>
      <span class="btn">${I('edit', 14)}编辑</span>
      <span class="btn">${I('download', 14)}导出</span>
      <span class="ib">${I('more', 17)}</span>
    </div>
    <div class="dp-b">
      <div class="sec">连接信息</div>
      ${fld('主机地址', '10.20.30.11', ['copy'])}
      ${fld('端口', '3306', ['copy'])}
      ${fld('用户名', 'app_rw', ['copy'])}
      ${fld('密码', '<span class="pw">••••••••••••••</span>', ['eye', 'copy'])}
      ${fld('数据库', 'order_center', ['copy'])}
      ${fld('连接串', 'jdbc:mysql://10.20.30.11:3306/order_center', ['copy'])}
      <div class="fld"><span class="l">标签</span><span style="display:flex;gap:5px"><span class="tag">数据库</span><span class="tag">中间件</span></span><span></span></div>
      <div class="sec" style="margin-top:16px">备注</div>
      <div class="md">
        <h3>使用说明</h3>
        <ul><li>测试环境读写账号，<b>禁止</b>用于生产环境</li><li>每周日 02:00 全量备份，保留 7 天</li><li>账号到期前需在运维平台续期</li></ul>
        <h3>常用检查</h3>
        <pre><span class="k">SHOW</span> VARIABLES <span class="k">LIKE</span> <span class="st">'max_connections'</span>;
<span class="k">SHOW</span> PROCESSLIST;</pre>
      </div>
    </div>
    ${toast ? `<div style="position:absolute;left:50%;bottom:48px;transform:translateX(-50%);background:#1F2630;color:#fff;border-radius:8px;padding:7px 14px;font-size:12.5px;display:flex;gap:8px;align-items:center;white-space:nowrap;box-shadow:0 8px 24px rgba(10,16,28,.25)">
      ${I('check', 14)}已复制密码，30 秒后自动清除剪贴板</div>` : ''}
    <div class="dp-f"><span>创建于 2026-03-18</span><span>最后修改 2026-11-12 16:42</span><span class="sp"></span><span style="display:flex;gap:5px;align-items:center;color:var(--ac)">${I('shield', 13)}已加密存储</span></div>
  </div>`;
}

function editPane() {
  const r = (label, value, type, extra = '') => `<div style="display:grid;grid-template-columns:16px 112px 1fr 86px 26px;gap:8px;align-items:center;margin-bottom:8px">
    <span class="mut3">${I('grip', 14)}</span><div class="inp" style="height:30px">${label}</div>
    <div class="inp mono" style="height:30px;font-size:12.5px">${value}${extra}</div>
    <div class="sel" style="height:30px;justify-content:space-between">${type}${I('chevD', 13, 'mut3')}</div><span class="ib mut3">${I('trash', 14)}</span></div>`;
  return `<div class="dp">
    <div class="dp-h"><div><h1>编辑条目</h1><div class="sub">保存后立即加密写入 · Ctrl+S 保存 · Esc 取消</div></div>
      <span class="sp"></span><span class="btn">取消</span><span class="btn p">${I('check', 14)}保存</span></div>
    <div class="dp-b">
      <div class="lbl">标题</div><div class="inp">SIT-MySQL 主库</div>
      <div style="display:grid;grid-template-columns:200px 1fr;gap:12px;margin-top:10px">
        <div><div class="lbl">分类</div><div class="inp"><span class="dot" style="background:#B45309;margin:0"></span>运维环境<span class="end">${I('chevD', 14)}</span></div></div>
        <div><div class="lbl">所在目录</div><div class="inp">${I('folder', 14, 'mut3')}公司 / 研发环境 / 测试环境 SIT<span class="end">${I('chevD', 14)}</span></div></div>
      </div>
      <div class="lbl" style="margin-top:10px">标签</div>
      <div class="inp"><span class="tag">数据库 ×</span><span class="tag">中间件 ×</span><span class="ph">输入后回车添加</span></div>
      <div class="sec" style="margin-top:14px;display:flex;justify-content:space-between"><span>字段</span><span style="font-weight:400;letter-spacing:0">类型为“密码”的字段默认隐藏，且不参与检索</span></div>
      ${r('主机地址', '10.20.30.11', '文本')}
      ${r('端口', '3306', '文本')}
      ${r('用户名', 'app_rw', '文本')}
      ${r('密码', '<span class="pw">••••••••••••••</span>', '密码', `<span class="end">${I('eye', 15)}<span style="color:var(--ac);display:flex">${I('zap', 15)}</span></span>`)}
      ${r('数据库', 'order_center', '文本')}
      ${r('连接串', 'jdbc:mysql://10.20.30.11:3306/order_center', '网址')}
      <div style="display:flex;gap:8px;margin:2px 0 12px 24px"><span class="btn sm">${I('plus', 13)}添加字段</span><span class="btn sm">从模板添加${I('chevD', 13)}</span></div>
      <div class="lbl">备注（支持 Markdown）</div>
      <div class="codeblk" style="height:96px;background:#fff;border-color:#D5D9E0"><span class="hd">### 使用说明</span>
- 测试环境读写账号，**禁止**用于生产环境
- 每周日 02:00 全量备份，保留 7 天</div>
    </div>
    <div class="pop" style="right:66px;top:474px;width:300px;padding:14px 16px">
      <div style="font-weight:600;display:flex;align-items:center;gap:6px">${I('zap', 14)}密码生成器</div>
      <div class="inp mono" style="margin-top:10px;font-size:13px;background:#F6F7F9">v7#Kq2!mXz9@Lr4&amp;Tb8p<span class="end">${I('refresh', 14)}</span></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:12px"><span class="mut" style="font-size:12px">长度</span><div class="sld"><i style="width:45%"></i><b style="left:45%"></b></div><b class="mono">20</b></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-top:12px;font-size:12.5px">
        <span style="display:flex;gap:6px;align-items:center"><span class="cb on">${I('check', 11)}</span>大写 A-Z</span>
        <span style="display:flex;gap:6px;align-items:center"><span class="cb on">${I('check', 11)}</span>小写 a-z</span>
        <span style="display:flex;gap:6px;align-items:center"><span class="cb on">${I('check', 11)}</span>数字 0-9</span>
        <span style="display:flex;gap:6px;align-items:center"><span class="cb on">${I('check', 11)}</span>符号 !@#$</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:12px"><div class="bar" style="flex:1"><i style="width:92%"></i></div><span style="font-size:12px;color:var(--ok)">强度：很强</span></div>
      <div class="btn p" style="width:100%;justify-content:center;margin-top:12px">使用此密码</div>
    </div>
  </div>`;
}

function markdownPane() {
  const src = [
    ['hd', '# SIT 环境部署手册'], ['', ''],
    ['cm', '> 适用范围：订单中心 order-center 测试环境'], ['', ''],
    ['hd', '## 1. 环境清单'], ['', ''],
    ['', '| 角色 | 地址 | 说明 |'], ['cm', '| --- | --- | --- |'],
    ['', '| 应用 01 | 10.20.30.101 | 2C4G |'], ['', '| 应用 02 | 10.20.30.102 | 2C4G |'], ['', '| MySQL | 10.20.30.11 | 主库 |'], ['', ''],
    ['hd', '## 2. 发布步骤'], ['', ''],
    ['', '1. 在 Jenkins 触发 <span class="st">`order-center-sit`</span> 任务'], ['', '2. 登录应用服务器检查进程状态'], ['', ''],
    ['cm', '```bash'], ['st', 'ssh deploy@10.20.30.101'], ['st', 'systemctl status order-center'], ['cm', '```'], ['', ''],
    ['hd', '## 3. 注意事项'], ['', ''],
    ['', '- 发布窗口：工作日 12:00–13:30'], ['', '- 回滚：重新部署上一个构建号'],
  ];
  const tool = (inner) => `<span class="ib" style="font-weight:700;font-size:12.5px;color:var(--tx2)">${inner}</span>`;
  const seg = (t, on) => `<span style="padding:0 11px;height:24px;display:inline-flex;align-items:center;border-radius:5px;font-size:12.5px;${on ? 'background:#fff;font-weight:600;box-shadow:0 1px 2px rgba(10,16,28,.14)' : 'color:var(--tx2)'}">${t}</span>`;
  return `<div class="dp">
    <div class="dp-h"><div class="ti doc lg">${I('file', 20)}</div>
      <div style="min-width:0"><h1>SIT 环境部署手册</h1><div class="sub"><span class="badge" style="background:#EEE9FB;color:#5B36B0">Markdown 文档</span><span>公司 / 研发环境 / 测试环境 SIT</span></div></div>
      <span class="sp"></span>
      <span style="display:inline-flex;background:#ECEEF1;border-radius:7px;padding:3px">${seg('编辑')}${seg('分屏', 1)}${seg('预览')}</span>
      <span class="btn">${I('download', 14)}导出</span>
      <span class="ib">${I('more', 17)}</span>
    </div>
    <div style="height:36px;display:flex;align-items:center;gap:2px;padding:0 16px;border-bottom:1px solid var(--line);background:var(--soft)">
      ${tool('H1')}${tool('H2')}${tool('B')}${tool('<i>I</i>')}<span style="width:1px;height:16px;background:var(--line);margin:0 6px"></span>
      ${['list', 'code', 'link', 'image', 'table'].map((n) => `<span class="ib">${I(n, 15)}</span>`).join('')}
      <span class="sp"></span><span class="mut3" style="font-size:11.5px;display:flex;gap:5px;align-items:center">${I('check', 13)}已自动保存 16:42</span>
    </div>
    <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;min-height:0">
      <div style="border-right:1px solid var(--line);padding:12px 0;font:12px/1.72 var(--mono);overflow:hidden">
        ${src.map(([c, t], i) => `<div style="display:flex;white-space:pre"><span style="width:38px;text-align:right;padding-right:12px;color:#B3BAC6;flex:none">${i + 1}</span><span class="${c}">${t || ' '}</span></div>`).join('')}
      </div>
      <div class="md" style="padding:14px 20px;overflow:hidden">
        <h1>SIT 环境部署手册</h1>
        <blockquote>适用范围：订单中心 order-center 测试环境</blockquote>
        <h2>1. 环境清单</h2>
        <table><tr><th>角色</th><th>地址</th><th>说明</th></tr><tr><td>应用 01</td><td>10.20.30.101</td><td>2C4G</td></tr><tr><td>应用 02</td><td>10.20.30.102</td><td>2C4G</td></tr><tr><td>MySQL</td><td>10.20.30.11</td><td>主库</td></tr></table>
        <h2>2. 发布步骤</h2>
        <ol><li>在 Jenkins 触发 <code>order-center-sit</code> 任务</li><li>登录应用服务器检查进程状态</li></ol>
        <pre>ssh deploy@10.20.30.101
systemctl status order-center</pre>
        <h2>3. 注意事项</h2>
        <ul><li>发布窗口：工作日 12:00–13:30</li><li>回滚：重新部署上一个构建号</li></ul>
      </div>
    </div>
    <div class="dp-f"><span>Markdown</span><span>26 行</span><span>第 15 行，第 9 列</span><span class="sp"></span><span style="display:flex;gap:5px;align-items:center;color:var(--ac)">${I('shield', 13)}已加密存储</span></div>
  </div>`;
}

function searchOverlay() {
  const res = (k, ic, t, s, on, hint = '') => `<div class="pal-i${on ? ' on' : ''}"><div class="ti ${k}">${I(ic, 17)}</div>
    <div style="min-width:0;flex:1"><div class="t">${t}</div><div class="s">${s}</div></div>${hint}</div>`;
  const chip = (t, on) => `<span class="tag${on ? ' a' : ''}" style="height:22px;padding:0 9px">${t}</span>`;
  return `<div class="ov"><div class="dlg" style="width:680px;margin-top:76px">
    <div class="pal-in">${I('search', 18, 'mut3')}<span>mysql</span><span class="caret" style="height:18px;margin-left:-8px"></span><span class="sp"></span><span class="kbd">Esc</span></div>
    <div style="display:flex;gap:6px;padding:9px 16px 3px;align-items:center">${chip('全部 5', 1)}${chip('账号密码')}${chip('服务地址')}${chip('运维环境 3')}${chip('文档 2')}
      <span class="sp"></span><span class="mut3" style="font-size:11.5px">范围：整个密码库</span></div>
    <div class="pal-g">条目</div>
    ${res('env', 'database', 'SIT-<mark>MySQL</mark> 主库', '公司 / 研发环境 / 测试环境 SIT · 10.20.30.11:3306 · app_rw', 1, '<span class="kbd">Enter 打开</span>')}
    ${res('env', 'database', 'DEV-<mark>MySQL</mark>', '公司 / 研发环境 / 开发环境 DEV · 10.20.10.11:3306 · dev_rw')}
    ${res('env', 'database', 'PROD-<mark>MySQL</mark> 只读库', '公司 / 研发环境 / 生产环境 PROD · 10.20.50.12:3306 · report_ro')}
    <div class="pal-g">文档内容</div>
    ${res('doc', 'file', 'SIT 环境部署手册', '…| <mark>MySQL</mark> | 10.20.30.11 | 主库 |…')}
    ${res('doc', 'file', '常见故障排查记录', '…<mark>MySQL</mark> 连接数打满时，先执行 SHOW PROCESSLIST 查看慢会话…')}
    <div class="dlg-f" style="margin-top:8px;font-size:11.5px;color:var(--tx2);gap:14px">
      <span><span class="kbd">↑</span> <span class="kbd">↓</span> 选择</span><span><span class="kbd">Enter</span> 打开</span>
      <span><span class="kbd">Ctrl U</span> 复制用户名</span><span><span class="kbd">Ctrl P</span> 复制密码</span>
      <span class="sp"></span><span class="mut3">密码类字段不参与检索</span></div>
  </div></div>`;
}

function exportOverlay() {
  const opt = (on, t, small) => `<div class="opt"><span class="rd${on ? ' on' : ''}"></span><div>${t}${small ? `<small>${small}</small>` : ''}</div></div>`;
  const chk = (on, t) => `<div class="opt"><span class="cb${on ? ' on' : ''}">${on ? I('check', 11) : ''}</span><div>${t}</div></div>`;
  return `<div class="ov" style="align-items:center"><div class="dlg" style="width:800px">
    <div class="dlg-h">${I('download', 17)}导出为 Markdown<span class="sp"></span><span class="ib">${I('x', 16)}</span></div>
    <div style="display:grid;grid-template-columns:1fr 310px">
      <div style="padding:14px 18px">
        <div class="sec">导出范围</div>
        ${opt(0, '仅当前条目', 'SIT-MySQL 主库')}
        ${opt(1, '当前目录及其子目录', '公司 / 研发环境（34 项）')}
        ${opt(0, '整个密码库', '全部 75 项')}
        <div class="sec">文件组织</div>
        ${opt(1, '每个条目一个 .md 文件，保留目录层级')}
        ${opt(0, '合并为单个 .md 文件')}
        <div class="sec">敏感字段</div>
        ${opt(1, '用 ****** 遮蔽（推荐）')}
        ${opt(0, '明文导出', '需要再次输入登录密码确认')}
        <div class="sec">其他</div>
        <div style="display:flex;gap:22px">${chk(1, '写入 YAML Front Matter')}${chk(1, '包含文档图片附件')}${chk(0, '打包为 zip')}</div>
        <div class="sec">导出到</div>
        <div style="display:flex;gap:8px"><div class="inp mono" style="flex:1;font-size:12px">${EXPORT_DIR}</div><span class="btn">浏览…</span></div>
      </div>
      <div style="border-left:1px solid var(--line);background:var(--soft);padding:14px 16px">
        <div class="sec">结果预览</div>
        <div class="mono" style="font-size:12px;line-height:1.8;white-space:pre;color:var(--tx2)">PwVault-export-20261116/
├─ README.md          <span class="mut3">索引</span>
└─ 研发环境/
   ├─ 开发环境 DEV/    <span class="mut3">14 个文件</span>
   ├─ 测试环境 SIT/
   │  ├─ SIT-MySQL 主库.md
   │  ├─ SIT-Redis 集群.md
   │  ├─ Nacos 控制台.md
   │  ├─ SIT 环境部署手册.md
   │  └─ …            <span class="mut3">共 11 个</span>
   └─ 生产环境 PROD/   <span class="mut3">9 个文件</span></div>
        <div class="note wn" style="margin-top:14px">${I('alert', 14)}<div>导出的 Markdown 文件<b>不加密</b>。请妥善保管，用后及时删除。</div></div>
      </div>
    </div>
    <div class="dlg-f"><span class="mut" style="font-size:12px">将导出 34 个条目，约 36 个文件</span><span class="sp"></span><span class="btn">取消</span><span class="btn p">${I('download', 14)}导出</span></div>
  </div></div>`;
}

const stageFoot = (extra = '') => `<div class="stage-f"><span style="display:flex;gap:5px;align-items:center">${I('drive', 13)}数据目录</span><span class="mono">${DATA_DIR}</span>${extra}<span>v1.0.0</span></div>`;

const PAGES = {
  login: {
    file: '01-login.png', title: '登录 / 解锁',
    html: () => `<div class="win">${titlebar({ search: false })}<div class="stage">
      <div class="card" style="width:384px;padding:32px 32px 24px;text-align:center">
        <div style="display:flex;justify-content:center">${LOGO(52)}</div>
        <div style="font-size:20px;font-weight:600;margin-top:12px">PwVault</div>
        <div class="mut" style="margin-top:2px">密码库已锁定，请输入登录密码</div>
        <div style="display:flex;align-items:center;gap:10px;background:#F5F6F8;border-radius:8px;padding:8px 12px;margin:20px 0 12px;text-align:left">
          <div class="ava" style="width:30px;height:30px">W</div>
          <div style="line-height:1.35"><b>wencong</b><div class="mut3" style="font-size:11.5px">用户由配置文件 user.json 定义</div></div>
        </div>
        <div class="inp f" style="height:38px">${I('lock', 15, 'mut3')}<span class="pw" style="font-size:15px">••••••••••</span><span class="caret"></span><span class="end">${I('eye', 16)}</span></div>
        <div class="btn p lg" style="width:100%;margin-top:12px">解锁</div>
        <div class="mut3" style="font-size:11.5px;margin-top:14px">连续输错 5 次后将延时重试　·　<span class="lnk">忘记密码？使用数据密钥恢复</span></div>
      </div>
      ${stageFoot('<span>·</span><span class="lnk">导入已有数据…</span><span>·</span>')}
    </div></div>`,
  },

  nouser: {
    file: '02-no-user-config.png', title: '首次启动：未配置用户',
    html: () => `<div class="win">${titlebar({ search: false })}<div class="stage">
      <div class="card" style="width:580px;padding:26px 30px 22px">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="ti lg" style="background:var(--wnw);color:var(--wn)">${I('user', 20)}</div>
          <div><div style="font-size:17px;font-weight:600">未检测到用户配置</div><div class="mut">本软件不提供注册入口，用户只能通过配置文件定义</div></div>
        </div>
        <div style="margin:16px 0 6px">在数据目录中创建 <b class="mono">user.json</b>，内容如下，保存后点击“重新检测”：</div>
        <div class="codeblk">{
  <span class="k">"username"</span>: <span class="st">"wencong"</span>,
  <span class="k">"initialPassword"</span>: <span class="st">"在此填写初始登录密码"</span>
}</div>
        <div class="note in" style="margin-top:10px">${I('info', 14)}<div>首次启动时程序读取初始密码完成加密初始化，随后<b>立即从文件中删除明文密码</b>，并生成数据密钥供你离线保存。</div></div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:14px">
          <div class="inp ro mono" style="flex:1;font-size:12px">${DATA_DIR}</div><span class="btn">${I('folderOpen', 14)}打开目录</span>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px;align-items:center">
          <span class="lnk" style="font-size:12.5px">已有数据？导入已有数据文件夹 →</span><span class="sp"></span>
          <span class="btn">生成模板文件</span><span class="btn p">${I('refresh', 14)}重新检测</span>
        </div>
      </div>
      <div class="stage-f"><span>v1.0.0</span></div>
    </div></div>`,
  },

  datakey: {
    file: '03-data-key.png', title: '初始化完成：保存数据密钥',
    html: () => `<div class="win">${titlebar({ search: false })}<div class="stage">
      <div class="card" style="width:620px;padding:26px 30px 22px">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="ti lg acc">${I('shield', 20)}</div>
          <div><div style="font-size:17px;font-weight:600">初始化完成，请保存你的数据密钥</div><div class="mut">数据密钥是登录密码之外的第二把钥匙，以下情况必须使用</div></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0">
          ${[['monitor', '迁移到新电脑'], ['refresh', '重装系统 / 更换 Windows 账户'], ['key', '忘记登录密码']].map(([ic, t]) => `<div style="display:flex;gap:7px;align-items:center;background:#F5F6F8;border-radius:8px;padding:8px 10px;font-size:12.5px"><span style="color:var(--ac);display:flex">${I(ic, 15)}</span>${t}</div>`).join('')}
        </div>
        <div class="keybox">${KEY_GROUPS.slice(0, 6).join(' - ')}<br>${KEY_GROUPS.slice(6).join(' - ')}</div>
        <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
          <span class="btn">${I('copy', 14)}复制</span><span class="btn">${I('download', 14)}另存为文本文件</span><span class="btn">${I('file', 14)}打印</span>
        </div>
        <div class="note wn" style="margin-top:14px">${I('alert', 14)}<div>请离线保存（打印或抄写），<b>不要与数据文件夹放在同一位置</b>。若数据密钥丢失且无法在本机登录，数据将<b>无法恢复</b>。之后可在“设置 › 数据与迁移”中凭登录密码再次查看。</div></div>
        <div style="display:flex;gap:10px;align-items:flex-end;margin-top:14px">
          <div style="flex:1"><div class="lbl">输入数据密钥的最后一组，确认已保存</div><div class="inp f mono" style="letter-spacing:1px">N2PF8<span class="caret"></span><span class="end" style="color:var(--ok)">${I('check', 15)}</span></div></div>
          <span class="btn p" style="height:32px">进入密码库</span>
        </div>
      </div>
      ${stageFoot('<span>·</span>')}
    </div></div>`,
  },

  main: { file: '04-main.png', title: '主界面：目录 / 列表 / 详情', html: () => appShell(detailPane()) },
  edit: { file: '05-entry-edit.png', title: '条目编辑与密码生成器', html: () => appShell(editPane()) },
  markdown: { file: '06-markdown-doc.png', title: 'Markdown 文档（分屏编辑）', html: () => appShell(markdownPane(), { sel: 9 }) },
  search: { file: '07-search.png', title: '全局检索（Ctrl+K）', html: () => appShell(detailPane(false), { overlay: searchOverlay() }) },
  export: { file: '08-export-markdown.png', title: 'Markdown 导出', html: () => appShell(detailPane(false), { overlay: exportOverlay() }) },

  security: {
    file: '09-settings-security.png', title: '设置 › 安全',
    html: () => {
      const row = (t, d, ctl) => `<div class="cd-r"><div class="g"><b style="font-weight:600">${t}</b><p>${d}</p></div>${ctl}</div>`;
      const sel = (t) => `<span class="sel">${t}${I('chevD', 13, 'mut3')}</span>`;
      const kv = (k, v) => `<div><div class="mut3" style="font-size:11.5px">${k}</div><div style="font-size:12.5px;font-weight:600">${v}</div></div>`;
      return settingsShell('安全', `<h2>安全</h2>
        <div class="cd">${row('登录密码', '用户名 <b class="mono">wencong</b> 由 user.json 定义，界面内不提供新增用户入口', '<span class="btn">修改登录密码…</span>')}</div>
        <div class="cd"><h4 class="grp">自动锁定</h4>
          ${row('空闲自动锁定', '超过设定时间无键鼠操作后锁定密码库', sel('5 分钟'))}
          ${row('系统锁屏或休眠时锁定', 'Win+L、合盖、休眠时立即锁定并清除内存中的密钥', '<span class="tg on"></span>')}
          ${row('最小化到托盘时锁定', '关闭窗口后驻留托盘，再次打开需重新输入密码', '<span class="tg"></span>')}
        </div>
        <div class="cd"><h4 class="grp">剪贴板与显示</h4>
          ${row('自动清除剪贴板', '复制密码类字段后，到时自动清除（仅当剪贴板内容未被替换时）', sel('30 秒'))}
          ${row('禁止截屏与屏幕共享', '会议共享屏幕或截图时，本窗口显示为黑色', '<span class="tg on"></span>')}
          ${row('默认隐藏密码字段', '需点击“显示”后才以明文展示，离开页面自动恢复隐藏', '<span class="tg on"></span>')}
        </div>
        <div class="cd"><h4>${I('shield', 15)}加密信息<span class="badge ok" style="margin-left:4px">已启用</span></h4>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:10px">
            ${kv('数据库加密', 'SQLCipher · AES-256')}${kv('密码派生', 'Argon2id · 64 MiB')}${kv('密钥封装', 'AES-256-GCM')}${kv('设备绑定', 'Windows DPAPI')}
          </div>
        </div>`);
    },
  },

  data: {
    file: '10-settings-data.png', title: '设置 › 数据与迁移',
    html: () => {
      const step = (n, t, d) => `<div style="flex:1;display:flex;gap:9px"><span class="steps"><span class="s cur"><span class="st-n">${n}</span></span></span><div><b style="font-weight:600">${t}</b><p>${d}</p></div></div>`;
      return settingsShell('数据与迁移', `<h2>数据与迁移</h2>
        <div class="cd"><div class="cd-r"><div class="g"><h4>数据目录</h4><div class="path" style="margin-top:3px">${DATA_DIR}</div><p>75 个条目 · 12.4 MB · 全部数据都在这一个文件夹内</p></div>
          <span class="btn">${I('folderOpen', 14)}打开目录</span><span class="btn">更改位置…</span></div></div>
        <div class="cd"><div class="cd-r"><div class="g"><h4>数据密钥</h4><p>迁移到新电脑、重装系统或忘记登录密码时使用。上次确认已备份：2026-10-08</p></div>
          <span class="btn">${I('eye', 14)}查看数据密钥…</span><span class="btn">重新生成…</span></div></div>
        <div class="cd"><div class="cd-r"><div class="g"><h4>自动备份</h4><p>每天首次解锁、每次升级前自动备份（备份同样加密），保留最近 10 份</p></div>
          <span class="btn">立即备份</span><span class="btn">从备份恢复…</span><span class="tg on"></span></div>
          <table class="tbl">
            <tr><td class="mono">vault-20261116-090312.db</td><td class="mut">今天 09:03 · 每日备份</td><td class="mut" style="text-align:right">12.4 MB</td></tr>
            <tr><td class="mono">vault-20261113-084750.db</td><td class="mut">11-13 08:47 · 每日备份</td><td class="mut" style="text-align:right">12.3 MB</td></tr>
            <tr><td class="mono">vault-20261109-101544.db</td><td class="mut">11-09 10:15 · 升级前备份（v0.9.2 → v1.0.0）</td><td class="mut" style="text-align:right">11.8 MB</td></tr>
          </table></div>
        <div class="cd"><div class="cd-r"><div class="g"><h4>迁移到新电脑</h4></div><span class="btn p">${I('folderIn', 14)}导入数据文件夹…</span></div>
          <div style="display:flex;gap:16px;margin-top:10px">
            ${step(1, '拷贝数据文件夹', '退出本软件，把上方数据目录整体拷贝到新电脑')}
            ${step(2, '在新电脑选择导入', '安装本软件，首次启动选择“导入已有数据”')}
            ${step(3, '输入数据密钥', '校验通过后设置本机登录密码，完成迁移')}
          </div></div>
        <div class="cd"><div class="cd-r"><div class="g"><h4>导出为 Markdown</h4><p>把条目与文档导出为可阅读的 .md 文件（导出结果不加密）</p></div>
          <span class="btn">${I('download', 14)}导出整个密码库…</span></div></div>`);
    },
  },

  update: {
    file: '11-settings-update.png', title: '设置 › 更新',
    html: () => {
      const src = (on, ic, t, d, badge, dis) => `<div class="cd-r" style="${dis ? 'opacity:.55' : ''}"><span class="rd${on ? ' on' : ''}"></span><span style="display:flex;color:var(--tx2)">${I(ic, 17)}</span>
        <div class="g"><b style="font-weight:600">${t}</b><p>${d}</p></div>${badge}</div>`;
      const row = (t, d, ctl) => `<div class="cd-r"><div class="g"><b style="font-weight:600">${t}</b><p>${d}</p></div>${ctl}</div>`;
      return settingsShell('更新', `<h2>更新</h2>
        <div class="cd"><div class="cd-r">${LOGO(34)}<div class="g"><h4>PwVault 1.0.0<span class="badge gr">安装版 · x64</span></h4><p>上次检查：今天 13:40 · 发现新版本</p></div>
          <span class="btn">${I('refresh', 14)}检查更新</span></div></div>
        <div class="cd" style="border-color:var(--acw2)">
          <div class="cd-r"><div class="g"><h4>新版本 1.1.0<span class="badge ac">可更新</span><span class="mut3" style="font-weight:400;font-size:12px">发布于 2026-11-14 · 77.6 MB</span></h4></div>
            <span class="btn sm">查看发布页${I('external', 12)}</span></div>
          <ul style="margin:8px 0 10px;padding-left:20px;color:var(--tx2);font-size:12.5px;line-height:1.7">
            <li>新增：检索结果支持按标签过滤</li><li>优化：Markdown 导出支持合并为单个文件</li><li>修复：长连接串在详情页显示不全的问题</li></ul>
          <div style="display:flex;align-items:center;gap:12px"><div class="bar" style="flex:1"><i style="width:62%"></i></div>
            <span class="mut mono" style="font-size:12px">48.1 / 77.6 MB · 62%</span><span class="btn sm">取消</span></div>
          <p style="margin-top:8px;font-size:12px">下载完成后校验 SHA-512，自动备份数据，然后提示“重启并安装”。数据目录不受更新影响。</p>
        </div>
        <div class="cd"><h4 class="grp">更新来源</h4>
          ${src(1, 'github', 'GitHub Releases', '通过 HTTPS 从发布仓库获取版本信息与安装包', '<span class="badge ok">使用中</span>')}
          ${src(0, 'server', '内网更新服务器（Nginx）', '填写内网地址后从自建服务器获取更新', '<span class="badge gr">后续版本提供</span>', 1)}
        </div>
        <div class="cd">${row('手动更新', '选择已下载的安装包 PwVault-Setup-x.y.z.exe，校验版本后覆盖安装，适用于无法联网的情况', `<span class="btn">${I('pkg', 14)}选择安装包…</span>`)}</div>
        <div class="cd">
          ${row('启动时自动检查更新', '仅检查并提示，不会自动下载或安装', '<span class="tg on"></span>')}
          ${row('网络代理', '访问 GitHub 时使用的代理', `<span class="sel">跟随系统${I('chevD', 13, 'mut3')}</span>`)}
        </div>`);
    },
  },

  import: {
    file: '12-import-wizard.png', title: '数据迁移：导入向导',
    html: () => {
      const s = (cls, n, t) => `<span class="s ${cls}"><span class="st-n">${cls === 'done' ? I('check', 12) : n}</span>${t}</span>`;
      const filled = 7;
      return `<div class="win">${titlebar({ search: false })}<div class="stage">
      <div class="card" style="width:680px;padding:24px 30px 20px">
        <div style="font-size:17px;font-weight:600">导入已有数据</div>
        <div class="steps" style="margin:14px 0 18px">${s('done', 1, '选择数据文件夹')}<span class="ln"></span>${s('cur', 2, '输入数据密钥')}<span class="ln"></span>${s('', 3, '设置本机登录密码')}<span class="ln"></span>${s('', 4, '完成')}</div>
        <div class="note ok">${I('check', 14)}<div><b>已识别数据文件夹</b>　<span class="mono">${SRC_DIR}</span><br>
          用户 wencong · 创建于 2026-03-02 · 数据格式 v1 · 来自其他设备，需要数据密钥解锁</div></div>
        <div style="margin:16px 0 8px"><b>请输入数据密钥</b><span class="mut">　共 11 组，支持整段粘贴，自动忽略空格与连字符</span></div>
        <div class="kgrid">${KEY_GROUPS.map((g, i) => i < filled ? `<div class="kcell">${g}</div>` : i === filled ? `<div class="kcell f">R3C<span class="caret"></span></div>` : `<div class="kcell e">·····</div>`).join('')}
          <div style="display:grid;place-items:center"><span class="btn sm" style="width:100%;justify-content:center;height:34px">${I('copy', 13)}粘贴</span></div></div>
        <div class="note in" style="margin-top:14px">${I('info', 14)}<div>数据密钥在首次初始化时生成，可在原电脑的“设置 › 数据与迁移 › 查看数据密钥”中找到。导入不会修改原数据文件夹，原电脑上的数据仍可继续使用。</div></div>
        <div style="display:flex;gap:8px;margin-top:18px;align-items:center"><span class="mut3" style="font-size:12px">已输入 7 / 11 组</span><span class="sp"></span><span class="btn">上一步</span><span class="btn p dis" style="border-color:#D5D9E0">下一步</span></div>
      </div>
      <div class="stage-f"><span>v1.0.0</span></div>
    </div></div>`;
    },
  },
};
