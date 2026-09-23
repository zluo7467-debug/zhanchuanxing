export type Tab = 'home' | 'guide' | 'cinema' | 'explore' | 'profile'
export type IconName = 'home' | 'compass' | 'cinema' | 'explore' | 'profile' | 'arrow' | 'chevron' | 'close' | 'search' | 'pin' | 'audio' | 'robot' | 'route' | 'play' | 'pause' | 'check' | 'heart' | 'volume' | 'back' | 'signal' | 'wifi' | 'battery' | 'settings' | 'clock' | 'expand' | 'download' | 'book' | 'caption' | 'flag'
export const navigation: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: '首页', icon: 'home' },
  { id: 'guide', label: '导览', icon: 'compass' },
  { id: 'cinema', label: '放映', icon: 'cinema' },
  { id: 'explore', label: '互动', icon: 'explore' },
  { id: 'profile', label: '足迹', icon: 'route' },
]
export const exhibits = [
  { id: 'departure', name: '征途启程', tag: '序厅', date: '1934年10月', place: '江西', minutes: 6, spirit: '理想与信念', image: 'departure-route.png', description: '1934年10月，中央红军主力开始长征。一次艰难的战略转移，由此开启了一段改写历史的征程。', source: '内容依据中央党史和文献研究院公开长征史实整理。' },
  { id: 'zunyi', name: '遵义会议', tag: '第二展厅', date: '1935年1月', place: '贵州遵义', minutes: 10, spirit: '独立自主 · 实事求是', image: 'zunyi.png', description: '1935年1月，中共中央政治局在遵义召开扩大会议。会议集中解决了当时具有决定意义的军事和组织问题，是党的历史上一个生死攸关的转折点。', source: '内容依据遵义会议纪念馆公开史实整理。' },
  { id: 'chishui', name: '四渡赤水', tag: '第三展厅', date: '1935年1—3月', place: '贵州、四川', minutes: 10, spirit: '机动与判断', image: 'chishui.png', description: '四渡赤水是长征途中以灵活机动摆脱围追堵截的经典战例，展现了在复杂局势中坚持独立自主、不断调整行动的智慧。', source: '内容依据公开长征史实和相关路线图整理。' },
  { id: 'jinsha', name: '巧渡金沙江', tag: '第四展厅', date: '1935年5月', place: '云南金沙江', minutes: 10, spirit: '团结与机智', image: 'jinsha.png', description: '红军以周密组织和群众支持渡过金沙江，跳出了数十万敌军的围追堵截，为继续北上争取了主动。', source: '内容依据公开长征史实和相关路线图整理。' },
  { id: 'luding', name: '飞夺泸定桥', tag: '第五展厅', date: '1935年5月', place: '四川泸定', minutes: 10, spirit: '勇气与担当', image: 'luding.png', description: '1935年5月，红军在长征途中夺取泸定桥，打开了继续北上的通道。让我们从桥梁、山川与行军路线中，理解这次行动面临的艰难条件。', source: '内容依据中国人民革命军事博物馆公开长征史实整理。' },
  { id: 'snow', name: '爬雪山过草地', tag: '第六展厅', date: '1935年', place: '川西高原', minutes: 15, spirit: '坚韧与互助', image: 'snow.png', description: '严寒、缺氧与给养不足，是红军翻越雪山、走过草地时面临的严峻挑战。前进的队伍相互扶持，在极端困难中坚持理想与信念。', source: '内容依据中央党史和文献研究院公开长征史实整理。' },
  { id: 'reunion', name: '胜利会师', tag: '会师厅', date: '1936年10月', place: '甘肃会宁、将台堡（今属宁夏）', minutes: 10, spirit: '团结与奋进', image: 'reunion.png', description: '1936年10月，红军三大主力在会宁、将台堡地区会师，标志着长征胜利结束。长征的足迹，成为留给后人的宝贵精神财富。', source: '参考中共中央党史和文献研究院公开长征史实；出处入口见史料层。' },
]
export const routes = [
  { title: '精简重点线路', caption: '40分钟，走近长征最关键的四个节点。', minutes: 40, stops: [0, 1, 4, 6], tag: '重点线路' },
  { title: '详尽完整线路', caption: '90分钟，按历史顺序走完七个重要节点。', minutes: 90, stops: [0, 1, 2, 3, 4, 5, 6], tag: '完整线路' },
]
export const films = [
  { id: 'turn', title: '伟大的转折', category: '历史纪事', year: '1935', duration: 516, label: '从遵义，读懂一次转折。', description: '通过历史背景与路线变化，认识遵义会议及其历史意义。', motif: 'turn' },
  { id: 'mountain', title: '山那边，是信念', category: '长征故事', year: '1935', duration: 312, label: '翻越雪山，也穿越时间。', description: '认识红军翻越雪山时面临的严寒与给养困难，理解坚持与互助的力量。', motif: 'mountain' },
  { id: 'letter', title: '一封未寄出的家书', category: '人物叙事', year: '1934', duration: 400, label: '从一个人，走近一段历史。', description: '以家书为叙事意象，理解长征中的理想、牵挂与选择。此项为待制作的策划内容。', motif: 'letter' },
  { id: 'red-star-game', title: '红星小队，出发！', category: '趣味游戏', year: '互动', duration: 300, label: '五关冒险，一起走过一段历史。', description: '整装集合、点亮时间线、桥面寻路、草地绕行、会师接力。通过点击或方向键，体验五种仿真投影玩法。', motif: 'turn', game: true },
]
export const questions = [
  { prompt: '1935年1月，中共中央政治局扩大会议在哪座城市召开？', options: ['瑞金', '遵义', '泸定', '会宁'], answer: 1, explanation: '遵义会议是党的历史上一个生死攸关的转折点。' },
  { prompt: '中央红军主力于哪一年开始长征？', options: ['1931年', '1934年', '1936年', '1949年'], answer: 1, explanation: '1934年10月，中央红军主力开始长征。' },
  { prompt: '泸定桥跨越的是哪一条河？', options: ['黄河', '金沙江', '大渡河', '湘江'], answer: 2, explanation: '泸定桥横跨大渡河，是红军继续北上的重要通道。' },
  { prompt: '红军三大主力胜利会师发生在什么时候？', options: ['1934年10月', '1935年1月', '1935年5月', '1936年10月'], answer: 3, explanation: '1936年10月，红军三大主力会师，标志着长征胜利结束。' },
  { prompt: '哪一项最能体现雪山草地行军中的团结精神？', options: ['各自前行', '相互扶持', '只顾速度', '放弃同伴'], answer: 1, explanation: '相互扶持、共同前进，是长征精神的重要体现。' },
]
export type Exhibit = typeof exhibits[number]
export type Film = typeof films[number]
export function formatTime(seconds: number) { return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}` }
