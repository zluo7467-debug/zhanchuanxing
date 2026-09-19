import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Bot,
  Check,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Clock3,
  Compass,
  Expand,
  Footprints,
  Gamepad2,
  Headphones,
  Heart,
  Home,
  Info,
  Languages,
  Map,
  MapPin,
  Maximize2,
  Navigation,
  Pause,
  Play,
  Projector,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  UsersRound,
  Volume2,
  Wifi,
  X,
  Zap,
} from 'lucide-react'

type Tab = 'home' | 'guide' | 'project' | 'play' | 'profile'
type Overlay = 'route' | 'exhibit' | 'connect' | 'movie' | 'game' | null

const navItems: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'guide', label: '导览', icon: Compass },
  { id: 'project', label: '投影', icon: Projector },
  { id: 'play', label: '互动', icon: Gamepad2 },
  { id: 'profile', label: '我的', icon: UserRound },
]

const stops = [
  { name: '序厅·征途启程', time: '8分钟', state: 'done' },
  { name: '遵义会议展厅', time: '12分钟', state: 'active' },
  { name: '飞夺泸定桥', time: '10分钟', state: 'next' },
  { name: '雪山草地沉浸厅', time: '15分钟', state: 'next' },
  { name: '胜利会师厅', time: '10分钟', state: 'next' },
]

const films = [
  { title: '长征：伟大的转折', meta: '纪录短片 · 08:36', tone: 'red', tag: '热门' },
  { title: '翻越夹金山', meta: '历史影像 · 05:12', tone: 'blue', tag: '4K修复' },
  { title: '一封红军家书', meta: '人物故事 · 06:40', tone: 'amber', tag: '亲子' },
]

const games = [
  { title: '重走长征路', subtitle: '路线知识挑战', icon: Route, color: 'crimson', progress: 60 },
  { title: '红色电波', subtitle: '破译历史电报', icon: Zap, color: 'gold', progress: 0 },
  { title: '雪山草地同行', subtitle: '多人协作挑战', icon: UsersRound, color: 'green', progress: 0 },
]

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [connected, setConnected] = useState(false)
  const [toast, setToast] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [playing, setPlaying] = useState(false)

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    setPlaying(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab])

  const title = useMemo(() => navItems.find((item) => item.id === tab)?.label, [tab])

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <main className={`app-main page-${tab}`}>
          {tab === 'home' && (
            <HomePage
              connected={connected}
              open={setOverlay}
              go={setTab}
              connect={() => setOverlay('connect')}
            />
          )}
          {tab === 'guide' && <GuidePage open={setOverlay} />}
          {tab === 'project' && <ProjectPage connected={connected} open={setOverlay} connect={() => setOverlay('connect')} />}
          {tab === 'play' && <PlayPage open={setOverlay} />}
          {tab === 'profile' && <ProfilePage />}
        </main>

        <nav className="bottom-nav" aria-label="主导航">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} aria-label={label}>
              <Icon size={21} strokeWidth={tab === id ? 2.5 : 2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {overlay === 'route' && <RouteSheet close={() => setOverlay(null)} openExhibit={() => setOverlay('exhibit')} />}
        {overlay === 'exhibit' && (
          <ExhibitSheet
            close={() => setOverlay(null)}
            playing={playing}
            setPlaying={setPlaying}
            favorite={favorite}
            setFavorite={setFavorite}
            project={() => setOverlay('movie')}
          />
        )}
        {overlay === 'connect' && (
          <ConnectSheet
            close={() => setOverlay(null)}
            connected={connected}
            connect={() => {
              setConnected(true)
              setOverlay(null)
              showToast('已连接 栈川行01号机器人')
            }}
          />
        )}
        {overlay === 'movie' && (
          <MovieSheet
            close={() => setOverlay(null)}
            connected={connected}
            connect={() => setOverlay('connect')}
            showToast={showToast}
          />
        )}
        {overlay === 'game' && <GameSheet close={() => setOverlay(null)} showToast={showToast} />}

        {toast && (
          <div className="toast" role="status">
            <Check size={17} /> {toast}
          </div>
        )}
      </div>
      <div className="desktop-note">
        <span>移动端演示</span>
        <strong>{title}</strong>
        <p>可缩窄浏览器窗口或使用手机访问，体验更接近真实 App。</p>
      </div>
    </div>
  )
}

function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div className={`status-bar ${light ? 'light' : ''}`}>
      <span>9:41</span>
      <div><span className="signal">●●●</span><Wifi size={13} /><span className="battery">92</span></div>
    </div>
  )
}

function HomePage({
  connected,
  open,
  go,
  connect,
}: {
  connected: boolean
  open: (name: Overlay) => void
  go: (tab: Tab) => void
  connect: () => void
}) {
  return (
    <>
      <section className="hero">
        <StatusBar light />
        <div className="topline">
          <button className="location"><MapPin size={15} /> 长征纪念馆 <ChevronRight size={14} /></button>
          <button className="round-button" aria-label="搜索"><Search size={19} /></button>
        </div>
        <div className="hero-copy">
          <div className="eyebrow">纪念红军长征胜利90周年</div>
          <h1>栈川行</h1>
          <p>循着信仰的足迹，开启一段沉浸式长征之旅</p>
          <div className="hero-actions">
            <button className="primary-button light" onClick={() => open('route')}>开始智慧游览 <ArrowRight size={17} /></button>
            <button className="glass-button" onClick={connect}><Bot size={18} /> {connected ? '机器人已连接' : '呼叫机器人'}</button>
          </div>
        </div>
        <div className="mountains mountain-back" />
        <div className="mountains mountain-front" />
        <div className="route-dots"><i /><i /><i /><i /><i /></div>
      </section>

      <section className="content home-content">
        <div className="section-heading compact">
          <div><span className="section-kicker">为你推荐</span><h2>经典长征路线</h2></div>
          <button onClick={() => go('guide')}>全部路线 <ChevronRight size={15} /></button>
        </div>
        <button className="route-card" onClick={() => open('route')}>
          <div className="route-visual">
            <svg viewBox="0 0 300 140" aria-hidden="true">
              <path d="M23 110 C62 96,67 42,112 73 S167 124,202 74 S255 26,282 48" />
              {[['23','110'],['90','65'],['149','94'],['211','65'],['282','48']].map(([cx,cy], i) => <circle key={i} cx={cx} cy={cy} r={i === 1 ? 8 : 5} />)}
            </svg>
            <span className="mini-tag">人气路线</span>
            <div className="route-facts"><span><Clock3 size={13} /> 60分钟</span><span><MapPin size={13} /> 5个展厅</span></div>
          </div>
          <div className="route-copy">
            <div><h3>信仰之路 · 经典路线</h3><p>从战略转移到胜利会师，重温伟大征程</p></div>
            <span className="start-circle"><ArrowRight size={19} /></span>
          </div>
        </button>

        <div className="quick-grid">
          <button onClick={() => go('guide')}><span className="quick-icon rose"><Navigation size={21} /></span><div><strong>场馆导航</strong><small>智能规划路线</small></div></button>
          <button onClick={() => go('project')}><span className="quick-icon gold"><Projector size={21} /></span><div><strong>红色影院</strong><small>精选影片投影</small></div></button>
          <button onClick={() => go('play')}><span className="quick-icon green"><Gamepad2 size={21} /></span><div><strong>长征互动</strong><small>边玩边学历史</small></div></button>
          <button onClick={() => open('exhibit')}><span className="quick-icon blue"><Headphones size={21} /></span><div><strong>随身讲解</strong><small>深度语音导览</small></div></button>
        </div>

        <div className="section-heading compact"><div><span className="section-kicker">正在展映</span><h2>今日红色影像</h2></div><button onClick={() => go('project')}>查看更多 <ChevronRight size={15} /></button></div>
        <button className="feature-film" onClick={() => open('movie')}>
          <div className="film-art"><span className="sun" /><span className="flag" /><span className="play-medallion"><Play size={20} fill="currentColor" /></span><span className="duration">08:36</span></div>
          <div><span>纪录短片</span><h3>长征：伟大的转折</h3><p>回望遵义会议，见证中国革命的历史转折</p></div>
        </button>

        <div className="progress-banner">
          <div className="spark-icon"><Sparkles size={22} /></div>
          <div className="progress-copy"><small>我的精神火种</small><strong>已点亮 2 / 5 枚印记</strong><div className="bar"><i style={{ width: '40%' }} /></div></div>
          <ChevronRight size={18} />
        </div>
      </section>
    </>
  )
}

function GuidePage({ open }: { open: (name: Overlay) => void }) {
  return (
    <>
      <header className="plain-header"><StatusBar /><div className="header-row"><div><span className="section-kicker">智慧导览</span><h1>探索长征纪念馆</h1></div><button className="avatar">游</button></div></header>
      <section className="map-panel">
        <div className="map-controls"><button><Expand size={18} /></button><button><Navigation size={18} /></button></div>
        <div className="floor-pill">1F <ChevronRight size={13} /></div>
        <svg className="floor-map" viewBox="0 0 360 310" aria-label="场馆地图">
          <path className="room" d="M20 35h135v77H20zM172 35h168v77H172zM20 130h88v145H20zM125 130h105v66H125zM247 130h93v145h-93zM125 214h105v61H125z" />
          <path className="route-line" d="M54 236 C53 185 57 90 104 74 S184 73 203 100 S199 171 175 166 S156 237 188 243 S262 210 285 170" />
          <circle className="map-pin done" cx="54" cy="236" r="8" /><circle className="map-pin active" cx="104" cy="74" r="11" /><circle className="map-pin" cx="203" cy="100" r="8" /><circle className="map-pin" cx="175" cy="166" r="8" /><circle className="map-pin" cx="285" cy="170" r="8" />
          <text x="28" y="58">序厅</text><text x="188" y="58">遵义会议</text><text x="31" y="154">长征出发</text><text x="140" y="154">泸定桥</text><text x="260" y="154">雪山草地</text><text x="142" y="238">胜利会师</text>
        </svg>
        <div className="location-pulse"><Navigation size={14} fill="currentColor" /></div>
      </section>
      <section className="content guide-content">
        <div className="nearby-card"><span className="distance">距你 18m</span><div className="nearby-title"><span className="number">02</span><div><small>下一站</small><h2>遵义会议展厅</h2></div></div><p>中国共产党历史上一个生死攸关的转折点</p><div className="nearby-actions"><button className="secondary-button" onClick={() => open('exhibit')}><Headphones size={17} /> 听讲解</button><button className="primary-button" onClick={() => open('route')}><Navigation size={17} /> 开始导航</button></div></div>
        <div className="section-heading"><h2>推荐路线</h2><button>筛选 <ChevronRight size={15} /></button></div>
        <div className="route-list">
          <button onClick={() => open('route')}><span className="list-icon red"><Star size={19} /></span><div><strong>经典长征路线</strong><small>约60分钟 · 5个展厅</small></div><ChevronRight size={18} /></button>
          <button onClick={() => open('route')}><span className="list-icon gold"><UsersRound size={19} /></span><div><strong>亲子研学路线</strong><small>约45分钟 · 互动体验优先</small></div><ChevronRight size={18} /></button>
          <button onClick={() => open('route')}><span className="list-icon green"><Footprints size={19} /></span><div><strong>无障碍参观路线</strong><small>约50分钟 · 全程无台阶</small></div><ChevronRight size={18} /></button>
        </div>
      </section>
    </>
  )
}

function ProjectPage({ connected, open, connect }: { connected: boolean; open: (name: Overlay) => void; connect: () => void }) {
  return (
    <>
      <header className="dark-header"><StatusBar light /><div className="header-row"><div><span className="section-kicker">红色影院</span><h1>把历史带到眼前</h1></div><button className="round-button"><Search size={19} /></button></div><p>连接导览机器人，将精选红色影像投向展墙</p></header>
      <section className="content project-content">
        <button className={`device-card ${connected ? 'connected' : ''}`} onClick={connect}>
          <span className="device-orbit"><Bot size={28} /></span>
          <div><small>{connected ? '设备连接正常' : '尚未连接设备'}</small><strong>{connected ? '栈川行01号机器人' : '连接附近机器人'}</strong><span>{connected ? '电量 82% · 距离 3m' : '连接后可使用投影控制'}</span></div>
          <span className="status-dot">{connected ? '已连接' : <ChevronRight size={17} />}</span>
        </button>
        <div className="category-scroll"><button className="active">为你推荐</button><button>长征历史</button><button>人物故事</button><button>青少年</button></div>
        <button className="cinema-feature" onClick={() => open('movie')}>
          <div className="cinema-art"><span className="projector-beam" /><span className="big-star">★</span><span className="cinema-play"><Play size={24} fill="currentColor" /></span></div>
          <div className="cinema-copy"><span className="mini-tag">今日精选</span><h2>长征：伟大的转折</h2><p>回望遵义会议，见证中国革命的历史转折</p><div><span><Clock3 size={13} /> 08:36</span><span><BadgeCheck size={13} /> 官方史料</span></div></div>
        </button>
        <div className="section-heading"><h2>精选片库</h2><button>全部 24 部 <ChevronRight size={15} /></button></div>
        <div className="film-list">
          {films.slice(1).map((film) => <button key={film.title} onClick={() => open('movie')}><span className={`thumb ${film.tone}`}><Play size={18} fill="currentColor" /><i>{film.tag}</i></span><div><strong>{film.title}</strong><small>{film.meta}</small><span>了解更多 <ArrowRight size={13} /></span></div></button>)}
        </div>
        <div className="projection-tip"><Info size={19} /><p><strong>文明观影提示</strong><span>影片将在指定投影区域播放，请勿遮挡通道。</span></p></div>
      </section>
    </>
  )
}

function PlayPage({ open }: { open: (name: Overlay) => void }) {
  return (
    <>
      <header className="play-header"><StatusBar light /><div className="header-row"><div><span className="section-kicker">互动体验</span><h1>边玩边学，重走长征路</h1></div><span className="score"><Sparkles size={16} /> 260</span></div><div className="play-illustration"><span className="flag-pole" /><span className="play-flag">★</span><i className="hill one" /><i className="hill two" /><div className="journey-line">● · · ● · · ★</div></div></header>
      <section className="content play-content">
        <div className="daily-card"><div><span>今日挑战</span><h2>长征路线知识问答</h2><p>答对 5 题，点亮“求实”精神印记</p></div><button onClick={() => open('game')}>开始答题 <ArrowRight size={16} /></button></div>
        <div className="section-heading"><h2>趣味长征</h2><button>游戏规则 <Info size={15} /></button></div>
        <div className="game-list">
          {games.map(({ title, subtitle, icon: Icon, color, progress }) => (
            <button key={title} onClick={() => open('game')}>
              <span className={`game-art ${color}`}><Icon size={28} /><i /></span>
              <div><strong>{title}</strong><small>{subtitle}</small>{progress > 0 ? <span className="game-progress"><i style={{ width: `${progress}%` }} /></span> : <span className="new-label">NEW</span>}</div>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
        <div className="team-banner"><span><UsersRound size={25} /></span><div><strong>和伙伴一起挑战</strong><small>创建队伍，多人协作留下足迹</small></div><button>组队</button></div>
        <div className="spirit-title"><span /><h2>我的精神印记</h2><span /></div>
        <div className="badges">
          <div className="earned"><span>★</span><strong>坚定信念</strong></div><div className="earned"><span>火</span><strong>坚韧不拔</strong></div><div><span>锁</span><strong>团结奋进</strong></div><div><span>锁</span><strong>实事求是</strong></div><div><span>锁</span><strong>勇往直前</strong></div>
        </div>
      </section>
    </>
  )
}

function ProfilePage() {
  return (
    <>
      <header className="profile-header"><StatusBar /><div className="profile-top"><div className="portrait">旅</div><div><small>长征精神探索者</small><h1>游客 2026</h1><span><MapPin size={12} /> 长征纪念馆</span></div><button><ChevronRight size={18} /></button></div><div className="profile-stats"><div><strong>5</strong><span>已游展项</span></div><div><strong>2</strong><span>精神印记</span></div><div><strong>48<small>min</small></strong><span>探索时长</span></div></div></header>
      <section className="content profile-content">
        <div className="journey-card"><div className="journey-top"><div><span className="section-kicker">我的足迹</span><h2>栈川行·长征之旅</h2></div><span>40%</span></div><div className="journey-road"><i className="done">★</i><b /><i className="done">遵</i><b className="half" /><i>泸</i><b /><i>雪</i><b /><i>会</i></div><p>继续前往“飞夺泸定桥”，点亮下一枚印记</p></div>
        <div className="menu-card">
          <button><span className="menu-icon red"><Heart size={19} /></span><div><strong>我的收藏</strong><small>3 个展项 · 2 部影片</small></div><ChevronRight size={18} /></button>
          <button><span className="menu-icon gold"><Trophy size={19} /></span><div><strong>精神印记</strong><small>查看已获得的长征精神徽章</small></div><ChevronRight size={18} /></button>
          <button><span className="menu-icon blue"><BookOpenText size={19} /></span><div><strong>学习记录</strong><small>讲解、答题与互动足迹</small></div><ChevronRight size={18} /></button>
        </div>
        <div className="memorial-card"><div className="memorial-star">★</div><div><small>数字纪念卡</small><h2>让长征精神永放光芒</h2><p>生成你的专属参观纪念海报</p><button>立即生成 <ArrowRight size={15} /></button></div></div>
        <div className="settings-row"><button><Languages size={18} /><span>语言与字幕</span><small>简体中文</small><ChevronRight size={17} /></button><button><Info size={18} /><span>参观帮助</span><ChevronRight size={17} /></button></div>
      </section>
    </>
  )
}

function Sheet({ children, close, tall = false }: { children: React.ReactNode; close: () => void; tall?: boolean }) {
  return <div className="overlay" onMouseDown={close}><section className={`sheet ${tall ? 'tall' : ''}`} onMouseDown={(e) => e.stopPropagation()}><div className="sheet-handle" />{children}</section></div>
}

function SheetHeader({ title, subtitle, close }: { title: string; subtitle?: string; close: () => void }) {
  return <div className="sheet-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button onClick={close}><X size={20} /></button></div>
}

function RouteSheet({ close, openExhibit }: { close: () => void; openExhibit: () => void }) {
  const [started, setStarted] = useState(false)
  if (started) return <Sheet close={close} tall><SheetHeader title="正在为你导航" subtitle="下一站：遵义会议展厅" close={close} /><div className="navigation-live"><div className="nav-arrow"><Navigation size={38} fill="currentColor" /></div><strong>直行 18 米后右转</strong><span>预计 2 分钟到达</span></div><div className="live-route">{stops.slice(0, 3).map((s, i) => <div key={s.name} className={i === 1 ? 'active' : ''}><i>{i === 0 ? <Check size={13} /> : i + 1}</i><span><strong>{s.name}</strong><small>{i === 1 ? '正在前往' : s.time}</small></span></div>)}</div><button className="wide-button muted" onClick={close}><CirclePause size={18} /> 结束导航</button></Sheet>
  return <Sheet close={close} tall><SheetHeader title="信仰之路 · 经典路线" subtitle="约60分钟 · 全程1.2公里" close={close} /><div className="route-summary"><div><span>5</span><small>核心展厅</small></div><div><span>8</span><small>讲解节点</small></div><div><span>2</span><small>互动体验</small></div></div><div className="timeline">{stops.map((stop, i) => <button key={stop.name} onClick={i === 1 ? openExhibit : undefined}><i className={stop.state}>{stop.state === 'done' ? <Check size={13} /> : i + 1}</i><div><strong>{stop.name}</strong><small>{stop.time}{i === 1 ? ' · 距你18m' : ''}</small></div>{i === 1 && <ChevronRight size={17} />}</button>)}</div><div className="route-options"><span><Check size={14} /> 包含语音讲解</span><span><Check size={14} /> 支持机器人带路</span></div><button className="wide-button" onClick={() => setStarted(true)}><Navigation size={18} /> 开始导航</button></Sheet>
}

function ExhibitSheet({ close, playing, setPlaying, favorite, setFavorite, project }: { close: () => void; playing: boolean; setPlaying: (v: boolean) => void; favorite: boolean; setFavorite: (v: boolean) => void; project: () => void }) {
  return <Sheet close={close} tall><SheetHeader title="遵义会议" subtitle="1935年1月 · 贵州遵义" close={close} /><div className="exhibit-image"><span className="building"><i /><i /><i /><i /><b>遵义会议会址</b></span><button onClick={() => setFavorite(!favorite)}><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button></div><div className="audio-card"><button className="audio-play" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button><div><strong>{playing ? '正在播放讲解' : '听取语音讲解'}</strong><div className="audio-wave">{Array.from({ length: 20 }).map((_, i) => <i key={i} style={{ height: `${7 + (i * 7) % 17}px` }} />)}</div><small>02:18 / 05:40</small></div><button><Languages size={18} /></button></div><article className="history-copy"><h3>生死攸关的伟大转折</h3><p>遵义会议集中解决了当时具有决定意义的军事和组织问题，开始确立以毛泽东同志为主要代表的马克思主义正确路线在党中央的领导地位。</p><button>展开完整史料 <ChevronRight size={14} /></button></article><div className="spirit-callout"><Sparkles size={21} /><div><small>长征精神</small><strong>坚持真理 · 独立自主</strong></div></div><button className="wide-button" onClick={project}><Projector size={18} /> 投影观看相关影片</button></Sheet>
}

function ConnectSheet({ close, connected, connect }: { close: () => void; connected: boolean; connect: () => void }) {
  return <Sheet close={close}><SheetHeader title="连接导览机器人" subtitle="请选择附近可用设备" close={close} /><div className="scan-radar"><div><Bot size={33} /></div><i /><i /><i /></div><div className="robot-result"><span className="robot-avatar"><Bot size={24} /></span><div><strong>栈川行01号</strong><small><MapPin size={12} /> 距你3m · 电量82%</small></div><span className="available">空闲</span></div><button className="wide-button" onClick={connect}>{connected ? '重新连接' : '立即连接'}</button><p className="privacy-note">连接后可使用机器人带路、讲解、投影及互动功能</p></Sheet>
}

function MovieSheet({ close, connected, connect, showToast }: { close: () => void; connected: boolean; connect: () => void; showToast: (s: string) => void }) {
  const [projecting, setProjecting] = useState(false)
  const [paused, setPaused] = useState(false)
  if (projecting) return <Sheet close={close} tall><SheetHeader title="正在投影" subtitle="栈川行01号 · 遵义会议展厅投影区" close={close} /><div className="projection-screen"><div><span className="big-star">★</span><h3>长征：伟大的转折</h3><small>08:36</small></div></div><div className="project-timeline"><span>02:18</span><div><i style={{ width: '27%' }} /></div><span>08:36</span></div><div className="projection-controls"><button><RotateCcw size={21} /><small>-10s</small></button><button className="main-control" onClick={() => setPaused(!paused)}>{paused ? <Play size={25} fill="currentColor" /> : <Pause size={25} fill="currentColor" />}</button><button><Volume2 size={21} /><small>音量</small></button></div><div className="control-grid"><button><Languages size={18} /><span>中文字幕</span></button><button><Maximize2 size={18} /><span>画面校正</span></button></div><button className="wide-button muted" onClick={() => { setProjecting(false); showToast('投影已安全结束') }}>结束投影</button></Sheet>
  return <Sheet close={close} tall><SheetHeader title="长征：伟大的转折" subtitle="纪录短片 · 08:36" close={close} /><div className="movie-poster"><span className="big-star">★</span><button><CirclePlay size={48} /></button><span className="quality">4K 修复</span></div><article className="movie-detail"><div><span className="official"><BadgeCheck size={14} /> 官方史料</span><span>适合全年龄</span></div><p>以珍贵史料与地图动画，重现遵义会议前后的历史进程，理解中国革命实现伟大转折的关键所在。</p></article><div className="movie-spec"><span><Clock3 size={17} /><strong>8分36秒</strong><small>影片时长</small></span><span><Languages size={17} /><strong>双语字幕</strong><small>中 / 英</small></span><span><Projector size={17} /><strong>指定区域</strong><small>文明投影</small></span></div>{!connected && <button className="connect-warning" onClick={connect}><Bot size={20} /><div><strong>请先连接机器人</strong><small>连接后即可开始投影</small></div><ChevronRight size={18} /></button>}<button className="wide-button" disabled={!connected} onClick={() => setProjecting(true)}><Projector size={18} /> {connected ? '开始投影' : '等待设备连接'}</button></Sheet>
}

function GameSheet({ close, showToast }: { close: () => void; showToast: (s: string) => void }) {
  const [step, setStep] = useState(0)
  const [answered, setAnswered] = useState<number | null>(null)
  const options = ['瑞金', '遵义', '泸定', '会宁']
  if (step === 0) return <Sheet close={close} tall><SheetHeader title="重走长征路" subtitle="路线知识挑战 · 约3分钟" close={close} /><div className="game-cover"><Route size={54} /><span>● · · ● · · ★</span></div><div className="game-intro"><h3>沿历史足迹，点亮关键节点</h3><p>完成5道路线知识题，认识长征途中的重要地点与历史事件。</p><div><span><Trophy size={17} /> 答对3题即可获得印记</span><span><Sparkles size={17} /> 本次可得50同行值</span></div></div><button className="wide-button" onClick={() => setStep(1)}><Gamepad2 size={18} /> 开始挑战</button></Sheet>
  if (step === 2) return <Sheet close={close}><div className="success-burst"><span>★</span></div><div className="game-success"><span>挑战完成</span><h2>点亮“实事求是”印记</h2><p>长征的胜利，离不开从实际出发的判断与选择。</p><div><strong>+50</strong><small>同行值</small></div></div><button className="wide-button" onClick={() => { close(); showToast('精神印记已收入你的足迹') }}>收下印记</button></Sheet>
  return <Sheet close={close} tall><div className="quiz-top"><span>第 1 / 5 题</span><button onClick={close}><X size={20} /></button></div><div className="quiz-progress"><i style={{ width: '20%' }} /></div><div className="quiz-map"><span>?</span><svg viewBox="0 0 260 100"><path d="M5 73 C48 77,52 18,96 47 S154 80,185 38 S230 14,255 30" /></svg></div><div className="quiz-copy"><span>路线知识</span><h2>1935年1月，中共中央政治局扩大会议在哪座城市召开？</h2></div><div className="quiz-options">{options.map((option, index) => <button key={option} className={answered === index ? (index === 1 ? 'correct' : 'wrong') : ''} onClick={() => setAnswered(index)}><i>{String.fromCharCode(65 + index)}</i><span>{option}</span>{answered === index && (index === 1 ? <Check size={18} /> : <X size={18} />)}</button>)}</div>{answered !== null && <div className="answer-note"><strong>{answered === 1 ? '回答正确！' : '正确答案是：遵义'}</strong><span>遵义会议是党的历史上一个生死攸关的转折点。</span></div>}<button className="wide-button" disabled={answered === null} onClick={() => setStep(2)}>查看挑战结果 <ArrowRight size={17} /></button></Sheet>
}

export default App
