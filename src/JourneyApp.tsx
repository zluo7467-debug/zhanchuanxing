import { useEffect, useRef, useState } from 'react'
import { BrandMark, Icon } from './Visuals'
import { exhibits, films, navigation, routes, type Tab } from './content'
import { GuidePage, CinemaPage, ExplorePage, ProfilePage } from './Pages'
import { HomePage } from './HomePage'
import { emptyProjection, prepareProjection, projectionReady, startProjection, tickProjection, projectionLabels, pauseProjection } from './projection'
import { CardPanel, CollectionPanel, ConnectPanel, GamePanel, SearchPanel, SettingsPanel, Sheet } from './Panels'
import { ExhibitDetail, ObservationPanel, ProjectionPanel, VisitRoutePanel } from './ExperiencePanels'
import { advanceJourney, readJourney, switchJourney, type Journey } from './journey'
import { AudioGuideProvider, MiniPlayer, useAudioGuide } from './AudioGuide'
import type { Panel, Saved } from './ui'

const empty: Saved = { favorites: [], visited: [], completed: [] }
function initialSaved(): Saved {
  try { const data = JSON.parse(localStorage.getItem('zhanchuanxing-visitor-v2') || localStorage.getItem('xinghuo-visitor-v2') || 'null'); return data && ['favorites', 'visited', 'completed'].every(key => Array.isArray(data[key]) && data[key].every((v: unknown) => typeof v === 'string')) ? data : empty } catch { return empty }
}
export default function JourneyApp() {
  const [saved, setSaved] = useState<Saved>(initialSaved)
  const visit = (id: string) => setSaved(s => ({ ...s, visited: [...new Set([...s.visited, id])] }))
  useEffect(() => { try { localStorage.setItem('zhanchuanxing-visitor-v2', JSON.stringify(saved)) } catch { /* Browsing still works without storage. */ } }, [saved])
  return <AudioGuideProvider listened={visit}><Experience saved={saved} setSaved={setSaved} visit={visit}/></AudioGuideProvider>
}

function Experience({ saved, setSaved, visit }: { saved: Saved; setSaved: React.Dispatch<React.SetStateAction<Saved>>; visit: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>('home')
  const [panel, setPanel] = useState<Panel | null>(null)
  const [connected, setConnected] = useState(false)
  const [guiding, setGuiding] = useState(false)
  const [journey, setJourney] = useState<Journey | null>(() => { try { return readJourney(localStorage.getItem('zhanchuanxing-journey-v3')) } catch { return null } })
  const [projection, setProjection] = useState(emptyProjection)
  const [toast, setToast] = useState('')
  const [largeText, setLargeText] = useState(() => { try { return localStorage.getItem('zhanchuanxing-large-text') === 'true' } catch { return false } })
  const contentRef = useRef<HTMLElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audio = useAudioGuide()
  const notify = (message: string) => { setToast(message); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4000) }
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])
  useEffect(() => { try { localStorage.setItem('zhanchuanxing-journey-v3', JSON.stringify(journey)) } catch { /* In-memory journey remains usable. */ } }, [journey])
  useEffect(() => { try { localStorage.setItem('zhanchuanxing-large-text', String(largeText)) } catch { /* Optional preference. */ } }, [largeText])
  // Simulate the device event centrally, so closing the sheet does not restart it.
  useEffect(() => {
    if (projection.stage !== 'preparing') return
    const timer = setTimeout(() => { setProjection(projectionReady); setConnected(true) }, 1800)
    return () => clearTimeout(timer)
  }, [projection.stage, projection.filmIndex])
  useEffect(() => {
    if (projection.stage !== 'playing' || projection.filmIndex === null || films[projection.filmIndex].game) return
    const timer = setInterval(() => setProjection(tickProjection), 1000)
    return () => clearInterval(timer)
  }, [projection.stage, projection.filmIndex])
  useEffect(() => {
    if (audio.playing && projection.stage === 'playing') setProjection(pauseProjection)
  }, [audio.playing, projection.stage])
  const prepare = (index: number) => { if (audio.playing) audio.toggle(); setGuiding(false); setProjection(prepareProjection(index)) }
  const beginProjection = () => { if (audio.playing) audio.toggle(); setGuiding(false); setProjection(startProjection) }
  const go = (next: Tab) => { setTab(next); contentRef.current?.scrollTo({ top: 0, behavior: 'instant' }); setPanel(null) }
  const resume = () => go('guide')
  const start = (index: number) => { const next = switchJourney(index, journey); setJourney(next); setGuiding(false); go(next.status === 'finished' ? 'home' : 'guide'); notify(next.status === 'finished' ? '这条路线的站点已全部到达，旗标已保留' : `已安排「${routes[index].title}」，接下来前往${exhibits[routes[index].stops[next.step]].name}`) }
  const arrive = () => { if (!journey || journey.status !== 'active') return; const exhibitIndex = routes[journey.routeIndex].stops[journey.step]; const e = exhibits[exhibitIndex]; setJourney({ ...journey, arrived: true, flags: [...new Set([...journey.flags, exhibitIndex])] }); visit(e.id); setGuiding(false); notify(`已到达「${e.name}」，旗标已插下，可以开始这一段讲解`) }
  const advance = () => { if (!journey) return; const next = advanceJourney(journey); setJourney(next); setGuiding(false); if (next.status === 'finished') { go('home'); notify('本次参观已完成，足迹已经保存') } else contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }
  const favorite = (id: string) => setSaved(s => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter(f => f !== id) : [...s.favorites, id] }))
  const complete = (id: string) => setSaved(s => ({ ...s, completed: [...new Set([...s.completed, id])] }))
  const close = () => setPanel(null)
  const connect = () => setPanel({ kind: 'connect' })
  const lead = () => { if (projection.filmIndex !== null) { setPanel({ kind:'movie', index:projection.filmIndex }); notify('请先结束本次放映，再让机器人带路'); return }; if (!connected) { connect(); return }; if (!journey || journey.status === 'finished') { setPanel({ kind: 'route', index: 0 }); return }; if (journey.arrived) { notify('你已在当前展厅，看完后可前往下一站'); resume(); return }; setGuiding(true); resume(); notify('A07 已接收带路任务 · 演示') }
  const robot = { connected, connect, lead, guiding }
  const panelTitle = panel ? panel.kind === 'route' ? '路线安排' : panel.kind === 'exhibit' ? exhibits[panel.index].name : panel.kind === 'movie' ? '沉浸放映' : panel.kind === 'game' ? '长征回顾' : panel.kind === 'observation' ? '展厅观察' : ({ connect: '同行机器人', search: '搜索', settings: '阅读设置', collection: '我的收藏', card: '旅程纪念卡' } as const)[panel.kind] : ''
  const showAudio = audio.index !== null && (audio.playing || (projection.filmIndex === null && !guiding))
  const showProjection = projection.filmIndex !== null && !audio.playing
  const showRobot = guiding && !showAudio && !showProjection
  const hasDock = showAudio || showProjection || showRobot
  return <div className="design-stage editorial-stage">
    <aside className="stage-intro" aria-label="原型信息"><div className="stage-brand"><BrandMark size={32}/><span><strong>栈川行</strong><small>ZHANCHUAN XING</small></span></div><div className="stage-statement"><p className="eyebrow">走 · 听 · 看</p><h2>陪你走完<br/>一段历史。</h2><p>循着信仰，慢慢向前。<br/>一个始终在身边的向导。</p></div><div className="stage-spec"><span className="spec-line"/><span>iPhone 17<br/><small>402 × 874 · 馆内伴游</small></span></div></aside>
    <div className="device-wrap"><div className="hardware-key key-one"/><div className="hardware-key key-two"/><div className="hardware-key key-three"/>
      <div className={`device v3 atelier ${largeText ? 'large-text' : ''} ${hasDock ? 'has-dock' : ''}`} style={{ '--dock-height': `${hasDock ? showAudio ? 83 : 61 : 0}px` } as React.CSSProperties}>
        <div className="phone-status" aria-hidden="true"><span>9:41</span><div><Icon name="signal" size={17}/><Icon name="wifi" size={17}/><Icon name="battery" size={25}/></div></div><div className="dynamic-island" aria-hidden="true"><i/></div>
        <main className={`screen-content screen-${tab}`} ref={contentRef} inert={panel !== null}><div className="page-enter" key={tab}>
          {tab === 'home' && <HomePage open={setPanel} go={go} journey={journey} start={start} resume={resume} projection={projection} {...robot}/>}
          {tab === 'guide' && <GuidePage open={setPanel} journey={journey} start={start} arrive={arrive} advance={advance} {...robot}/>}
          {tab === 'cinema' && <CinemaPage open={setPanel} projection={projection}/>}
          {tab === 'explore' && <ExplorePage open={setPanel} completed={saved.completed} journey={journey}/>}
          {tab === 'profile' && <ProfilePage open={setPanel} saved={saved} journey={journey}/>}
        </div></main>
        {!panel && hasDock && <div className="experience-dock">{showRobot && <div className="robot-dock glass"><button onClick={lead}><Icon name="robot" size={18}/><span>A07 · 带路中<small>演示</small></span><Icon name="chevron" size={12}/></button><button onClick={() => { setGuiding(false); notify('演示带路任务已停止') }}>停止带路</button></div>}{showProjection && <button className="projection-dock glass" onClick={() => setPanel({ kind:'movie', index:projection.filmIndex! })}><Icon name="cinema" size={19}/><span>{films[projection.filmIndex!].title}<small>{projectionLabels[projection.stage]} · 演示</small></span><Icon name="chevron" size={13}/></button>}{showAudio && <MiniPlayer open={index => setPanel({kind:'exhibit',index})}/>}</div>}
        <nav className="tab-bar glass" aria-label="主导航" inert={panel !== null}><span className="tab-selection" style={{ transform: `translateX(${navigation.findIndex(n => n.id === tab) * 100}%)` }}/>{navigation.map(item => <button key={item.id} aria-label={item.label} aria-current={tab === item.id ? 'page' : undefined} onClick={() => go(item.id)}><Icon name={item.icon} size={23}/><span>{item.label}</span></button>)}</nav><div className="home-indicator" aria-hidden="true"/>
        {panel && panel.kind !== 'movie' && <Sheet close={close} title={panelTitle} key={`${panel.kind}-${'index' in panel ? panel.index : ''}`}>
          {panel.kind === 'route' && <VisitRoutePanel index={panel.index} journey={journey} start={start} resume={resume} open={setPanel}/>}
          {panel.kind === 'exhibit' && <ExhibitDetail index={panel.index} favorite={saved.favorites.includes(exhibits[panel.index].id)} toggleFavorite={() => favorite(exhibits[panel.index].id)} open={setPanel}/>}
          {panel.kind === 'connect' && <ConnectPanel connected={connected} connect={() => { setConnected(true); close(); notify('机器人 A07 已连接 · 演示模式') }} disconnect={() => { setConnected(false); setGuiding(false); setProjection(emptyProjection); close(); notify('已断开演示连接，设备任务已停止') }}/ >}
          {panel.kind === 'observation' && <ObservationPanel index={panel.index} complete={complete} close={close} open={setPanel}/>}
          {panel.kind === 'game' && <GamePanel variant={panel.index} complete={complete} close={close}/>}
          {panel.kind === 'search' && <SearchPanel open={setPanel}/>}
          {panel.kind === 'settings' && <SettingsPanel large={largeText} setLarge={setLargeText}/>}
          {panel.kind === 'collection' && <CollectionPanel saved={saved} open={setPanel}/>}
          {panel.kind === 'card' && <CardPanel saved={saved} notify={notify}/>}
        </Sheet>}
        {films.map((film, index) => <Sheet key={film.id} close={close} title="沉浸放映" hidden={panel?.kind !== 'movie' || panel.index !== index}><ProjectionPanel index={index} projection={projection} setProjection={setProjection} prepare={prepare} begin={beginProjection} visible={panel?.kind === 'movie' && panel.index === index} favorite={saved.favorites.includes(film.id)} toggleFavorite={() => favorite(film.id)}/></Sheet>)}
        {toast && <div className="toast glass" role="status"><Icon name="check" size={17}/>{toast}</div>}
      </div>
    </div>
    <aside className="stage-index" aria-label="原型页面切换"><span className="eyebrow">馆内伴游</span>{navigation.map((item, i) => <button key={item.id} className={tab === item.id ? 'selected' : ''} onClick={() => go(item.id)}><span>0{i + 1}</span>{item.label}<i/></button>)}<p>1936 — 2026<br/><span>长征胜利九十周年</span></p></aside>
    <footer className="stage-footer"><span>为每一次相遇，留下一点回响。</span><span>栈川行 · 智能博物馆伴游</span></footer>
  </div>
}
