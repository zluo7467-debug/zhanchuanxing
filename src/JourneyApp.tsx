import { useEffect, useRef, useState } from 'react'
import { BrandMark, Icon } from './Visuals'
import { exhibits, films, navigation, type Tab } from './content'
import { HomePage, GuidePage, CinemaPage, ExplorePage, ProfilePage } from './Pages'
import { CardPanel, CollectionPanel, ConnectPanel, ExhibitPanel, GamePanel, MoviePanel, RoutePanel, SearchPanel, SettingsPanel, Sheet } from './Panels'
import type { Panel, Saved } from './ui'

const empty: Saved = { favorites: [], visited: [], completed: [] }
function initialSaved(): Saved {
  // Read the legacy key only to preserve visitor records after the brand update.
  try { const data = JSON.parse(localStorage.getItem('zhanchuanxing-visitor-v2') || localStorage.getItem('xinghuo-visitor-v2') || 'null'); return data && ['favorites','visited','completed'].every(key => Array.isArray(data[key]) && data[key].every((v: unknown) => typeof v === 'string')) ? data : empty } catch { return empty }
}
export default function JourneyApp() {
  const [tab, setTab] = useState<Tab>('home')
  const [panel, setPanel] = useState<Panel | null>(null)
  const [returnPanel, setReturnPanel] = useState<Panel | null>(null)
  const [connected, setConnected] = useState(false)
  const [saved, setSaved] = useState<Saved>(initialSaved)
  const [toast, setToast] = useState('')
  const [largeText, setLargeText] = useState(false)
  const contentRef = useRef<HTMLElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notify = (message: string) => { setToast(message); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2800) }
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])
  useEffect(() => { try { localStorage.setItem('zhanchuanxing-visitor-v2', JSON.stringify(saved)) } catch { /* Browsing works without persistent storage. */ } }, [saved])
  const go = (next: Tab) => { setTab(next); contentRef.current?.scrollTo({ top: 0, behavior: 'instant' }); setPanel(null) }
  const visit = (id: string) => setSaved(s => ({ ...s, visited: [...new Set([...s.visited, id])] }))
  const favorite = (id: string) => setSaved(s => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter(f => f !== id) : [...s.favorites, id] }))
  const complete = (id: string) => setSaved(s => ({ ...s, completed: [...new Set([...s.completed, id])] }))
  const close = () => setPanel(null)
  const connect = () => { setReturnPanel(panel?.kind === 'movie' ? panel : null); setPanel({ kind: 'connect' }) }
  const panelTitle = panel ? panel.kind === 'route' ? '路线详情' : panel.kind === 'exhibit' ? exhibits[panel.index].name : panel.kind === 'movie' ? films[panel.index].title : panel.kind === 'game' ? '长征探索' : ({ connect:'我的向导', search:'搜索', settings:'阅读设置', collection:'我的收藏', card:'旅程纪念卡' } as const)[panel.kind] : ''
  return <div className="design-stage">
    <aside className="stage-intro" aria-label="原型信息"><div className="stage-brand"><BrandMark size={32}/><span><strong>栈川行</strong><small>ZHANCHUAN XING</small></span></div><div className="stage-statement"><p className="eyebrow">A JOURNEY, REIMAGINED</p><h2>让历史，<br/>走近一点。</h2><p>一段有温度的旅程。<br/>一个始终在身边的向导。</p></div><div className="stage-spec"><span className="spec-line"/><span>iPhone 17<br/><small>402 × 874 · 交互原型</small></span></div></aside>
    <div className="device-wrap"><div className="hardware-key key-one"/><div className="hardware-key key-two"/><div className="hardware-key key-three"/>
      <div className={`device ${largeText ? 'large-text' : ''}`}>
        <div className="phone-status" aria-hidden="true"><span>9:41</span><div><Icon name="signal" size={17}/><Icon name="wifi" size={17}/><Icon name="battery" size={25}/></div></div><div className="dynamic-island" aria-hidden="true"><i/></div>
        <main className={`screen-content screen-${tab}`} ref={contentRef} inert={panel !== null}><div className="page-enter" key={tab}>
          {tab === 'home' && <HomePage open={setPanel} go={go} connected={connected} connect={connect}/>}
          {tab === 'guide' && <GuidePage open={setPanel}/>}
          {tab === 'cinema' && <CinemaPage open={setPanel} connected={connected} connect={connect}/>}
          {tab === 'explore' && <ExplorePage open={setPanel} completed={saved.completed}/>}
          {tab === 'profile' && <ProfilePage open={setPanel} saved={saved}/>}
        </div></main>
        <nav className="tab-bar glass" aria-label="主导航" inert={panel !== null}><span className="tab-selection" style={{ transform: `translateX(${navigation.findIndex(n => n.id === tab) * 100}%)` }}/>{navigation.map(item => <button key={item.id} aria-label={item.label} aria-current={tab === item.id ? 'page' : undefined} onClick={() => go(item.id)}><Icon name={item.icon} size={23}/><span>{item.label}</span></button>)}</nav><div className="home-indicator" aria-hidden="true"/>
        {panel && <Sheet close={close} title={panelTitle}>
          {panel.kind === 'route' && <RoutePanel index={panel.index} open={setPanel} visited={saved.visited} visit={visit}/>}
          {panel.kind === 'exhibit' && <ExhibitPanel item={exhibits[panel.index]} favorite={saved.favorites.includes(exhibits[panel.index].id)} toggleFavorite={() => favorite(exhibits[panel.index].id)} visit={visit} open={setPanel} notify={notify}/>}
          {panel.kind === 'connect' && <ConnectPanel connected={connected} connect={() => { setConnected(true); setPanel(returnPanel); setReturnPanel(null); notify('栈川行 01 已连接 · 演示模式') }} disconnect={() => { setConnected(false); close(); notify('已断开连接') }}/ >}
          {panel.kind === 'movie' && <MoviePanel film={films[panel.index]} connected={connected} connect={connect} favorite={saved.favorites.includes(films[panel.index].id)} toggleFavorite={() => favorite(films[panel.index].id)}/>}
          {panel.kind === 'game' && <GamePanel variant={panel.index} complete={complete} close={close}/>}
          {panel.kind === 'search' && <SearchPanel open={setPanel}/>}
          {panel.kind === 'settings' && <SettingsPanel large={largeText} setLarge={setLargeText}/>}
          {panel.kind === 'collection' && <CollectionPanel saved={saved} open={setPanel}/>}
          {panel.kind === 'card' && <CardPanel saved={saved} notify={notify}/>}
        </Sheet>}
        {toast && <div className="toast glass" role="status"><Icon name="check" size={17}/>{toast}</div>}
      </div>
    </div>
    <aside className="stage-index" aria-label="原型页面切换"><span className="eyebrow">THE EXPERIENCE</span>{navigation.map((item, i) => <button key={item.id} className={tab === item.id ? 'selected' : ''} onClick={() => go(item.id)}><span>0{i + 1}</span>{item.label}<i/></button>)}<p>1936 — 2026<br/><span>长征胜利九十周年</span></p></aside>
    <footer className="stage-footer"><span>为每一次相遇，留下一点回响。</span><span>DESIGNED TO ACCOMPANY</span></footer>
  </div>
}
