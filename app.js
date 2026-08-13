/* =========================================================
   场地预约 · 页面逻辑
   ========================================================= */
'use strict';

/* ---------- 工具 ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const LS_BOOK = 'vv_bookings_v1';
const LS_CHECKIN = 'vv_checkins_v1';
const LS_DEMO = 'vv_demo_removed_v1';
const LS_REMIND_FIRED = 'vv_reminders_fired_v1';
const SYNC_CHANNEL = 'venue-booking-sync';

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.hidden = true; }, 2600);
}

function getLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function setLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 存储已满等 */ }
}

function getRemindersFired(){ return getLS(LS_REMIND_FIRED, []); }
function setRemindersFired(arr){ setLS(LS_REMIND_FIRED, arr); }
function syncBroadcast(){ try { const ch = new BroadcastChannel(SYNC_CHANNEL); ch.postMessage({ type:'refresh' }); ch.close(); } catch(e){} }
function setupSyncListener(){
  try {
    const ch = new BroadcastChannel(SYNC_CHANNEL);
    ch.onmessage = () => { renderBoard(); renderStats(); };
    window._syncCh = ch;
  } catch(e){}
}
function requestNotifyPermission(){
  if (!('Notification' in window)) { toast('当前浏览器不支持通知提醒'); return false; }
  if (Notification.permission === 'granted') { toast('🔔 通知已开启'); return true; }
  Notification.requestPermission().then(p => { toast(p === 'granted' ? '🔔 通知已开启' : '通知未授权，无法提醒'); });
  return false;
}
function showNotify(title, body){
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const n = new Notification(title, { body });
    setTimeout(() => n.close(), 15000);
  } catch(e){}
}
function scheduleReminder(rec){
  if (!rec.date) { toast('未填写具体日期，无法设置前一天提醒（可补填日期）'); return; }
  const d = new Date(rec.date + 'T08:00:00');
  d.setDate(d.getDate() - 1);
  const delay = d.getTime() - Date.now();
  if (delay > 0 && delay <= 24*3600*1000) {
    setTimeout(() => {
      const v = VENUES.find(x => x.id === rec.venueId);
      showNotify('⏰ 明天有场地预约', `${v.name} ${rec.day} ${SLOTS.find(x=>x.id===rec.slot).label}\n${rec.area}｜${rec.theme}`);
      toast('⏰ 提醒：明天 ' + v.name + ' 有预约');
    }, delay);
    toast('⏰ 已设置预约前一天提醒');
  } else if (delay > 0) {
    toast('⏰ 已记录，打开页面时会在前一天提醒');
  } else {
    toast('⚠️ 预约日期已过期，无法设置提醒');
  }
}
function checkDueReminders(){
  const bookings = getLS(LS_BOOK, []);
  if (!bookings.length) return;
  const fired = getRemindersFired();
  const now = Date.now();
  const due = [];
  bookings.forEach(b => {
    if (!b.date || fired.includes(b.id)) return;
    const d = new Date(b.date + 'T08:00:00');
    d.setDate(d.getDate() - 1);
    const t = d.getTime();
    if (t <= now && now - t < 24*3600*1000) due.push(b);
  });
  if (!due.length) return;
  showNotify('⏰ 明天有场地预约', due.map(b => {
    const vv = VENUES.find(x => x.id === b.venueId);
    const ss = SLOTS.find(x => x.id === b.slot);
    return `${vv ? vv.name : '场地'} ${b.day} ${ss ? ss.label : ''}｜${b.area} ${b.theme || ''}`;
  }).join('\n'));
  due.forEach(b => fired.push(b.id));
  setRemindersFired(fired);
}
function todayCN() {
  const d = new Date();
  const w = ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
  return `${d.getMonth()+1}月${d.getDate()}日（${w}）`;
}

/* =========================================================
   1. 场地明细表
   ========================================================= */
function renderVenueTable() {
  // 桌面表格
  const head = '<tr><th>场地</th><th>可容纳 / 适宜</th><th>预约说明</th><th>负责人</th><th>联系电话</th></tr>';
  const rows = VENUES.map(v => `
    <tr data-id="${v.id}">
      <td class="v-name" data-name="${esc(v.name)}">${esc(v.name)}</td>
      <td class="v-capacity">${esc(v.capacity)}</td>
      <td class="v-audience">
        ${esc(v.audience)}
        ${v.note ? `<span class="v-tag">${esc(v.note)}</span>` : ''}
        ${v.book.maxDuration ? `<span class="v-tag">⏱ ${esc(v.book.maxDuration)}</span>` : ''}
      </td>
      <td class="v-manager">${esc(v.manager)}</td>
      <td class="v-manager">${phoneDisplay(v.phone)}</td>
    </tr>`).join('');
  $('#venueTable').innerHTML = `<table class="venue-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  $('#venueTable').querySelectorAll('.v-name').forEach(el => {
    el.addEventListener('click', () => { selectLayout(el.closest('tr').dataset.id); });
  });

  // 手机卡片
  $('#venueCards').innerHTML = VENUES.map(v => `
    <div class="v-card" data-id="${v.id}">
      <h3>${esc(v.name)}</h3>
      <div class="v-row"><b>可容纳：</b>${esc(v.capacity)}</div>
      <div class="v-row"><b>预约要求：</b>${esc(v.audience)}</div>
      <div class="v-row"><b>负责人：</b>${esc(v.manager)} · ${phoneDisplay(v.phone)}</div>
      <div class="v-meta">
        ${v.note ? `<span class="v-tag">${esc(v.note)}</span>` : ''}
        ${v.book.maxDuration ? `<span class="v-tag">⏱ ${esc(v.book.maxDuration)}</span>` : ''}
        <span class="v-tag">🗺️ 查看布局</span>
      </div>
    </div>`).join('');
  $('#venueCards').querySelectorAll('.v-card').forEach(el => {
    el.addEventListener('click', () => selectLayout(el.dataset.id));
  });
}

function phoneDisplay(phone) {
  return phone ? esc(phone) : '<span class="c-pending">待补充</span>';
}

/* =========================================================
   2. 布局图（SVG）
   ========================================================= */
const LAYOUT_STYLES = {
  stage:    { fill:'#f2e8d5', stroke:'#c9a227', icon:'🎤' },
  podium:   { fill:'#f2e8d5', stroke:'#c9a227', icon:'🗣️' },
  screen:   { fill:'#e6edf3', stroke:'#7f9bb3', icon:'📽️' },
  board:    { fill:'#edf2ea', stroke:'#6b8e5a', icon:'📋' },
  speaker:  { fill:'#e6edf3', stroke:'#7f9bb3', icon:'🔊' },
  piano:    { fill:'#f3e9dc', stroke:'#8a6d3b', icon:'🎹' },
  rows:     { fill:'#f6f1e7', stroke:'#cbbf9f', icon:'💺' },
  table:    { fill:'#efe7d8', stroke:'#b3a284', icon:'🪑' },
  round:    { fill:'#efe7d8', stroke:'#b3a284', icon:'🟤' },
  sofa:     { fill:'#e7e2d8', stroke:'#a89f8a', icon:'🛋️' },
  teatable: { fill:'#eadfc8', stroke:'#b3a284', icon:'🫖' },
  water:    { fill:'#dceaf0', stroke:'#6f9db1', icon:'🚰' },
  cross:    { fill:'#f3e9dc', stroke:'#8a6d3b', icon:'✝️' },
  kneeler:  { fill:'#f6f1e7', stroke:'#cbbf9f', icon:'🙏' },
  bookshelf:{ fill:'#e7e2d8', stroke:'#a89f8a', icon:'📚' },
  door:     { fill:'#f6f1e7', stroke:'#cbbf9f', icon:'🚪' },
  window:   { fill:'#dceaf0', stroke:'#6f9db1', icon:'🪟' },
  ac:       { fill:'#e6edf3', stroke:'#7f9bb3', icon:'❄️' },
  power:    { fill:'#f8ece2', stroke:'#c96f3f', icon:'⚡' },
  trash:    { fill:'#e6edf3', stroke:'#7f9bb3', icon:'🗑️' },
  closet:   { fill:'#e7e2d8', stroke:'#a89f8a', icon:'🗄️' },
  carpet:   { fill:'#eae3d3', stroke:'#cbbf9f', icon:'🧶' }
};

function svgItem(it) {
  const st = LAYOUT_STYLES[it.kind] || LAYOUT_STYLES.table;
  const x = it.x, y = it.y, w = it.w, h = it.h;
  const cx = x + w/2, cy = y + h/2;
  let body = '';
  if (it.kind === 'rows') {
    // 网格状座椅
    const cols = Math.max(2, Math.floor(w / 30));
    const rows = Math.max(2, Math.floor(h / 26));
    const gw = w / cols, gh = h / rows;
    let seats = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seats += `<rect x="${x + c*gw + gw*0.18}" y="${y + r*gh + gh*0.18}" width="${gw*0.64}" height="${gh*0.64}" rx="5" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.2"/>`;
      }
    }
    body = seats;
  } else if (it.kind === 'round') {
    body = `<ellipse cx="${cx}" cy="${cy}" rx="${w/2}" ry="${h/2}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="2"/>
            <ellipse cx="${cx}" cy="${cy}" rx="${w/2-8}" ry="${h/2-8}" fill="none" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="4 4"/>`;
  } else if (it.kind === 'cross') {
    body = `<rect x="${cx-8}" y="${y}" width="16" height="${h}" rx="3" fill="${st.fill}" stroke="${st.stroke}" stroke-width="2"/>
            <rect x="${x}" y="${cy-8}" width="${w}" height="16" rx="3" fill="${st.fill}" stroke="${st.stroke}" stroke-width="2"/>`;
  } else {
    body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${st.fill}" stroke="${st.stroke}" stroke-width="2"/>`;
  }
  const labelY = (it.kind === 'rows' || it.kind === 'round' || it.kind === 'table' || it.kind === 'carpet') ? (cy + 4) : (y + h + 15);
  const iconY = (it.kind === 'rows' || it.kind === 'table' || it.kind === 'carpet') ? (y + h - 12) : (y + h/2 - 7);
  let label = '';
  if (it.label) {
    label = `<text x="${cx}" y="${labelY}" text-anchor="middle" font-size="11" fill="#6f665a" font-family="inherit">${esc(it.label)}</text>`;
  }
  return `<g>${body}${label}</g>`;
}

function renderLayout(venueId) {
  const v = VENUES.find(x => x.id === venueId) || VENUES[0];
  // 更新 chip 选中态
  $$('#layoutTabs .chip').forEach(c => c.classList.toggle('active', c.dataset.id === v.id));
  const items = v.layout.items.map(svgItem).join('');
  const panel = $('#layoutPanel');
  panel.innerHTML = `
    <h3>${esc(v.layout.title)}</h3>
    <p class="layout-sub">${esc(v.name)} · 可容纳 ${esc(v.capacity)} · 负责人 ${esc(v.manager)}</p>
    <svg class="layout-svg" viewBox="0 0 400 300" role="img" aria-label="${esc(v.name)}布局示意图">
      <rect x="1" y="1" width="398" height="298" rx="14" fill="#fdfbf6" stroke="#e7dfce" stroke-width="2"/>
      ${items}
    </svg>`;
  // 图例
  const kinds = [...new Set(v.layout.items.map(i => i.kind))];
  $('#layoutLegend').innerHTML = kinds.map(k => {
    const st = LAYOUT_STYLES[k] || LAYOUT_STYLES.table;
    return `<span class="legend-item"><span class="legend-swatch" style="background:${st.fill}"></span>${st.icon} ${esc(st.label || k)}</span>`;
  }).join('');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderLayoutTabs() {
  $('#layoutTabs').innerHTML = VENUES.map(v =>
    `<button type="button" class="chip" data-id="${v.id}" role="tab">${esc(v.name)}</button>`).join('');
  $$('#layoutTabs .chip').forEach(c => c.addEventListener('click', () => renderLayout(c.dataset.id)));
  renderLayout(VENUES[0].id);
}

function selectLayout(venueId) {
  renderLayout(venueId);
  $('#layouts').scrollIntoView({ behavior: 'smooth' });
}

/* =========================================================
   3. 守则制度
   ========================================================= */
function renderRules() {
  $('#ruleIntro').textContent = RULES.intro;
  $('#ruleList').innerHTML = RULES.items.map(r =>
    `<li><b>${esc(r.title)}：</b>${esc(r.desc)}</li>`).join('');
  $('#ruleRequired').innerHTML = `📌 <b>预约场地需要注明：</b>${esc(RULES.requiredInfo)}`;
  $('#ruleNote').textContent = RULES.note;

  const useList = [
    '关闭所有电器、灯、调音台、乐器等等',
    '关闭所有门、窗',
    '盖上调音台以及乐器的盖布，避免落灰',
    '地面打扫并拖干净',
    '垃圾桶垃圾处理，并套上新的垃圾袋',
    '桌椅使用后请归位：椅子8把一摞，桌子恢复叠放整齐'
  ];
  $('#useList').innerHTML = useList.map(t => `<li>${esc(t)}</li>`).join('');
  $('#penaltyList').innerHTML = PENALTIES.map(p =>
    `<li><span>${esc(p.item)}</span><b>${esc(p.amount)}</b></li>`).join('');
  $('#verseBox').textContent = RULES.verse;
}

/* =========================================================
   4. 可约看板
   ========================================================= */
function demoBookings() {
  return [
    { id:'demo1', venueId:'duogongneng', day:'周六', slot:'morning', area:'仁爱团队', theme:'团队联合活动', demo:true },
    { id:'demo2', venueId:'peixunshi1',  day:'周三', slot:'evening', area:'喜乐团队', theme:'组长培训', demo:true },
    { id:'demo3', venueId:'shangquan',   day:'周五', slot:'afternoon', area:'同心团队', theme:'茶叙接待', demo:true },
    { id:'demo4', venueId:'houbaizhang-dating', day:'周日', slot:'morning', area:'儿童组', theme:'教师活动', demo:true }
  ];
}

function allBookings() {
  let b = getLS(LS_BOOK, []);
  if (!getLS(LS_DEMO, false)) b = [...demoBookings(), ...b];
  return b;
}

// 接入 store.js：本地读写钩子（内网服务器模式下会自动使用共享数据）
Store.localGetBookings = () => allBookings();
Store.localGetCheckins = () => getLS(LS_CHECKIN, []);
Store.localAddBooking = (rec) => { const b = getLS(LS_BOOK, []); b.push(rec); setLS(LS_BOOK, b); };
Store.localAddCheckin = (rec) => {
  const c = getLS(LS_CHECKIN, []);
  c.push(rec);
  setLS(LS_CHECKIN, c.slice(-20).map(r => ({ ...r, photo: r.photo && r.photo.length > 90000 ? '' : r.photo })));
};
Store.localDeleteBooking = (id) => { setLS(LS_BOOK, getLS(LS_BOOK, []).filter(x => x.id !== id)); };
Store.localDeleteCheckin = (id) => { setLS(LS_CHECKIN, getLS(LS_CHECKIN, []).filter(x => x.id !== id)); };

async function renderBoard() {
  const sel = $('#boardVenue');
  const venueId = sel.value || VENUES[0].id;
  const all = await Store.getBookings();
  const bookings = all.filter(b => b.venueId === venueId);
  const occupied = new Set(bookings.map(b => `${b.day}|${b.slot}`));
  const serverMode = Store.mode === 'server';
  const demoOn = !serverMode && !getLS(LS_DEMO, false);

  let html = '<table class="board-table"><thead><tr><th>时段</th>' + DAYS.map(d => `<th>${d}</th>`).join('') + '</tr></thead><tbody>';
  SLOTS.forEach(slot => {
    html += `<tr><td class="day-col">${slot.label}<br><span class="slot-label">${slot.time}</span></td>`;
    DAYS.forEach(day => {
      const key = `${day}|${slot.id}`;
      const b = bookings.find(x => `${x.day}|${x.slot}` === key);
      if (b) {
        html += `<td><div class="slot-booked" title="${esc(b.area)} · ${esc(b.theme)}">已约<br><span class="slot-label">${esc(b.area)}</span></div></td>`;
      } else {
        html += `<td><button type="button" class="slot-free" data-day="${day}" data-slot="${slot.id}">可约<br><span class="slot-label">点击预约</span></button></td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  $('#boardGrid').innerHTML = html;

  $('#boardGrid').querySelectorAll('.slot-free').forEach(btn => {
    btn.addEventListener('click', () => {
      $('#bVenue').value = venueId;
      $('#bDay').value = btn.dataset.day;
      $('#bSlot').value = btn.dataset.slot;
      $('#book').scrollIntoView({ behavior: 'smooth' });
      toast('已带入场地与时段，请填写预约信息');
    });
  });

  $('#boardNote').innerHTML = serverMode
    ? '📌 <b>内网服务器模式</b>：看板为全教会共享实时数据，预约请以负责人确认为准。'
    : (demoOn
        ? '📌 当前包含 <b>示例数据</b>（演示看板效果）。本看板保存在本机浏览器，正式预约请以负责人确认为准。'
        : '📌 示例数据已清除。本看板保存在本机浏览器，正式预约请以负责人确认为准。');
  $('#toggleDemo').style.display = serverMode ? 'none' : '';
  $('#toggleDemo').textContent = demoOn ? '清除示例数据' : '恢复示例数据';
}

function initBoard() {
  $('#boardVenue').innerHTML = VENUES.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('');
  $('#boardVenue').addEventListener('change', renderBoard);
  $('#toggleDemo').addEventListener('click', () => {
    setLS(LS_DEMO, !getLS(LS_DEMO, false));
    renderBoard();
  });
  renderBoard();
}

/* =========================================================
   5. 在线预约
   ========================================================= */
function initBookForm() {
  $('#bVenue').innerHTML = VENUES.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('');
  $('#bDay').innerHTML = DAYS.map(d => `<option value="${d}">${d}</option>`).join('');
  $('#bSlot').innerHTML = SLOTS.map(s => `<option value="${s.id}">${s.label}（${s.time}）</option>`).join('');

  $('#bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = {
      venueId: $('#bVenue').value,
      area: $('#bArea').value.trim(),
      contact: $('#bContact').value.trim(),
      phone: $('#bPhone').value.trim(),
      date: $('#bDate').value,
      day: $('#bDay').value,
      slot: $('#bSlot').value,
      theme: $('#bTheme').value.trim(),
      audience: $('#bAudience').value.trim(),
      count: $('#bCount').value.trim(),
      note: $('#bNote').value.trim()
    };
    const v = VENUES.find(x => x.id === f.venueId);
    const slot = SLOTS.find(s => s.id === f.slot);
    const lines = [
      '【场地预约申请】',
      `团队/部门：${f.area}`,
      `联系人：${f.contact}（${f.phone}）`,
      `场地：${v.name}`,
      `时间：${f.date ? f.date + ' ' : ''}${f.day} ${slot.label}（${slot.time}）`,
      `活动主题：${f.theme}`,
      `参加对象：${f.audience}`,
      `参加人数：${f.count}人`,
      ...(f.note ? [`备注：${f.note}`] : []),
      '—— 请负责人确认，谢谢！'
    ];
    const text = lines.join('\n');
    $('#modalText').textContent = text;

    // 保存（内网服务器共享 / 本机演示）
    const rec = {
      id: 'u' + Date.now(),
      venueId: f.venueId, day: f.day, slot: f.slot,
      area: f.area, contact: f.contact, phone: f.phone,
      date: f.date, theme: f.theme, audience: f.audience,
      count: f.count, note: f.note, ts: new Date().toISOString(), demo: false
    };
    const saved = await Store.addBooking(rec);
    if (saved) {
      await renderBoard();
      await renderStats();
      syncBroadcast();
      if ($('#remindCheck').checked) scheduleReminder(rec);
    } else {
      toast('⚠️ 预约保存失败，请重试');
    }

    const callBtn = $('#callBtn');
    if (v.phone) {
      callBtn.href = `tel:${v.phone.replace(/[^0-9+]/g, '')}`;
      callBtn.textContent = `📞 拨打 ${v.manager}（${v.phone}）`;
      callBtn.style.display = '';
    } else {
      callBtn.style.display = 'none';
    }
    showModal();
  });
}

function showModal() {
  $('#modalMask').hidden = false;
  document.body.style.overflow = 'hidden';
}
function hideModal() {
  $('#modalMask').hidden = true;
  document.body.style.overflow = '';
}

function initModal() {
  $('#modalClose').addEventListener('click', hideModal);
  $('#modalMask').addEventListener('click', (e) => { if (e.target.id === 'modalMask') hideModal(); });
  $('#copyBtn').addEventListener('click', async () => {
    const text = $('#modalText').textContent;
    try {
      await navigator.clipboard.writeText(text);
      toast('✅ 已复制，请粘贴发送给负责人');
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('✅ 已复制，请粘贴发送给负责人');
    }
  });
}

/* =========================================================
   6. 恢复打卡
   ========================================================= */
let checkState = { venueId: VENUES[0].id, contact: '', items: {} };

function renderChecklist() {
  $('#checklist').innerHTML = CHECKLIST.map(c => `
    <li class="${checkState.items[c.id] ? 'checked' : ''}" data-id="${c.id}">
      <input type="checkbox" ${checkState.items[c.id] ? 'checked' : ''}>
      <span>${c.icon} ${esc(c.text)}</span>
    </li>`).join('');
  $$('#checklist li').forEach(li => {
    li.addEventListener('click', () => {
      const id = li.dataset.id;
      checkState.items[id] = !checkState.items[id];
      renderChecklist();
    });
  });
}

function resizeImage(file, maxW, quality) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve('');
      img.src = reader.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

async function renderRecords() {
  const records = await Store.getCheckins();
  const ul = $('#cRecords');
  if (!records.length) {
    ul.innerHTML = '<li class="records-empty">还没有打卡记录，使用场地后记得打卡哦～</li>';
    return;
  }
  ul.innerHTML = records.slice().reverse().map(r => {
    const v = VENUES.find(x => x.id === r.venueId);
    const done = (r.items || []).length;
    const photo = r.photo ? `<img src="${r.photo}" alt="打卡照片">` : '';
    return `<li class="record">
      <div class="r-head"><span>${esc(v ? v.name : '未知场地')}</span><span>${esc(r.time)}</span></div>
      <div class="r-meta">打卡人：${esc(r.contact || '未署名')} · 完成 ${done}/${CHECKLIST.length} 项</div>
      <div class="r-items">${(r.items || []).map(i => `<span class="r-tag">✅ ${esc(i)}</span>`).join('')}</div>
      ${photo}
    </li>`;
  }).join('');
}

function initCheckin() {
  $('#cVenue').innerHTML = VENUES.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('');
  checkState.venueId = VENUES[0].id;
  renderChecklist();
  renderRecords();

  $('#cVenue').addEventListener('change', (e) => { checkState.venueId = e.target.value; });
  $('#cContact').addEventListener('input', (e) => { checkState.contact = e.target.value; });

  $('#cPhotoBtn').addEventListener('click', () => $('#cPhoto').click());
  $('#cPhoto').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await resizeImage(file, 720, 0.72);
    if (dataUrl) {
      checkState.photo = dataUrl;
      const img = $('#cPhotoPreview');
      img.src = dataUrl;
      img.hidden = false;
      toast('📷 照片已添加');
    } else {
      toast('照片处理失败，请重试');
    }
  });

  $('#cSave').addEventListener('click', async () => {
    const doneItems = CHECKLIST.filter(c => checkState.items[c.id]).map(c => c.text);
    const v = VENUES.find(x => x.id === checkState.venueId);
    if (!doneItems.length) { toast('请至少勾选一项恢复清单'); return; }
    const record = {
      id: 'c' + Date.now(),
      venueId: checkState.venueId,
      contact: checkState.contact.trim(),
      items: doneItems,
      photo: checkState.photo || '',
      time: new Date().toLocaleString('zh-CN', { hour12: false })
    };
    const ok = await Store.addCheckin(record);
    if (ok) {
      checkState.photo = '';
      $('#cPhotoPreview').hidden = true;
      $('#cPhoto').value = '';
      await renderRecords();
      toast(`✅ 已保存 ${v.name} 打卡记录`);
    } else {
      toast('⚠️ 打卡保存失败，请重试');
    }
  });

  $('#cReset').addEventListener('click', () => {
    checkState.items = {};
    $('#cContact').value = '';
    checkState.contact = '';
    checkState.photo = '';
    $('#cPhotoPreview').hidden = true;
    $('#cPhoto').value = '';
    renderChecklist();
  });

  $('#cClear').addEventListener('click', () => {
    if (Store.mode === 'server') { toast('内网模式下请到「后台管理」中删除记录'); return; }
    if (confirm('确定清空本机所有打卡记录吗？')) {
      setLS(LS_CHECKIN, []);
      renderRecords();
      toast('已清空打卡记录');
    }
  });
}

/* =========================================================
   7. 联系方式
   ========================================================= */
function renderContacts() {
  const byManager = {};
  VENUES.forEach(v => {
    if (!byManager[v.manager]) byManager[v.manager] = { manager: v.manager, phone: v.phone, venues: [] };
    byManager[v.manager].venues.push(v.name);
  });
  const list = Object.values(byManager).sort((a, b) => a.manager.localeCompare(b.manager, 'zh'));
  $('#contactCards').innerHTML = list.map(m => `
    <div class="contact-card">
      <div class="avatar">${esc(m.manager[0])}</div>
      <h3>${esc(m.manager)}</h3>
      <div class="c-venues">负责：${m.venues.map(esc).join('、')}</div>
      ${m.phone
        ? `<div class="c-phone">${esc(m.phone)}</div><a class="c-call" href="tel:${m.phone.replace(/[^0-9+]/g, '')}">📞 一键拨打</a>`
        : `<div class="c-pending">☎ 联系电话待补充</div>`}
    </div>`).join('');
  const missing = Object.values(byManager).filter(m => !m.phone).length;
  $('#phoneNote').innerHTML = missing
    ? `⚠️ 目前有 <b>${missing}</b> 位负责人的联系电话待补充，请打开 <code>data.js</code> 填写 <code>phone</code> 字段。`
    : '✅ 所有负责人联系电话已配置，点击「一键拨打」即可联系。';
}


async function exportXLSX() {
  const bookings = await Store.getBookings();
  const checkins = await Store.getCheckins();
  if (!bookings.length && !checkins.length) { toast('暂无数据可导出'); return; }
  if (typeof XLSX === 'undefined') { toast('Excel 库未加载，改用 CSV 导出'); exportCSV(); return; }

  const book = XLSX.utils.book_new();

  // 工作表1：预约台账
  const header = ['序号','场地','团队/部门','联系人','电话','周几','时段','具体日期','活动主题','参加对象','人数','备注','来源','提交时间'];
  const rows = bookings.map((b,i) => [
    i+1,
    (VENUES.find(v=>v.id===b.venueId)||{}).name||b.venueId,
    b.area||'', b.contact||'', b.phone||'',
    b.day||'', (SLOTS.find(s=>s.id===b.slot)||{}).label||b.slot||'',
    b.date||'', b.theme||'', b.audience||'', b.count||'',
    b.note||'', b.demo ? '示例' : '正式', b.ts ? new Date(b.ts).toLocaleString('zh-CN',{hour12:false}) : ''
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws1['!cols'] = [{wch:6},{wch:14},{wch:14},{wch:10},{wch:14},{wch:6},{wch:8},{wch:12},{wch:22},{wch:14},{wch:6},{wch:22},{wch:6},{wch:18}];
  XLSX.utils.book_append_sheet(book, ws1, '预约台账');

  // 工作表2：恢复打卡
  const ch = [['场地','打卡人','时间','完成项数','完成清单','照片']];
  checkins.forEach(r => {
    const v = VENUES.find(x => x.id === r.venueId);
    ch.push([
      v ? v.name : r.venueId, r.contact || '未署名', r.time || '',
      (r.items || []).length + '/' + CHECKLIST.length,
      (r.items || []).join('；'),
      r.photo ? '有' : '无'
    ]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(ch);
  ws2['!cols'] = [{wch:14},{wch:10},{wch:18},{wch:10},{wch:50},{wch:8}];
  XLSX.utils.book_append_sheet(book, ws2, '恢复打卡');

  // 工作表3：使用统计
  const stats = [['统计项','名称','次数']];
  const byVenue={}, bySlot={}, byDay={};
  bookings.forEach(b => { byVenue[b.venueId]=(byVenue[b.venueId]||0)+1; bySlot[b.slot]=(bySlot[b.slot]||0)+1; byDay[b.day]=(byDay[b.day]||0)+1; });
  Object.entries(byVenue).sort((a,b)=>b[1]-a[1]).forEach(([id,c]) => stats.push(['场地热度',(VENUES.find(v=>v.id===id)||{}).name||id,c]));
  SLOTS.forEach(s => stats.push(['时段热度', s.label, bySlot[s.id]||0]));
  DAYS.forEach(d => stats.push(['周几热度', d, byDay[d]||0]));
  const ws3 = XLSX.utils.aoa_to_sheet(stats);
  ws3['!cols'] = [{wch:12},{wch:16},{wch:8}];
  XLSX.utils.book_append_sheet(book, ws3, '使用统计');

  XLSX.writeFile(book, '场地预约台账_' + new Date().toISOString().slice(0,10) + '.xlsx');
  toast('📥 已一键导出 Excel（台账/打卡/统计 3 个工作表）');
}


/* =========================================================
   8. 使用统计 / 导出台账 / 深链接
   ========================================================= */
async function renderStats() {
  const bookings = await Store.getBookings();
  const byVenue = {}, bySlot = {}, byDay = {};
  bookings.forEach(b => {
    byVenue[b.venueId] = (byVenue[b.venueId]||0)+1;
    bySlot[b.slot] = (bySlot[b.slot]||0)+1;
    byDay[b.day] = (byDay[b.day]||0)+1;
  });
  const venueRows = Object.entries(byVenue)
    .map(([id,c]) => ({ name: (VENUES.find(v=>v.id===id)||{}).name||id, c }))
    .sort((a,b)=>b.c-a.c);
  const vMax = Math.max(1, ...venueRows.map(r=>r.c));
  $('#statVenues').innerHTML = venueRows.length
    ? venueRows.map((r,i) => `<div class="bar-row${i===0?' top':''}">
        <span class="b-label">${esc(r.name)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(r.c/vMax*100).toFixed(0)}%"></div></div>
        <span class="b-val">${r.c}</span></div>`).join('')
    : '<p class="records-empty">暂无数据</p>';
  const slotRows = SLOTS.map(s => ({ name: s.label, c: bySlot[s.id]||0 }));
  const sMax = Math.max(1, ...slotRows.map(r=>r.c));
  $('#statSlots').innerHTML = slotRows.map(r => `<div class="bar-row">
      <span class="b-label">${r.name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(r.c/sMax*100).toFixed(0)}%"></div></div>
      <span class="b-val">${r.c}</span></div>`).join('');
  const dayRows = DAYS.map(d => ({ name: d, c: byDay[d]||0 }));
  const dMax = Math.max(1, ...dayRows.map(r=>r.c));
  $('#statDays').innerHTML = dayRows.map(r => `<div class="bar-row">
      <span class="b-label">${r.name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(r.c/dMax*100).toFixed(0)}%"></div></div>
      <span class="b-val">${r.c}</span></div>`).join('');
  const serverMode = Store.mode === 'server';
  const demoOn = !serverMode && !getLS(LS_DEMO, false);
  $('#statNote').innerHTML = serverMode
    ? `共 <b>${bookings.length}</b> 条预约记录 · 数据保存在内网服务器（全教会共享）`
    : `共 <b>${bookings.length}</b> 条预约记录${demoOn ? '（含 4 条示例数据，可在看板清除）' : ''} · 数据保存在本机浏览器`;
}

async function exportCSV() {
  const bookings = await Store.getBookings();
  if (!bookings.length) { toast('暂无预约数据可导出'); return; }
  const header = ['序号','场地','团队/部门','联系人','电话','周几','时段','具体日期','活动主题','参加对象','人数','备注','来源','提交时间'];
  const rows = bookings.map((b,i) => [
    i+1,
    (VENUES.find(v=>v.id===b.venueId)||{}).name||b.venueId,
    b.area||'', b.contact||'', b.phone||'',
    b.day||'', (SLOTS.find(s=>s.id===b.slot)||{}).label||b.slot||'',
    b.date||'', b.theme||'', b.audience||'', b.count||'',
    b.note||'', b.demo ? '示例' : '正式', b.ts ? new Date(b.ts).toLocaleString('zh-CN',{hour12:false}) : ''
  ]);
  const csv = [header, ...rows].map(r => r.map(cell => {
    const str = String(cell == null ? '' : cell);
    return /[",\n]/.test(str) ? '"' + str.replace(/"/g,'""') + '"' : str;
  }).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '场地预约台账_' + new Date().toISOString().slice(0,10) + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  toast('📥 台账已导出（CSV，可用 Excel 打开）');
}

function handleDeepLink() {
  try {
    const vid = new URLSearchParams(location.search).get('venue');
    if (vid && VENUES.some(v => v.id === vid)) {
      $('#boardVenue').value = vid;
      renderBoard();
      selectLayout(vid);
    }
  } catch(e){}
}

/* =========================================================
   初始化
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  await Store.init();
  renderVenueTable();
  renderLayoutTabs();
  renderRules();
  initBoard();
  initBookForm();
  initModal();
  initCheckin();
  renderContacts();
  await renderStats();
  setupSyncListener();
  checkDueReminders();
  handleDeepLink();
  $('#remindBtn').addEventListener('click', requestNotifyPermission);
  $('#exportBtn').addEventListener('click', exportXLSX);
});
