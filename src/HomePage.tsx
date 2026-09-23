import { BrandMark, Icon, JourneyArtwork } from './Visuals'
import { exhibits, films, routes, type Tab } from './content'
import { remainingMinutes, stopMinutes, walkingInfo, type Journey } from './journey'
import { useAudioGuide } from './AudioGuide'
import { projectionLabels, type Projection } from './projection'
import type { Panel } from './ui'

type Props = {
  open: (p: Panel) => void; go: (tab: Tab) => void; journey: Journey | null;
  start: (index: number) => void; resume: () => void; connected: boolean;
  connect: () => void; lead: () => void; guiding: boolean; projection: Projection;
}

// Contours and a single continuous route are the brand illustration, not a map.
function ExpeditionRelief() {
  return <svg className="expedition-relief" viewBox="0 0 380 300" fill="none" aria-hidden="true">
    <g className="relief-contours">{Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${105-i*12} 324C${134-i*10} 248 ${186-i*8} 246 ${207-i*7} 179S${183-i*8} ${100-i*3} ${263-i*7} ${62-i*6}S401 ${99-i*9} 403 ${5-i*9}`}/>)}</g>
    <path className="relief-shadow" d="M124 291C138 265 202 280 219 240S166 211 184 179S275 181 286 139S248 95 313 48"/>
    <path className="relief-ribbon" d="M124 284C138 258 202 273 219 233S166 204 184 172S275 174 286 132S248 88 313 41"/>
    <path className="relief-highlight" d="M124 282C138 256 202 271 219 231S166 202 184 170S275 172 286 130S248 86 313 39"/>
    <g className="relief-pin"><circle cx="184" cy="172" r="4"/><circle cx="313" cy="41" r="5"/><path d="M313 36V10m0 1c8-5 14 5 23 0v13c-9 5-15-5-23 0"/></g>
    <g className="relief-ticks">{Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${180+i*17} 279v${i%3 ? 3 : 7}`}/>)}</g>
  </svg>
}

function RoutePair({ start }: { start: Props['start'] }) {
  return <section className="route-pair" aria-label="选择参观路线">
    {routes.map((route, index) => <button className={`route-ticket route-ticket-${index}`} key={route.title} onClick={() => start(index)} aria-label={`${route.title}，${route.minutes}分钟，${route.stops.length}个展厅，开始参观`}>
      <span className="ticket-heading"><Icon name="flag" size={17}/><span>{route.tag}</span><span className="ticket-number">0{index+1}</span></span>
      <strong className="ticket-time">{route.minutes}<small>分钟</small></strong>
      <h3>{route.title}</h3><p>{route.caption}</p>
      <span className="ticket-foot"><span>{route.stops.length} 个展厅<span className="ticket-stops" aria-hidden="true">{route.stops.map(i => <i key={i}/>)}</span></span><span className="ticket-arrow"><Icon name="arrow" size={17}/></span></span>
    </button>)}
  </section>
}

export function HomePage({ open, go, journey, start, resume, connected, connect, guiding, projection }: Props) {
  const audio = useAudioGuide()
  const route = routes[journey?.routeIndex ?? 0]
  const active = journey?.status === 'active'
  const current = journey ? route.stops[journey.step] : route.stops[0]
  const nextStep = journey ? route.stops.findIndex((stop,i) => i > journey.step && !journey.flags.includes(stop)) : -1
  const walk = walkingInfo(journey?.flags.at(-1) ?? null, current)
  const marked = route.stops.flatMap((stop,i) => journey?.flags.includes(stop) ? [i] : [])
  const hasProjection = projection.filmIndex !== null
  return <div className="home-editorial">
    <header className="editorial-top"><div className="editorial-wordmark"><BrandMark size={28}/><strong>栈川行</strong></div><div className="editorial-location"><Icon name="pin" size={12}/>长征纪念馆</div><button className="editorial-search" aria-label="搜索" onClick={() => open({ kind: 'search' })}><Icon name="search" size={20}/></button></header>
    <div className="editorial-heading"><h1>今日参观</h1><span><i/>参观演示</span></div>
    <section className={`expedition-cover ${active ? 'cover-active' : ''}`} aria-label={active ? '当前旅程' : '长征胜利九十周年'}>
      <ExpeditionRelief/>
      <div className="cover-edition"><span>{active ? '正在参观' : '长征胜利 · 90 周年'}</span><span>1936 — 2026</span></div>
      {active ? <>
        <div className="cover-journey-title"><p>{route.title}</p><button aria-label="查看当前路线详情" onClick={() => open({kind:'route',index:journey.routeIndex})}><Icon name="route" size={18}/></button></div>
        <div className="cover-station"><span>{String(journey.step+1).padStart(2,'0')}<small> / {String(route.stops.length).padStart(2,'0')}</small></span><h2>{exhibits[current].name}</h2><p>{journey.arrived ? '已到达 · 可以开始听讲解' : `前往${exhibits[current].tag} · 示意步行约 ${walk.minutes} 分钟`}</p></div>
        <div className="cover-progress"><JourneyArtwork progress={{step:journey.step,total:route.stops.length,finished:false,marked}}/></div>
        <button className="cover-continue" onClick={resume}><span>继续导览<small>预计剩余约 {remainingMinutes(journey)} 分钟</small></span><Icon name="arrow" size={22}/></button>
      </> : <><div className="cover-title"><h2>循着信仰，<br/>慢慢向前。</h2><p>留一点时间，走近一段历史。</p></div><div className="cover-colophon"><span>陪你走完一段历史</span><span>走 · 听 · 看</span></div></>}
    </section>
    {active ? <div className="journey-underbar"><span><Icon name="flag" size={14}/>{journey.flags.length} 枚旗标</span><span>按路线安排估算</span></div> : <><div className="editorial-section-title"><h2>选择参观路线</h2><span>每一步，都有回响。</span></div><RoutePair start={start}/></>}
    {journey?.status === 'finished' && <button className="finished-link" onClick={() => go('profile')}><Icon name="flag" size={18}/><span>旅程已完成 · 查看本次足迹</span><Icon name="arrow" size={17}/></button>}
    <div className="service-strip" aria-label="参观快捷功能"><button onClick={() => { audio.play(current); open({ kind:'exhibit',index:current }) }}><Icon name="audio" size={22}/><span>听讲解</span></button><button onClick={() => go('guide')}><Icon name="compass" size={22}/><span>看地图</span></button><button onClick={() => go('cinema')}><Icon name="cinema" size={22}/><span>沉浸放映</span></button></div>
    <button className={`companion-inline ${hasProjection ? 'has-session' : ''}`} onClick={() => hasProjection ? open({kind:'movie',index:projection.filmIndex!}) : connect()}><span className="companion-glyph"><Icon name="robot" size={26}/></span><span><strong>{hasProjection ? films[projection.filmIndex!].title : '同行机器人'}</strong><small>{hasProjection ? `${projectionLabels[projection.stage]} · 演示` : connected ? `A07 · ${guiding ? '带路中' : '已连接'} · 演示` : '让向导陪你走一程'}</small></span><span className="companion-inline-action">{hasProjection ? '查看' : connected ? '管理' : '连接'}<Icon name="chevron" size={12}/></span></button>
    {active && nextStep >= 0 && <button className="editorial-next" onClick={() => open({kind:'exhibit',index:route.stops[nextStep]})}><span>下一站</span><strong>{exhibits[route.stops[nextStep]].name}</strong><small>约 {stopMinutes(journey.routeIndex,nextStep)} 分钟</small><Icon name="arrow" size={16}/></button>}
    <div className="editorial-section-title archive-section-title"><h2>此刻，值得驻足</h2><button onClick={() => go('guide')}>全部展厅<Icon name="chevron" size={12}/></button></div>
    <button className="archive-editorial" onClick={() => open({kind:'exhibit',index:1})}><div className="archive-photo"><img src={`${import.meta.env.BASE_URL}exhibits/${exhibits[1].image}`} alt="遵义会议主题图" loading="lazy"/><span>1935 · 01</span></div><div className="archive-editorial-copy"><span>档案线索 / 1935-01</span><h3>一次转折，<br/>一种力量。</h3><p>从遵义会议，读懂独立自主。</p><Icon name="arrow" size={20}/></div></button>
    <footer className="editorial-footer"><BrandMark size={18}/><span>循着信仰，慢慢向前。</span><span>1936 — 2026</span></footer>
  </div>
}
