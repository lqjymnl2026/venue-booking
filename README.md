# 场地预约网站

一个手机端友好的静态网页，用于场地预约：场地明细、布局示意、预约流程、可约看板、在线预约、恢复打卡、守则制度、联系方式。

## 快速开始

直接双击打开 `index.html` 即可预览（建议用 Chrome / Safari 手机模式查看）。

本地起服务（推荐，手机可同网访问）：

```bash
cd venue-booking
python3 -m http.server 8080
```

浏览器打开 http://localhost:8080

## 文件说明

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构 |
| `styles.css` | 样式（含移动端与打印样式） |
| `data.js` | **所有数据都在这**：场地、负责人、电话、布局、守则 |
| `app.js` | 页面交互逻辑 |
| `README.md` | 本说明 |

## 如何修改内容（重要）

### 1. 填写负责人真实电话
打开 `data.js`，找到每个场地的 `phone` 字段，把示例号码改成真实号码，例如：

```js
phone: '138-1234-5678'
```

改完页面会自动显示「一键拨打」，联系方式区也会自动更新。

### 2. 修改场地布局
每个场地都有 `layout.items`，是"示意图布局"（坐标 0~400 × 0~300）。支持的类型有：
`stage 讲台` `screen 投影幕` `board 白板` `speaker 音响` `piano 钢琴` `rows 座椅区` `table 桌椅` `round 圆桌` `sofa 沙发` `teatable 茶几` `water 茶水台` `bookshelf 书架` `door 入口` `window 窗` `ac 空调` `power 电源` `trash 垃圾桶` `closet 储物柜` `carpet 地毯`。

```js
{ kind: 'window', x: 20, y: 60, w: 18, h: 100, label: '窗' }
```

### 3. 核对"后百丈"拆分
原表中"后百丈"多次出现且人数为 `(201人)` `(121人)`，我按 **约20人 / 约12人** 拆成了两个小厅，请核对实际房间名与人数后修改 `data.js`。

### 4. 修改守则 / 罚款 / 清单
守则、罚款、恢复清单都在 `data.js` 顶部的 `RULES`、`PENALTIES`、`CHECKLIST` 中，直接改文字即可。

## 部署上线（生成可分享链接）

静态站可免费部署到：

- **GitHub Pages**：把 `venue-booking` 文件夹推到 GitHub 仓库 → Settings → Pages 开启
- **Netlify**：`npx netlify deploy`
- **Vercel**：`vercel`

部署后即可获得 https 链接，微信里可直接打开分享。



## 后台管理（内网服务器版）

> 静态网页版（GitHub）没有后台；后台需要运行内网服务器 `server.py`。

### 启动后台服务器

```bash
cd venue-booking
ADMIN_PASSWORD=你的密码 python3 server.py 8000
```

- 主站：http://电脑IP:8000/
- 后台管理：http://电脑IP:8000/admin.html （默认密码 `123456`，启动时用 `ADMIN_PASSWORD` 环境变量修改）
- 预约/打卡数据统一保存在服务器 `data/` 文件夹，全教会共享
- 手机访问主站时会自动识别服务器模式，看板/统计显示共享数据

### 后台功能

| 功能 | 说明 |
| --- | --- |
| 预约台账 | 查看全部预约（含联系人电话）、一键删除 |
| 恢复打卡 | 查看打卡记录与照片、删除 |
| 使用统计 | 场地/时段/周几热度 |
| 一键导出 Excel | 导出 .xlsx（预约台账 + 恢复打卡） |
| 数据备份 | 下载 JSON 备份 / 恢复备份 |

### 开机自启（可选）

macOS：把启动命令加入「系统设置 → 通用 → 登录项」，或参考 `server.py` 用 launchd 配置。

## 进阶功能（已实现）

| 功能 | 说明 |
| --- | --- |
| 📱 二维码海报 | 打开 `posters.html`，每个场地一张 A4 海报（含专属二维码，扫码直达对应场地），可直接打印张贴在场地门口 |
| ⏰ 预约前一天提醒 | 预约时勾选「预约前一天提醒我」并开启浏览器通知；打开网页时自动检查是否有明天到期的预约并提醒（静态站限制：需网页处于打开状态；真正的推送通知需后端） |
| 📊 使用统计 | 场地热度 TOP / 时段热度 / 周几热度 图表，基于本机预约数据 |
| 📝 一键导出 Excel | 看板区/后台「导出台账(Excel)」按钮，一键下载 .xlsx（预约台账 + 恢复打卡 + 使用统计 3 个工作表） |
| 🔄 多标签页实时同步 | 同一浏览器打开多个标签页，预约后其他标签页自动刷新看板与统计 |

## 接入云端数据库（多人实时同步，可选）

当前预约数据保存在各人浏览器 localStorage（单机演示）。要做成全团队多人实时同步，需要一个后端，常见方案：

### 方案 A：微信小程序云开发（推荐给团队使用场景）
1. 开通微信小程序「云开发」，创建环境；
2. 建集合 `bookings`，把 `index.html` 里预约提交逻辑改为调用 `wx.cloud.database().collection('bookings').add({ data: rec })`；
3. 看板用 `watch()` 实时监听集合变化。
（需要注册小程序账号，我可以帮你把代码改造好）

### 方案 B：Supabase（免费、无需小程序账号）
1. 到 supabase.com 注册，新建项目；
2. 建表 `bookings`，复制 URL 和 anon key；
3. 在 `index.html` 引入 supabase-js，替换 `app.js` 里的 `getLS/setLS(LS_BOOK,...)` 读写即可。

### 方案 C：自建服务器
用 Node.js/云函数提供 REST API：`GET/POST /api/bookings`，静态页调用接口读写。

> 需要我帮你接入以上任意方案时，告诉我你选哪个、并准备好账号密钥即可。

## 说明

- 「每周可约看板」和「打卡记录」保存在本机浏览器（localStorage），是**单机演示**；
  多人实时同步需要后端（如小程序云开发 / 数据库），如需可进一步开发。
- 布局图为示意图，实际以现场为准。
- 线上地址：https://lqjymnl2026.github.io/venue-booking/ （仓库：lqjymnl2026/venue-booking）
- 海报页：https://lqjymnl2026.github.io/venue-booking/posters.html
