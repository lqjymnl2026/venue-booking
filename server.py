#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
场地预约 · 内网服务器（含后台管理 API）
--------------------------------------
用法：python3 server.py [端口]        （默认 8000）
管理密码：默认 123456，可用环境变量 ADMIN_PASSWORD 修改：
    ADMIN_PASSWORD=你的密码 python3 server.py

接口：
  公开  GET  /api/health            健康检查
  公开  GET  /api/bookings          全部预约（看板/统计用）
  公开  POST /api/bookings          新增预约
  公开  GET  /api/checkins          全部打卡记录
  公开  POST /api/checkins          新增打卡
  管理  POST /api/auth              登录 {password} -> {token}
  管理  GET  /api/backup            备份全部数据 (需 token)
  管理  POST /api/restore           恢复数据 (需 token)
  管理  DELETE /api/bookings/<id>   删除预约 (需 token)
  管理  DELETE /api/checkins/<id>   删除打卡 (需 token)
"""
import json
import os
import re
import secrets
import threading
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, unquote

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
BOOKINGS_FILE = os.path.join(DATA_DIR, 'bookings.json')
CHECKINS_FILE = os.path.join(DATA_DIR, 'checkins.json')

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '123456')
TOKEN_TTL = 8 * 3600          # 登录令牌有效期 8 小时
TOKENS = {}                    # token -> 过期时间戳
LOCK = threading.Lock()


def load_json(path):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, fmt, *args):
        print('[%s] %s %s' % (time.strftime('%H:%M:%S'), self.client_address[0], fmt % args))

    # ---------- 工具 ----------
    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        try:
            length = int(self.headers.get('Content-Length') or 0)
            if length <= 0:
                return {}
            return json.loads(self.rfile.read(length).decode('utf-8'))
        except Exception:
            return {}

    def _is_admin(self):
        token = self.headers.get('X-Admin-Token', '')
        return bool(token) and TOKENS.get(token, 0) > time.time()

    def _clean_tokens(self):
        now = time.time()
        for t in [k for k, v in TOKENS.items() if v <= now]:
            TOKENS.pop(t, None)

    # ---------- GET ----------
    def do_GET(self):
        u = urlparse(self.path)
        p = u.path
        if p == '/api/health':
            self._json(200, {'ok': True, 'mode': 'server'})
        elif p == '/api/bookings':
            self._json(200, load_json(BOOKINGS_FILE))
        elif p == '/api/checkins':
            self._json(200, load_json(CHECKINS_FILE))
        elif p == '/api/backup':
            if not self._is_admin():
                self._json(401, {'error': '需要管理员登录'})
                return
            self._json(200, {'bookings': load_json(BOOKINGS_FILE), 'checkins': load_json(CHECKINS_FILE)})
        else:
            super().do_GET()

    # ---------- POST ----------
    def do_POST(self):
        u = urlparse(self.path)
        p = u.path
        if p == '/api/auth':
            data = self._read_json()
            if data.get('password') == ADMIN_PASSWORD:
                self._clean_tokens()
                token = secrets.token_hex(16)
                TOKENS[token] = time.time() + TOKEN_TTL
                self._json(200, {'ok': True, 'token': token})
            else:
                self._json(401, {'error': '密码错误'})
        elif p == '/api/bookings':
            rec = self._read_json()
            if not rec or not rec.get('area') or not rec.get('venueId'):
                self._json(400, {'error': '预约信息不完整'})
                return
            rec['id'] = 's' + str(int(time.time() * 1000))
            rec['ts'] = time.strftime('%Y-%m-%d %H:%M:%S')
            rec['demo'] = False
            with LOCK:
                b = load_json(BOOKINGS_FILE)
                b.append(rec)
                save_json(BOOKINGS_FILE, b)
            self._json(200, {'ok': True, 'id': rec['id']})
        elif p == '/api/checkins':
            rec = self._read_json()
            if not rec or not rec.get('venueId'):
                self._json(400, {'error': '打卡信息不完整'})
                return
            rec['id'] = 'c' + str(int(time.time() * 1000))
            rec['time'] = time.strftime('%Y-%m-%d %H:%M:%S')
            with LOCK:
                c = load_json(CHECKINS_FILE)
                c.append(rec)
                save_json(CHECKINS_FILE, c)
            self._json(200, {'ok': True, 'id': rec['id']})
        elif p == '/api/restore':
            if not self._is_admin():
                self._json(401, {'error': '需要管理员登录'})
                return
            data = self._read_json()
            with LOCK:
                save_json(BOOKINGS_FILE, data.get('bookings', []))
                save_json(CHECKINS_FILE, data.get('checkins', []))
            self._json(200, {'ok': True})
        else:
            self._json(404, {'error': 'not found'})

    # ---------- DELETE ----------
    def do_DELETE(self):
        u = urlparse(self.path)
        p = u.path
        if not self._is_admin():
            self._json(401, {'error': '需要管理员登录'})
            return
        m = re.match(r'^/api/bookings/([^/]+)$', p)
        if m:
            bid = unquote(m.group(1))
            with LOCK:
                b = load_json(BOOKINGS_FILE)
                nb = [x for x in b if x.get('id') != bid]
                save_json(BOOKINGS_FILE, nb)
            self._json(200, {'ok': True, 'deleted': len(b) - len(nb)})
            return
        m = re.match(r'^/api/checkins/([^/]+)$', p)
        if m:
            cid = unquote(m.group(1))
            with LOCK:
                c = load_json(CHECKINS_FILE)
                nc = [x for x in c if x.get('id') != cid]
                save_json(CHECKINS_FILE, nc)
            self._json(200, {'ok': True, 'deleted': len(c) - len(nc)})
            return
        self._json(404, {'error': 'not found'})


def main():
    port = 8000
    import sys
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    ip = '0.0.0.0'
    print('=' * 52)
    print(' 场地预约 · 内网服务器（含后台管理）')
    print(' 管理密码: %s  (可用 ADMIN_PASSWORD 环境变量修改)' % ADMIN_PASSWORD)
    print(' 主站:     http://<本机IP>:%d/' % port)
    print(' 后台:     http://<本机IP>:%d/admin.html' % port)
    print('=' * 52)
    HTTPServer((ip, port), Handler).serve_forever()


if __name__ == '__main__':
    main()
