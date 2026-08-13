# 教会场地预约网站

一个手机端友好的静态网页，用于教会场地预约：场地明细、布局示意、预约流程、可约看板、在线预约、恢复打卡、守则制度、联系方式。

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
`stage 讲台` `screen 投影幕` `board 白板` `speaker 音响` `piano 钢琴` `rows 座椅区` `table 桌椅` `round 圆桌` `sofa 沙发` `teatable 茶几` `water 茶水台` `cross 十字架` `bookshelf 书架` `door 入口` `window 窗` `ac 空调` `power 电源` `trash 垃圾桶` `closet 储物柜` `carpet 地毯`。

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

## 说明

- 「每周可约看板」和「打卡记录」保存在本机浏览器（localStorage），是**单机演示**；
  多人实时同步需要后端（如小程序云开发 / 数据库），如需可进一步开发。
- 布局图为示意图，实际以现场为准。
