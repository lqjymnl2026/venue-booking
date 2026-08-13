/* =========================================================
 * 场地预约 · 数据配置（修改这里即可更新全站内容）
 * =========================================================
 * 编辑说明：
 * 1. phone：负责人联系电话，请把示例号码改成真实号码
 *    （如 '138-1234-5678'），留空则页面显示"待补充"。
 * 2. 场地布局 layout.items 为"示意布局"，坐标 0~400 × 0~300，
 *    可按实际现场调整位置与大小。
 * 3. 后百丈拆分为：大厅 / 中厅 / 小厅1 / 小厅2（人数约20 / 约12），
 *    请核对实际房间名称与人数后修改。
 * ========================================================= */

// ---------- 场地数据 ----------
const VENUES = [
  {
    id: 'duogongneng',
    name: '多功能厅',
    manager: '吴宁宁',
    phone: '138-0000-0001',          // TODO: 填写真实电话
    capacity: '50人以上',
    audience: '组长及以上',
    note: '大型活动、会议、培训',
    book: { advance: '至少提前1天', maxDuration: '每次不超过3小时' },
    layout: {
      type: 'hall',
      title: '多功能厅 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'window', x: 20,  y: 60,  w: 18, h: 100, label: '窗' },
        { kind: 'window', x: 362, y: 60,  w: 18, h: 100, label: '窗' },
        { kind: 'stage',  x: 120, y: 16,  w: 160, h: 42, label: '讲台' },
        { kind: 'screen', x: 150, y: 4,   w: 100, h: 10, label: '投影幕' },
        { kind: 'speaker',x: 82,  y: 22,  w: 26, h: 22, label: '音响' },
        { kind: 'speaker',x: 292, y: 22,  w: 26, h: 22, label: '音响' },
        { kind: 'rows',   x: 70,  y: 78,  w: 260, h: 150, label: '座椅区（50人+）' },
        { kind: 'ac',     x: 20,  y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'ac',     x: 340, y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'power',  x: 322, y: 236, w: 40, h: 20, label: '电源总闸' },
        { kind: 'trash',  x: 250, y: 236, w: 28, h: 20, label: '垃圾桶' }
      ]
    }
  },
  {
    id: 'enhuishi',
    name: '和睦室',
    manager: '吴宁宁',
    phone: '138-0000-0001',
    capacity: '50人以上',
    audience: '团队活动或使用人数50人以上',
    note: '团队性活动',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'classroom',
      title: '和睦室 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'window', x: 20,  y: 50,  w: 18, h: 120, label: '窗' },
        { kind: 'window', x: 362, y: 50,  w: 18, h: 120, label: '窗' },
        { kind: 'board',  x: 130, y: 16,  w: 140, h: 36, label: '白板' },
        { kind: 'table',  x: 60,  y: 84,  w: 280, h: 130, label: '可拼组桌椅（50人+）' },
        { kind: 'ac',     x: 24,  y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' },
        { kind: 'trash',  x: 250, y: 236, w: 28, h: 20, label: '垃圾桶' }
      ]
    }
  },
  {
    id: 'bolifang',
    name: '玻璃房',
    manager: '许志军',
    phone: '138-0000-0002',
    capacity: '10-20人',
    audience: '组长及以上或团队性活动',
    note: '四面玻璃、采光好',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'meeting',
      title: '玻璃房 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'board',  x: 130, y: 16,  w: 140, h: 34, label: '白板' },
        { kind: 'round',  x: 120, y: 100, w: 160, h: 100, label: '会议桌' },
        { kind: 'window', x: 20,  y: 60,  w: 16, h: 130, label: '玻璃墙' },
        { kind: 'window', x: 364, y: 60,  w: 16, h: 130, label: '玻璃墙' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' }
      ]
    }
  },
  {
    id: 'shangquan',
    name: '上泉茶室',
    manager: '苏洁',
    phone: '138-0000-0003',
    capacity: '10人以内',
    audience: '茶叙、接待、小型交通',
    note: '开放周期：周一至周六 08:00–21:00',
    book: { advance: '至少提前1天', maxDuration: '每次使用不超过3小时' },
    layout: {
      type: 'tea',
      title: '上泉茶室 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'window', x: 20,  y: 70,  w: 18, h: 100, label: '窗' },
        { kind: 'window', x: 362, y: 70,  w: 18, h: 100, label: '窗' },
        { kind: 'sofa',   x: 60,  y: 80,  w: 120, h: 46, label: '沙发' },
        { kind: 'sofa',   x: 220, y: 80,  w: 120, h: 46, label: '沙发' },
        { kind: 'teatable', x: 130, y: 140, w: 140, h: 50, label: '茶几' },
        { kind: 'water',  x: 60,  y: 220, w: 70, h: 40, label: '茶水台' },
        { kind: 'closet', x: 300, y: 220, w: 60, h: 40, label: '茶具柜' }
      ]
    }
  },
  {
    id: 'jiayouxiaozhan',
    name: '家有小栈',
    manager: '吴宁宁',
    phone: '138-0000-0001',
    capacity: '10-15人',
    audience: '组长或骨干层面（人数10-15人）',
    note: '家庭式温馨交流',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'home',
      title: '家有小栈 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'carpet', x: 90,  y: 70,  w: 220, h: 140, label: '地毯' },
        { kind: 'sofa',   x: 90,  y: 78,  w: 100, h: 40, label: '沙发' },
        { kind: 'sofa',   x: 90,  y: 162, w: 100, h: 40, label: '沙发' },
        { kind: 'teatable', x: 130, y: 122, w: 140, h: 36, label: '茶几' },
        { kind: 'bookshelf', x: 320, y: 60, w: 44, h: 80, label: '书架' },
        { kind: 'water',  x: 320, y: 190, w: 50, h: 36, label: '饮水机' },
        { kind: 'power',  x: 300, y: 236, w: 40, h: 20, label: '电源' }
      ]
    }
  },
  {
    id: 'daogaoshi',
    name: '静心室',
    manager: '吴宁宁',
    phone: '138-0000-0001',
    capacity: '50人以上',
    audience: '团队活动或使用人数50人以上',
    note: '静思、休息',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'prayer',
      title: '静心室 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'rows',   x: 80,  y: 96,  w: 240, h: 120, label: '座椅/跪凳区' },
        { kind: 'closet', x: 40,  y: 60,  w: 44, h: 60, label: '书柜' },
        { kind: 'ac',     x: 320, y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'power',  x: 40,  y: 236, w: 40, h: 20, label: '电源' }
      ]
    }
  },
  {
    id: 'peixunshi1',
    name: '培训室1',
    manager: '吴宁宁',
    phone: '138-0000-0001',
    capacity: '30人以上',
    audience: '组织内部培训（组长层面以上，人数30人及以上）',
    note: '培训、学习',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'classroom',
      title: '培训室1 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'board',  x: 130, y: 16,  w: 140, h: 36, label: '白板' },
        { kind: 'screen', x: 150, y: 4,   w: 100, h: 10, label: '投影幕' },
        { kind: 'table',  x: 60,  y: 84,  w: 280, h: 130, label: '课桌椅（30人+）' },
        { kind: 'ac',     x: 24,  y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' },
        { kind: 'trash',  x: 250, y: 236, w: 28, h: 20, label: '垃圾桶' }
      ]
    }
  },
  {
    id: 'peixunshi2',
    name: '培训室2',
    manager: '吴宁宁',
    phone: '138-0000-0001',
    capacity: '大组（50人内）',
    audience: '组长以上活动或大组活动',
    note: '组长以上活动',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'classroom',
      title: '培训室2 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'board',  x: 130, y: 16,  w: 140, h: 36, label: '白板' },
        { kind: 'table',  x: 60,  y: 84,  w: 280, h: 130, label: '桌椅区（大组）' },
        { kind: 'ac',     x: 24,  y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' },
        { kind: 'trash',  x: 250, y: 236, w: 28, h: 20, label: '垃圾桶' }
      ]
    }
  },
  {
    id: 'lianchangshi',
    name: '练唱室',
    manager: '吴宁宁',
    phone: '138-0000-0001',
    capacity: '15-20人',
    audience: '音乐/声乐团队',
    note: '排练、练唱',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'singing',
      title: '练唱室 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'piano',  x: 130, y: 20,  w: 100, h: 44, label: '钢琴' },
        { kind: 'board',  x: 250, y: 16,  w: 110, h: 34, label: '白板' },
        { kind: 'speaker',x: 60,  y: 90,  w: 30, h: 24, label: '音响' },
        { kind: 'speaker',x: 310, y: 90,  w: 30, h: 24, label: '音响' },
        { kind: 'rows',   x: 80,  y: 130, w: 240, h: 90, label: '谱架/座椅区' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' },
        { kind: 'trash',  x: 250, y: 236, w: 28, h: 20, label: '垃圾桶' }
      ]
    }
  },
  {
    id: 'xiaodaogaoshi',
    name: '小静心室',
    manager: '周露露',
    phone: '138-0000-0004',
    capacity: '10人以内',
    audience: '组长层面以上或关怀小组',
    note: '静思、休息',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'smallprayer',
      title: '小静心室 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'rows',   x: 110, y: 110, w: 180, h: 90, label: '座椅区' },
        { kind: 'closet', x: 40,  y: 60,  w: 44, h: 60, label: '书柜' },
        { kind: 'power',  x: 40,  y: 236, w: 40, h: 20, label: '电源' }
      ]
    }
  },
  {
    id: 'houbaizhang-dating',
    name: '后百丈·大厅',
    manager: '赵焕焕',
    phone: '138-0000-0005',
    capacity: '50人以上',
    audience: '50人及以上（团队性使用预约）',
    note: '团队性大型活动',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'hall',
      title: '后百丈·大厅 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'stage',  x: 120, y: 16,  w: 160, h: 42, label: '讲台' },
        { kind: 'screen', x: 150, y: 4,   w: 100, h: 10, label: '投影幕' },
        { kind: 'speaker',x: 82,  y: 22,  w: 26, h: 22, label: '音响' },
        { kind: 'speaker',x: 292, y: 22,  w: 26, h: 22, label: '音响' },
        { kind: 'rows',   x: 70,  y: 80,  w: 260, h: 150, label: '座椅区（50人+）' },
        { kind: 'ac',     x: 20,  y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'ac',     x: 340, y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'power',  x: 322, y: 236, w: 40, h: 20, label: '电源总闸' }
      ]
    }
  },
  {
    id: 'houbaizhang-zhongting',
    name: '后百丈·中厅',
    manager: '赵焕焕',
    phone: '138-0000-0005',
    capacity: '50-60人',
    audience: '组长以上活动或大组活动（50-60人）',
    note: '大组活动',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'classroom',
      title: '后百丈·中厅 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'board',  x: 130, y: 16,  w: 140, h: 36, label: '白板' },
        { kind: 'screen', x: 150, y: 4,   w: 100, h: 10, label: '投影幕' },
        { kind: 'table',  x: 60,  y: 84,  w: 280, h: 130, label: '桌椅区（50-60人）' },
        { kind: 'ac',     x: 24,  y: 210, w: 40, h: 14, label: '空调' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' }
      ]
    }
  },
  {
    id: 'houbaizhang-xiaoting1',
    name: '后百丈·小厅1',
    manager: '赵焕焕',
    phone: '138-0000-0005',
    capacity: '约20人',
    audience: '小组活动（约20人）',   // TODO: 核对原表"小组活动(20人)"人数
    note: '小组活动',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'meeting',
      title: '后百丈·小厅1 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'board',  x: 130, y: 16,  w: 140, h: 34, label: '白板' },
        { kind: 'round',  x: 100, y: 90,  w: 200, h: 110, label: '小组圆桌' },
        { kind: 'window', x: 20,  y: 70,  w: 16, h: 110, label: '窗' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' }
      ]
    }
  },
  {
    id: 'houbaizhang-xiaoting2',
    name: '后百丈·小厅2',
    manager: '赵焕焕',
    phone: '138-0000-0005',
    capacity: '约12人',
    audience: '小组活动（约12人）',   // TODO: 核对原表"小组活动(12人)"人数
    note: '小组活动',
    book: { advance: '至少提前1天' },
    layout: {
      type: 'meeting',
      title: '后百丈·小厅2 · 布局示意',
      items: [
        { kind: 'door',   x: 175, y: 268, w: 50, h: 18, label: '入口' },
        { kind: 'round',  x: 120, y: 90,  w: 160, h: 100, label: '小组圆桌' },
        { kind: 'window', x: 20,  y: 70,  w: 16, h: 110, label: '窗' },
        { kind: 'power',  x: 320, y: 236, w: 40, h: 20, label: '电源' }
      ]
    }
  }
];

// ---------- 预约时段（可约看板用） ----------
const SLOTS = [
  { id: 'morning',   label: '上午',   time: '08:00–12:00' },
  { id: 'afternoon', label: '下午',   time: '13:00–17:00' },
  { id: 'evening',   label: '晚上',   time: '18:00–21:00' }
];

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// ---------- 使用后恢复清单（打卡） ----------
const CHECKLIST = [
  { id: 'electric',  text: '关闭所有电器、灯、调音台、乐器等', icon: '💡' },
  { id: 'windows',   text: '关闭所有门、窗', icon: '🚪' },
  { id: 'cover',     text: '盖上调音台以及乐器的盖布，避免落灰', icon: '🎻' },
  { id: 'floor',     text: '地面打扫并拖干净', icon: '🧹' },
  { id: 'trash',     text: '垃圾桶垃圾处理，并套上新的垃圾袋', icon: '🗑️' },
  { id: 'return',    text: '桌椅归位：椅子8把一摞，桌子恢复叠放整齐', icon: '🪑' },
  { id: 'ac',        text: '确认空调已关闭', icon: '❄️' },
  { id: 'photo',     text: '拍照打卡证明', icon: '📷' }
];

// ---------- 违规处理 ----------
const PENALTIES = [
  { item: '灯未关',     amount: '每盏 20 元' },
  { item: '窗未关',     amount: '每扇 20 元' },
  { item: '空调未关',   amount: '每个 100 元' },
  { item: '垃圾未倒',   amount: '请将此场地卫生大扫除一次（仅对本堂）' }
];

// ---------- 场地预约守则 ----------
const RULES = {
  intro: '为了更好的节约公共资源，对场地的预约有以下要求：请参考场地预约明细表，根据此表预约。',
  items: [
    { title: '预约不用', desc: '请至少提前一周说明，以便其他人使用！（如：预约不用也不说明，发现两次以上者，停止本团队使用此场地一个季度。）' },
    { title: '长期使用', desc: '使用期限不超过3个月（公用场地：若是场地固定每周要用，最多预约时长一个季度，若是到期，可继续预约。晨间活动除外）。' },
    { title: '使用冲突', desc: '如小组或团队预约场地与正式活动冲突的，小组或团队需要顺服正式活动使用。' },
    { title: '活动结束', desc: '请关闭场地电源（如：灯、音响和电器设备），以及门窗。（备注：窗户未关：一扇20元；灯和风扇未关：一盏或一扇20元；空调未关：每个100元。）' },
    { title: '场地复原', desc: '请保持场地清洁卫生，垃圾随手带走。（卫生没有打扫或将垃圾带走的请在本周内将此场地大扫除一次，打卡证明！）' }
  ],
  requiredInfo: '预约场地需要注明：团队名、时间、周几、地点、活动主题、参加对象以及参加人数。',
  note: '备注：每次活动结束：请拍照打卡证明！',
  verse: '场地有限，彼此珍惜 · 使用完毕，恢复原样'
};
