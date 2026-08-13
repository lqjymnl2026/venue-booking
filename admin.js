/* =========================================================
 * 场地预约 · 后台管理逻辑
 * ========================================================= */
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lsGet = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch(e){ return fb; } };

// 本地模式读取钩子（后台在内网服务器上时用服务器数据）
Store.localGetBookings = () => lsGet('vv_bookings_v1', []);
Store.localGetCheckins = () => lsGet('vv_checkins_v1', []);

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function vName(id) { return (VENUES.find(v => v.id === id) || {}).name || id; }
function slotLabel(id) { return (SLOTS.find(s => s.id === id) || {}).label || id || ''; }

/* ---------- 状态提示 ---------- */
function renderModeCard() {
  const card = $('#modeCard');
  if (Store.mode === 'server') {
    card.innerHTML = '<div class="notice">✅ <b>已连接内网服务器</b>：数据为全教会共享，所有操作实时生效。<br>📍 建议定期点右下角「💾 数据备份」下载备份。</div>';
    $('#logoutBtn').style.display = '';
    showLoginIfNeeded();
  } else {
    card.innerHTML = '<div class="notice">ℹ️ 当前为<b>静态网页模式</b>（GitHub/本地文件）。<br>后台管理需要运行 <code>server.py</code> 的内网服务器版：<br>1. 在电脑上运行 <code>python3 server.py</code><br>2. 手机/电脑访问 <code>http://电脑IP:8000/admin.html</code><br>当前仅展示<b>本机浏览器</b>的演示数据（只读）。</div>';
    $('#logoutBtn').style.display = 'none';
    $('#loginMask').style.display = 'none';
    refresh();
  }
}

async function showLoginIfNeeded() {
  // 已有 token 先验证一次
  if (AdminAPI.token()) {
    try {
      const r = await fetch('/api/backup', { headers: { 'X-Admin-Token': AdminAPI.token() } });
      if (r.ok) { $('#loginMask').style.display = 'none'; refresh(); return; }
    } catch (e) {}
    AdminAPI.clearToken();
  }
  $('#loginMask').style.display = 'flex';
}

/* ---------- 预约台账 ---------- */
async function renderBookings() {
  const bookings = await Store.getBookings();
  $('#bookCount').textContent = bookings.length + ' 条';
  const box = $('#bookTable');
  if (!bookings.length) { box.innerHTML = '<p class="empty">暂无预约记录</p>'; return; }
  const head = '<tr><th>#</th><th>场地</th><th>团队/部门</th><th>联系人</th><th>电话</th><th>周几</th><th>时段</th><th>日期</th><th>主题</th><th>对象</th><th>人数</th><th>备注</th><th>提交时间</th><th>操作</th></tr>';
  const rows = bookings.map((b, i) => `
    <tr data-id="${esc(b.id)}">
      <td>${i + 1}</td>
      <td>${esc(vName(b.venueId))}</td>
      <td>${esc(b.area || '')}</td>
      <td>${esc(b.contact || '')}</td>
      <td>${esc(b.phone || '')}</td>
      <td>${esc(b.day || '')}</td>
      <td>${esc(slotLabel(b.slot))}</td>
      <td>${esc(b.date || '')}</td>
      <td>${esc(b.theme || '')}</td>
      <td>${esc(b.audience || '')}</td>
      <td>${esc(b.count || '')}</td>
      <td>${esc(b.note || '')}</td>
      <td>${esc(b.ts || '')}</td>
      <td><button class="del-btn" data-id="${esc(b.id)}">删除</button></td>
    </tr>`).join('');
  box.innerHTML = `<table class="admin-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  box.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('确定删除这条预约吗？')) return;
      await Store.deleteBooking(btn.dataset.id);
      toast('已删除预约');
      refresh();
    });
  });
}

/* ---------- 打卡记录 ---------- */
async function renderCheckins() {
  const checkins = await Store.getCheckins();
  $('#ckCount').textContent = checkins.length + ' 条';
  const box = $('#ckList');
  if (!checkins.length) { box.innerHTML = '<p class="empty">暂无打卡记录</p>'; return; }
  box.innerHTML = checkins.slice().reverse().map(c => `
    <div class="ck-item">
      ${c.photo ? `<img src="${c.photo}" alt="打卡照片">` : ''}
      <div class="ck-info">
        <b>${esc(vName(c.venueId))}</b> · ${esc(c.contact || '未署名')} · ${esc(c.time || '')}<br>
        <span style="font-size:12px;color:var(--ink-soft)">完成 ${(c.items || []).length}/${CHECKLIST.length} 项</span>
        <div class="ck-tags">${(c.items || []).map(i => `<span>✅ ${esc(i)}</span>`).join('')}</div>
      </div>
      <button class="del-btn" data-id="${esc(c.id)}">删除</button>
    </div>`).join('');
  box.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('确定删除这条打卡记录吗？')) return;
      await Store.deleteCheckin(btn.dataset.id);
      toast('已删除打卡记录');
      refresh();
    });
  });
}

/* ---------- 统计 ---------- */
async function renderStats() {
  const bookings = await Store.getBookings();
  const byVenue = {}, bySlot = {}, byDay = {};
  bookings.forEach(b => {
    byVenue[b.venueId] = (byVenue[b.venueId] || 0) + 1;
    bySlot[b.slot] = (bySlot[b.slot] || 0) + 1;
    byDay[b.day] = (byDay[b.day] || 0) + 1;
  });
  const topVenues = Object.entries(byVenue).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, c]) => `<div class="stat-row"><span>🏟 ${esc(vName(id))}</span><b>${c} 次</b></div>`).join('');
  const topSlot = Object.entries(bySlot).sort((a, b) => b[1] - a[1])[0];
  const topDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  $('#statBox').innerHTML = `
    <div class="stat-row"><span>总预约数</span><b>${bookings.length} 次</b></div>
    ${topVenues}
    <div class="stat-row"><span>最热门时段</span><b>${topSlot ? slotLabel(topSlot[0]) + ' ' + topSlot[1] + '次' : '暂无'}</b></div>
    <div class="stat-row"><span>最热门周几</span><b>${topDay ? topDay[0] + ' ' + topDay[1] + '次' : '暂无'}</b></div>`;
}

/* ---------- 一键导出 Excel ---------- */
async function exportXLSX() {
  const bookings = await Store.getBookings();
  const checkins = await Store.getCheckins();
  if (!bookings.length && !checkins.length) { toast('暂无数据可导出'); return; }
  if (typeof XLSX === 'undefined') { toast('Excel 库未加载'); return; }
  const book = XLSX.utils.book_new();

  const header = ['序号', '场地', '团队/部门', '联系人', '电话', '周几', '时段', '具体日期', '活动主题', '参加对象', '人数', '备注', '来源', '提交时间'];
  const rows = bookings.map((b, i) => [
    i + 1, vName(b.venueId), b.area || '', b.contact || '', b.phone || '',
    b.day || '', slotLabel(b.slot), b.date || '', b.theme || '', b.audience || '',
    b.count || '', b.note || '', b.demo ? '示例' : '正式', b.ts || ''
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws1['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 6 }, { wch: 8 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 6 }, { wch: 22 }, { wch: 6 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(book, ws1, '预约台账');

  const ch = [['场地', '打卡人', '时间', '完成项数', '完成清单', '照片']];
  checkins.forEach(c => ch.push([vName(c.venueId), c.contact || '未署名', c.time || '', (c.items || []).length + '/' + CHECKLIST.length, (c.items || []).join('；'), c.photo ? '有' : '无']));
  const ws2 = XLSX.utils.aoa_to_sheet(ch);
  ws2['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 10 }, { wch: 50 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(book, ws2, '恢复打卡');

  XLSX.writeFile(book, '场地预约台账_' + new Date().toISOString().slice(0, 10) + '.xlsx');
  toast('📥 已导出 Excel（台账 + 打卡）');
}

/* ---------- 备份 / 恢复 ---------- */
async function doBackup() {
  try {
    const data = await AdminAPI.backup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '场地预约备份_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
    toast('💾 备份已下载');
  } catch (e) { toast('备份失败：' + (e.message || '')); }
}

async function doRestore(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.bookings) || !Array.isArray(data.checkins)) {
      toast('备份文件格式不对'); return;
    }
    if (!confirm(`将用备份覆盖当前数据（预约 ${data.bookings.length} 条、打卡 ${data.checkins.length} 条），确定？`)) return;
    const ok = await AdminAPI.restore(data);
    toast(ok ? '✅ 已恢复备份' : '恢复失败');
    refresh();
  } catch (e) { toast('恢复失败：' + (e.message || '')); }
}

/* ---------- 刷新 ---------- */
async function refresh() {
  await Promise.all([renderBookings(), renderCheckins(), renderStats()]);
}

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  await Store.init();
  renderModeCard();

  $('#exportBtn').addEventListener('click', exportXLSX);
  $('#backupBtn').addEventListener('click', doBackup);
  $('#restoreBtn').addEventListener('click', () => $('#restoreFile').click());
  $('#restoreFile').addEventListener('change', (e) => {
    if (e.target.files[0]) doRestore(e.target.files[0]);
    e.target.value = '';
  });
  $('#logoutBtn').addEventListener('click', () => {
    AdminAPI.clearToken();
    $('#loginMask').style.display = 'flex';
    toast('已退出登录');
  });

  $('#pwBtn').addEventListener('click', doLogin);
  $('#pwInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

  async function doLogin() {
    const ok = await AdminAPI.login($('#pwInput').value.trim());
    if (ok) {
      $('#pwErr').hidden = true;
      $('#loginMask').style.display = 'none';
      $('#pwInput').value = '';
      toast('✅ 登录成功');
      refresh();
    } else {
      $('#pwErr').hidden = false;
      $('#pwInput').value = '';
      $('#pwInput').focus();
    }
  }
});
