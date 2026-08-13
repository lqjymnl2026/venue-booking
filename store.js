/* =========================================================
 * store.js · 数据存储层
 * 自动检测：连上内网服务器(server.py) -> 使用共享数据；
 *          否则退回本机浏览器(local) 演示模式。
 * app.js 负责注入本地读写函数（localGetBookings 等）。
 * ========================================================= */
'use strict';

const Store = {
  mode: 'local',          // 'server' | 'local'

  // app.js 注入的本地读写钩子
  localGetBookings: null,
  localGetCheckins: null,
  localAddBooking: null,
  localAddCheckin: null,
  localDeleteBooking: null,
  localDeleteCheckin: null,

  async init() {
    try {
      const r = await fetch('/api/health', { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        if (d && d.ok) { this.mode = 'server'; }
      }
    } catch (e) { this.mode = 'local'; }
    return this.mode;
  },

  async getBookings() {
    if (this.mode === 'server') {
      try {
        const r = await fetch('/api/bookings', { cache: 'no-store' });
        if (r.ok) return await r.json();
      } catch (e) {}
    }
    return this.localGetBookings ? this.localGetBookings() : [];
  },

  async getCheckins() {
    if (this.mode === 'server') {
      try {
        const r = await fetch('/api/checkins', { cache: 'no-store' });
        if (r.ok) return await r.json();
      } catch (e) {}
    }
    return this.localGetCheckins ? this.localGetCheckins() : [];
  },

  async addBooking(rec) {
    if (this.mode === 'server') {
      try {
        const r = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rec)
        });
        return r.ok;
      } catch (e) { return false; }
    }
    if (this.localAddBooking) this.localAddBooking(rec);
    return true;
  },

  async addCheckin(rec) {
    if (this.mode === 'server') {
      try {
        const r = await fetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rec)
        });
        return r.ok;
      } catch (e) { return false; }
    }
    if (this.localAddCheckin) this.localAddCheckin(rec);
    return true;
  },

  async deleteBooking(id) {
    if (this.mode === 'server') {
      try {
        await fetch('/api/bookings/' + encodeURIComponent(id), {
          method: 'DELETE',
          headers: { 'X-Admin-Token': AdminAPI.token() }
        });
      } catch (e) {}
    } else if (this.localDeleteBooking) {
      this.localDeleteBooking(id);
    }
  },

  async deleteCheckin(id) {
    if (this.mode === 'server') {
      try {
        await fetch('/api/checkins/' + encodeURIComponent(id), {
          method: 'DELETE',
          headers: { 'X-Admin-Token': AdminAPI.token() }
        });
      } catch (e) {}
    } else if (this.localDeleteCheckin) {
      this.localDeleteCheckin(id);
    }
  }
};

const AdminAPI = {
  token() {
    try { return sessionStorage.getItem('vv_admin_token') || ''; } catch (e) { return ''; }
  },
  setToken(t) {
    try { sessionStorage.setItem('vv_admin_token', t); } catch (e) {}
  },
  clearToken() {
    try { sessionStorage.removeItem('vv_admin_token'); } catch (e) {}
  },
  isServer() {
    return Store.mode === 'server';
  },
  async login(password) {
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
      });
      if (r.ok) {
        const d = await r.json();
        if (d && d.token) { this.setToken(d.token); return true; }
      }
    } catch (e) {}
    return false;
  },
  async backup() {
    const r = await fetch('/api/backup', { headers: { 'X-Admin-Token': this.token() } });
    if (!r.ok) throw new Error('备份失败');
    return r.json();
  },
  async restore(data) {
    const r = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': this.token() },
      body: JSON.stringify(data)
    });
    return r.ok;
  }
};
