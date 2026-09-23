import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { AudioControls } from './AudioGuide'
import { exhibits, films, formatTime, routes } from './content'
import { evidence, sourcePortals } from './evidence'
import { stopMinutes, type Journey } from './journey'
import { Action, type Panel } from './ui'
import { FilmArtwork, Icon, JourneyArtwork } from './Visuals'
import { emptyProjection, pauseProjection, type Projection } from './projection'

export function VisitRoutePanel({ index, journey, start, resume, open }: { index: number; journey: Journey | null; start: (i: number) => void; resume: () => void; open: (p: Panel) => void }) {
  const [switching, setSwitching] = useState(false)
  const r = routes[index]
  const same = journey?.status === 'active' && journey.routeIndex === index
  return <><span className="archive-stamp">{r.tag} · 馆内参观计划</span><h2 className="panel-title">{r.title}</h2><p className="panel-description">{r.caption}</p><JourneyArtwork progress={{ step: same ? journey.step : -1, total: r.stops.length, finished: false, marked: r.stops.flatMap((stop, i) => journey?.flags.includes(stop) ? [i] : []) }}/><div className="route-facts"><span><Icon name="clock" size={16}/>{r.minutes} 分钟</span><span><Icon name="pin" size={16}/>{r.stops.length} 个展厅</span><span><Icon name="flag" size={16}/>{journey?.flags?.filter(flag => r.stops.includes(flag)).length ?? 0} 枚旗标</span></div><div className="timeline">{r.stops.map((s, n) => <button key={s} onClick={() => open({ kind: 'exhibit', index: s })}><i className={journey?.flags?.includes(s) ? 'visited' : ''}>{journey?.flags?.includes(s) ? <Icon name="flag" size={13}/> : n + 1}</i><span className="row-text"><strong>{exhibits[s].name}</strong><small>建议 {stopMinutes(index, n)} 分钟 · {exhibits[s].tag}</small></span><Icon name="chevron" size={13}/></button>)}</div>{switching ? <div className="switch-route"><p>切换到「{r.title}」后会保留已经插下的旗标，新的路线从当前可继续的节点开始。</p><Action onClick={() => start(index)}>确认切换路线</Action><Action secondary onClick={() => setSwitching(false)}>保留当前路线</Action></div> : <Action icon="compass" onClick={() => same ? resume() : journey?.status === 'active' ? setSwitching(true) : start(index)}>{same ? '继续这段旅程' : journey?.status === 'active' ? '切换到这条路线' : '开始参观'}</Action>}<section className="route-alternatives"><h3>切换路线</h3><div className="list-group">{routes.map((option, i) => i !== index && <button key={option.title} className="list-row" onClick={() => open({ kind: 'route', index: i })}><span className="row-text"><strong>{option.title}</strong><small>{option.minutes} 分钟 · {option.stops.length} 个展厅</small></span><Icon name="chevron" size={14}/></button>)}</div></section><p className="context-note">时间包含步行与驻足，为参观建议。地图使用示意布局，请以现场导视为准。</p></>
}

export function ExhibitDetail({ index, favorite, toggleFavorite, open }: { index: number; favorite: boolean; toggleFavorite: () => void; open: (p: Panel) => void }) {
  const [layer, setLayer] = useState(0)
  const [object, setObject] = useState<number | null>(null)
  const item = exhibits[index], archive = evidence[index]
  return <><header className="archive-heading"><div><span className="archive-stamp">展厅索引 / {archive?.archive ?? item.date}</span><h2>{item.name}</h2><p>{item.date} · {item.place}</p></div><button className={`circle-button ${favorite ? 'favorited' : ''}`} aria-label={favorite ? '取消收藏' : '收藏展项'} aria-pressed={favorite} onClick={toggleFavorite}><Icon name="heart"/></button></header><img className="exhibit-image" src={`${import.meta.env.BASE_URL}exhibits/${item.image}`} alt={`${item.name} 展厅参考图`} /><p className="spirit-caption"><span/>{item.spirit}</p><AudioControls index={index}/>
    <div className="segmented content-layers" aria-label="内容层次">{['30 秒看懂', '深入了解', '史料与出处'].map((label, i) => <button key={label} aria-pressed={layer === i} onClick={() => setLayer(i)}>{label}</button>)}</div>
    {archive && layer === 0 && <article className="story-copy"><span className="archive-stamp">史实摘要</span><h3>{archive.question}</h3><p>{item.description}</p><button className="text-button" onClick={() => setLayer(1)}>阅读完整文字稿<Icon name="arrow" size={15}/></button></article>}
    {archive && layer === 1 && <article className="story-copy transcript"><span className="archive-stamp">讲解文字稿 · 编辑解读</span><h3>{archive.question}</h3>{archive.paragraphs.map((paragraph, i) => <p key={i}><span className="paragraph-number">0{i + 1}</span>{paragraph}</p>)}<p className="context-note">本讲解为依据基础史实编写的参观解读，不是史料原文或场馆审定稿。</p></article>}
    {layer === 2 && <article className="source-layer"><h3>把故事，放回资料中。</h3><p>基础史实与参观解读分层呈现。下列链接为官方资料入口，便于进一步检索。</p><div className="source-fact"><span>基础史实</span><p>{item.description}</p></div>{sourcePortals.map(source => <a href={source.url} key={source.url} target="_blank" rel="noopener noreferrer"><Icon name="book" size={20}/><span><strong>{source.name}</strong><small>{source.description}</small></span><Icon name="arrow" size={16}/></a>)}<div className="source-fact"><span>资料核验状态</span><p>逐条原始文献、馆藏编号及学术观点尚未录入。这里不把机构首页标作原始资料，也不使用虚构馆藏号。</p></div><p className="context-note">展厅索引中的日期是内容编排标识，不是档案馆藏编号。展品名称为观看线索，实际陈列以现场为准。</p></article>}
    <div className="section-title"><h2>到展厅里看一看</h2></div><div className="object-chips">{archive.objects.map((name, i) => <button aria-pressed={object === i} key={name} onClick={() => setObject(object === i ? null : i)}><Icon name="book" size={16}/>{name}</button>)}</div>{object !== null && <div className="object-note"><strong>{archive.objects[object]}</strong><p>先读展签的年代、用途与来源，再看它和这一站的关系。请分清原件、复制品和复原陈列；实际展品以场馆为准。</p></div>}<Action secondary icon="explore" onClick={() => open({ kind: 'observation', index })}>带着一个问题去观察</Action><Action secondary icon="cinema" onClick={() => open({ kind: 'movie', index: index === 5 ? 1 : 0 })}>在空间放映中继续了解</Action></>
}

export function ObservationPanel({ index, complete, close, open }: { index: number; complete: (id: string) => void; close: () => void; open: (p: Panel) => void }) {
  const [observed, setObserved] = useState(false)
  const [answer, setAnswer] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const e = exhibits[index], task = evidence[index]
  if (done) return <div className="game-result"><span className="result-mark"><Icon name="check" size={40}/></span><span className="archive-stamp">观察印记 · {e.tag}</span><h2>你发现了一个线索。</h2><p>{task.explanation}</p><Action onClick={close}>收起手机，继续参观</Action></div>
  return <><span className="archive-stamp">观察任务 / 0{index + 1}</span><h2 className="panel-title">到{e.tag}，找一找。</h2><div className="observation-prompt"><Icon name="explore" size={35}/><h3>{task.observation}</h3><p>看一看「{task.objects[0]}」和旁边的说明。不急着回答，答案可能就在眼前。</p></div>{!observed ? <><Action onClick={() => setObserved(true)}>我已观察，记录发现</Action><Action secondary onClick={() => open({ kind: 'exhibit', index })}>现场没找到，先看资料</Action><p className="context-note">由你手动确认观察，不会自动验证到馆位置。</p></> : <><div className="answer-list">{task.options.map((option, i) => <button key={option} aria-pressed={answer === i} className={answer === i ? i === task.answer ? 'correct' : 'incorrect' : ''} onClick={() => setAnswer(i)}><span>{option}</span>{answer === i && <Icon name={i === task.answer ? 'check' : 'back'} size={17}/>}</button>)}</div>{answer !== null && <div className="answer-feedback" role="status">{answer === task.answer ? task.explanation : '再看看展签和时间标记，也可以回到文字资料寻找线索。'}</div>}<Action disabled={answer !== task.answer} onClick={() => { complete(`observe-${e.id}`); setDone(true) }}>保存这次观察</Action></>}</>
}

export function ProjectionPanel({ index, projection, setProjection, favorite, toggleFavorite, prepare, begin, visible = true }: { index: number; projection: Projection; setProjection: Dispatch<SetStateAction<Projection>>; favorite: boolean; toggleFavorite: () => void; prepare: (index: number) => void; begin: () => void; visible?: boolean }) {
  const [replacing, setReplacing] = useState(false)
  const gameRef = useRef<HTMLIFrameElement>(null)
  const film = films[index]
  useEffect(() => {
    if (!visible) {
      setReplacing(false)
      gameRef.current?.contentWindow?.postMessage({type:'zhanchuanxing:hide-game'}, window.location.origin)
      if (film.game) setProjection(p => p.filmIndex === index ? pauseProjection(p) : p)
    }
  }, [visible, film.game, index, setProjection])
  const active = projection.filmIndex === index
  const stage = active ? projection.stage : 'idle'
  const launched = ['playing','paused','ended'].includes(stage)
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== gameRef.current?.contentWindow || event.data?.type !== 'zhanchuanxing:game-state') return
      if (event.data.stage === 'paused') setProjection(p => p.filmIndex === index ? pauseProjection(p) : p)
      if (event.data.stage === 'playing' && active && visible) begin()
      if (event.data.stage === 'ended') setProjection(p => p.filmIndex === index ? {...p,stage:'ended'} : p)
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [index, active, visible, begin, setProjection])
  useEffect(() => {
    if (film.game && stage === 'paused') gameRef.current?.contentWindow?.postMessage({type:'zhanchuanxing:hide-game'}, window.location.origin)
  }, [film.game, stage])
  const request = () => { prepare(index); setReplacing(false) }
  return <div className="projection-editorial">
    <div className={`projection-poster ${film.game ? 'is-game' : ''}`}><FilmArtwork motif={film.motif}/><span className="poster-category">{film.game ? '趣味投影游戏' : film.category}</span><div className="poster-title"><small>{film.game ? '五关协作 · 仿真互动' : film.year + ' · 长征影像计划'}</small><h2>{film.title}</h2><p>{film.label}</p></div><button className={`poster-favorite ${favorite ? 'favorited' : ''}`} aria-label={favorite ? '取消收藏' : '收藏内容'} aria-pressed={favorite} onClick={toggleFavorite}><Icon name="heart" size={20}/></button></div>
    <p className="projection-description">{film.description}</p>
    <section className={`projection-service state-${stage}`} aria-label="机器人放映控制">
      <div className="service-status" role="status"><span className={`service-orb ${stage === 'preparing' ? 'is-preparing' : ''}`}><Icon name={launched ? 'cinema' : 'robot'} size={24}/></span><div><strong>{stage === 'idle' ? '让机器人，把故事带到你身边。' : stage === 'preparing' ? '机器人正在前往' : stage === 'ready' ? '机器人已就绪，请前往投影点' : stage === 'paused' ? '放映已暂停' : stage === 'ended' ? '放映已结束' : film.game ? '仿真游戏已开启' : '正在放映 · 演示'}</strong><p>{stage === 'idle' ? '自动连接与准备，到投影点后再开始。' : stage === 'preparing' ? '正在连接并准备所选内容 · 演示' : stage === 'ready' ? '模拟已就绪；请按现场导视前往固定投影区域。' : film.game ? '移动、声音和暂停请使用游戏内控制。' : '手机是控制器，空间才是屏幕。'}</p></div></div>
      {stage === 'idle' && !replacing && <Action icon="robot" onClick={() => projection.filmIndex !== null ? setReplacing(true) : request()}>{film.game ? '召唤机器人 · 准备游戏' : '召唤机器人 · 准备放映'}</Action>}
      {replacing && <div className="replace-session"><p>将结束「{films[projection.filmIndex!]?.title}」并准备此内容。</p><Action onClick={request}>更换内容并准备</Action><button className="quiet-action" onClick={() => setReplacing(false)}>保留当前内容</button></div>}
      {stage === 'preparing' && <div className="preparation-track" aria-label="准备中"><i/></div>}
      {stage === 'ready' && <Action icon="play" onClick={begin}>到达投影点，开始{film.game ? '游戏' : '放映'}</Action>}
      {!film.game && launched && <><div className="player-timeline"><input type="range" min={0} max={film.duration} value={projection.elapsed} aria-label="放映演示进度" onChange={e => setProjection(p => ({...p,elapsed:Number(e.target.value)}))}/><span>{formatTime(projection.elapsed)}<span>{formatTime(film.duration)}</span></span></div><Action icon={stage === 'playing' ? 'pause' : 'play'} onClick={() => stage === 'playing' ? setProjection(pauseProjection) : begin()}>{stage === 'playing' ? '暂停放映演示' : stage === 'ended' ? '重新放映演示' : '继续放映演示'}</Action></>}
      {active && <button className="quiet-action" onClick={() => setProjection(emptyProjection)}>{launched ? '结束放映' : '取消召唤'}</button>}
    </section>
    {active && film.game && launched && <><iframe ref={gameRef} className="projection-game-frame" src={`${import.meta.env.BASE_URL}projection-game/red-star-adventure/index.html`} title="红星小队投影游戏" allowFullScreen/><a className="game-window-link" href={`${import.meta.env.BASE_URL}projection-game/red-star-adventure/index.html`} target="_blank" rel="noopener noreferrer">在独立窗口玩游戏<Icon name="expand" size={17}/></a><p className="context-note">收起面板会暂停并保留当前游戏。独立窗口会开启单独的游戏进度。</p></>}
    <details className="projection-help"><summary>放映说明<span>演示模式<Icon name="chevron" size={13}/></span></summary><p>{film.game ? '这是仿真投影游戏；召唤与到达为流程演示，尚未连接机器人。' : '当前演示召唤与放映流程。授权影片文件和机器人尚未接入，不会实际投出影片。'}</p><p>固定投影点由场馆指定。确认到达后才会开始，不会在机器人移动时自动放映。</p></details>
  </div>
}
