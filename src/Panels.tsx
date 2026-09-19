import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BrandMark, FilmArtwork, Icon, JourneyArtwork } from './Visuals'
import { exhibits, films, formatTime, questions, routes, type Exhibit, type Film } from './content'
import { Action, type Panel, type Saved } from './ui'

export function Sheet({ children, close, title }: { children: ReactNode; close: ()=>void; title: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey=(event: KeyboardEvent)=>{
      if(event.key==='Escape') close()
      if(event.key==='Tab') {
        const focusable=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href],[tabindex="0"]')
        if(!focusable?.length) return
        const first=focusable[0], last=focusable[focusable.length-1]
        if(event.shiftKey && (document.activeElement===first || document.activeElement===ref.current)){event.preventDefault();last.focus()}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus()}
      }
    }
    document.addEventListener('keydown',onKey)
    return()=>{document.removeEventListener('keydown',onKey);previous?.focus()}
  }, [])
  return <div className="modal-backdrop" onClick={close}><div className="sheet glass" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref} onClick={e=>e.stopPropagation()}><div className="sheet-grabber"/><header className="sheet-header"><span>{title}</span><button className="circle-button" onClick={close} aria-label="关闭"><Icon name="close" size={18}/></button></header><div className="sheet-body" key={title}>{children}</div></div></div>
}

export function RoutePanel({ index, open, visited, visit }: { index:number; open:(p:Panel)=>void; visited:string[]; visit:(id:string)=>void }) {
  const [started,setStarted]=useState(false)
  const [stop,setStop]=useState(0)
  const route=routes[index]
  const current=exhibits[route.stops[stop]]
  if(started) return <><div className="navigation-instruction"><span className="navigation-orb"><Icon name="compass" size={40}/></span><p className="eyebrow">YOUR NEXT CHAPTER</p><h2>{current.name}</h2><p>{current.tag} · 第 {stop+1} / {route.stops.length} 站</p></div><p className="context-note">导览路线演示。请按场馆现场指示前往展厅。</p><Action icon="audio" onClick={()=>{visit(current.id);open({kind:'exhibit',index:route.stops[stop]})}}>听这里的故事</Action><Action secondary onClick={()=>{visit(current.id);if(stop<route.stops.length-1)setStop(stop+1);else setStarted(false)}}>{stop===route.stops.length-1?'完成本次导览':'已到达，前往下一站'}</Action></>
  return <><span className="eyebrow">{route.tag}</span><h2 className="panel-title">{route.title}</h2><p className="panel-description">{route.caption}</p><div className="route-preview"><JourneyArtwork compact/></div><div className="route-facts"><span><Icon name="clock" size={16}/>{route.minutes} 分钟</span><span><Icon name="pin" size={16}/>{route.stops.length} 个展厅</span><span><Icon name="audio" size={16}/>语音讲解</span></div><div className="timeline">{route.stops.map((s,i)=><button key={s} onClick={()=>open({kind:'exhibit',index:s})}><i className={visited.includes(exhibits[s].id)?'visited':''}>{visited.includes(exhibits[s].id)?<Icon name="check" size={13}/>:i+1}</i><span className="row-text"><strong>{exhibits[s].name}</strong><small>{exhibits[s].minutes} 分钟 · {exhibits[s].tag}</small></span><Icon name="chevron" size={13}/></button>)}</div><Action icon="compass" onClick={()=>setStarted(true)}>开启这段旅程</Action></>
}

export function ExhibitPanel({ item, favorite, toggleFavorite, visit, open, notify }: { item:Exhibit;favorite:boolean;toggleFavorite:()=>void;visit:(id:string)=>void;open:(p:Panel)=>void;notify:(s:string)=>void }) {
  const [playing,setPlaying]=useState(false)
  const [expanded,setExpanded]=useState(false)
  useEffect(()=>()=>{if('speechSynthesis' in window) window.speechSynthesis.cancel()},[])
  const speak=()=>{
    if(!('speechSynthesis' in window)){notify('当前浏览器不支持朗读，请阅读下方文字');return}
    if(playing){window.speechSynthesis.cancel();setPlaying(false);return}
    const utterance=new SpeechSynthesisUtterance(`${item.name}。${item.description}`)
    utterance.lang='zh-CN';utterance.rate=.85
    utterance.onend=()=>setPlaying(false)
    utterance.onerror=()=>{setPlaying(false);notify('朗读暂不可用，文字讲解仍可阅读')}
    window.speechSynthesis.speak(utterance);setPlaying(true);visit(item.id)
  }
  return <><div className="exhibit-poster"><span>{item.place}</span><strong>{item.name}</strong><small>{item.date}</small><span className="poster-line"/></div><div className="detail-title"><div><span className="eyebrow">{item.tag}</span><h2>{item.spirit}</h2></div><button className={`circle-button ${favorite?'favorited':''}`} aria-label={favorite?'取消收藏':'收藏展项'} aria-pressed={favorite} onClick={toggleFavorite}><Icon name="heart"/></button></div><button className={`audio-player ${playing?'playing':''}`} onClick={speak}><span className="audio-circle"><Icon name={playing?'pause':'play'} size={19}/></span><span><strong>{playing?'正在为你讲述':'听这里的故事'}</strong><small>{playing?'点按暂停':'普通话 · 系统朗读'}</small></span><span className="waveform" aria-hidden="true">{[8,15,24,12,20,30,18,10,22,14].map((height,i)=><i key={i} style={{height,animationDelay:`${i*.07}s`}}/>)}</span></button><article className="story-copy"><h3>历史的这一刻</h3><p>{item.description}</p>{expanded&&<p>{item.source} 正式展陈使用前，需由场馆审核最终讲解稿与参考资料。</p>}<button className="text-button" onClick={()=>{setExpanded(!expanded);visit(item.id)}}>{expanded?'收起资料说明':'查看资料说明'}<Icon name="chevron" size={12}/></button></article><Action secondary icon="cinema" onClick={()=>open({kind:'movie',index:item.id==='snow'?1:0})}>在光影中继续了解</Action></>
}

export function ConnectPanel({ connected, connect, disconnect }: { connected:boolean;connect:()=>void;disconnect:()=>void }) {
  const [connecting,setConnecting]=useState(false)
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null)
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[])
  return <><div className={`connection-visual ${connecting?'searching':''}`}><span/><span/><div><Icon name="robot" size={55}/></div></div><div className="center-heading"><span className="eyebrow">YOUR COMPANION</span><h2>{connected?'很高兴，与你同行':'让栈川行陪你走一程'}</h2><p>带路、讲解，也把光影带到你身边。</p></div><div className="device-choice"><Icon name="robot" size={28}/><span className="row-text"><strong>栈川行 01</strong><small>演示设备 · 不连接真实硬件</small></span><span className="connection-status">{connected?'已连接':'可连接'}</span></div><Action onClick={()=>{if(connected){disconnect();return}setConnecting(true);timer.current=setTimeout(connect,900)}} secondary={connected} disabled={connecting} icon={connected?'close':'check'}>{connected?'断开连接':connecting?'正在连接…':'连接我的向导'}</Action><p className="context-note">设备接入后，影片投影和导览指令将在此同步。</p></>
}

export function MoviePanel({ film, connected, connect, favorite, toggleFavorite }: { film:Film;connected:boolean;connect:()=>void;favorite:boolean;toggleFavorite:()=>void }) {
  const [playing,setPlaying]=useState(false)
  const [projecting,setProjecting]=useState(false)
  const [elapsed,setElapsed]=useState(0)
  const [volume,setVolume]=useState(60)
  const [captions,setCaptions]=useState(true)
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setElapsed(t=>Math.min(t+1,film.duration)),1000);return()=>clearInterval(timer)},[playing,film.duration])
  useEffect(()=>{if(elapsed===film.duration)setPlaying(false)},[elapsed,film.duration])
  return <><div className={`movie-preview ${playing?'is-playing':''}`}><FilmArtwork motif={film.motif}/><span className="preview-label">{projecting?'投影控制演示':'内容预览'}</span><button className="preview-play glass" aria-label={playing?'暂停内容预览':'播放内容预览'} onClick={()=>{if(elapsed===film.duration)setElapsed(0);setPlaying(!playing)}}><Icon name={playing?'pause':'play'} size={24}/></button>{captions&&<span className="preview-caption">{film.label}</span>}</div><div className="detail-title"><div><span className="eyebrow">{film.category} · {formatTime(film.duration)}</span><h2>{film.title}</h2></div><button className={`circle-button ${favorite?'favorited':''}`} aria-label={favorite?'取消收藏影片':'收藏影片'} aria-pressed={favorite} onClick={toggleFavorite}><Icon name="heart"/></button></div><p className="panel-description">{film.description}</p><p className="context-note">当前展示内容与控制预览，正式影片尚未接入。</p><div className="player-timeline"><input type="range" min="0" max={film.duration} value={elapsed} aria-label="播放进度" onChange={e=>setElapsed(Number(e.target.value))}/><span>{formatTime(elapsed)}<span>{formatTime(film.duration)}</span></span></div>{projecting&&<><div className="volume-control"><Icon name="volume" size={19}/><input type="range" min="0" max="100" value={volume} aria-label="音量" onChange={e=>setVolume(Number(e.target.value))}/><span>{volume}%</span></div><button className="settings-line" onClick={()=>setCaptions(!captions)} role="switch" aria-checked={captions}><Icon name="caption" size={20}/><span>中文字幕</span><span className={`toggle ${captions?'on':''}`}/></button><p className="context-note">栈川行 01 · {playing?'正在播放':'已暂停'} · 演示设备</p></>}
    <Action icon={projecting?'close':connected?'cinema':'robot'} onClick={()=>{if(!connected){connect();return}setProjecting(!projecting);setPlaying(!projecting)}} secondary={projecting}>{projecting?'结束投影':connected?'投影到栈川行 01':'连接机器人以投影'}</Action></>
}

export function GamePanel({ variant, complete, close }: { variant:number;complete:(id:string)=>void;close:()=>void }) {
  const [phase,setPhase]=useState<'intro'|'play'|'result'>('intro')
  const [step,setStep]=useState(0)
  const [answer,setAnswer]=useState<number|null>(null)
  const [score,setScore]=useState(0)
  const [order,setOrder]=useState<number[]>([])
  const [incorrect,setIncorrect]=useState(false)
  const finish=()=>{complete(variant===0?'route':'quiz');setPhase('result')}
  if(phase==='intro') return <><div className="game-intro-art">{variant===0?<JourneyArtwork/>:<Icon name="book" size={70}/>}</div><span className="eyebrow">{variant===0?'CONNECT THE JOURNEY':'FIVE MOMENTS'}</span><h2 className="panel-title">{variant===0?'把足迹，连成征途':'五问，走近长征'}</h2><p className="panel-description">{variant===0?'按时间先后，依次选择长征中的五个节点。每一次选择，都让这段历史更清晰。':'从五个历史问题出发，了解长征的重要地点与时刻。每一题都有简短解读。'}</p><div className="route-facts"><span><Icon name="clock" size={16}/>约 2 分钟</span><span><Icon name="profile" size={16}/>单人探索</span></div><Action onClick={()=>setPhase('play')}>开始探索</Action></>
  if(phase==='result') return <div className="game-result"><span className="result-mark"><Icon name="check" size={44}/></span><p className="eyebrow">A LITTLE MORE UNDERSTANDING</p><h2>又走近历史一点。</h2><p>{variant===0?'你已串联起五个重要节点。':`你答对了 ${score} / ${questions.length} 题，完成本次学习。`}</p><div className="result-note"><strong>{variant===0?'从出发，到会师':'从历史，到今天'}</strong><p>真正留下的，不只是一个答案，<br/>还有继续了解的好奇心。</p></div><Action icon="check" onClick={close}>记住这一刻</Action></div>
  if(variant===0) return <><div className="quiz-heading"><span>路线探索</span><span>{order.length} / 5</span></div><div className="thin-progress"><i style={{width:`${order.length*20}%`}}/></div><h2 className="quiz-question">{order.length===5?'每个节点，都已连接。':'下一站，在哪里？'}</h2><p className="panel-description">从 1934 年出发，按时间顺序点亮路线。</p><div className="order-trail">{exhibits.map((e,i)=><span className={order.includes(i)?'lit':''} key={e.id}>{order.includes(i)?<Icon name="check" size={15}/>:i+1}</span>)}</div><div className="answer-list">{[3,1,4,0,2].map(i=><button disabled={order.includes(i)} key={i} onClick={()=>{if(i===order.length){setOrder([...order,i]);setIncorrect(false)}else setIncorrect(true)}}><span>{exhibits[i].name}</span>{order.includes(i)?<Icon name="check" size={18}/>:<Icon name="chevron" size={13}/>}</button>)}</div><div className="answer-feedback" aria-live="polite">{incorrect?'再想一想：先从江西出发，之后在遵义迎来转折。':order.length>0?`${exhibits[order[order.length-1]].date} · ${exhibits[order[order.length-1]].place}`:'选择旅程的起点。'}</div><Action disabled={order.length!==5} onClick={finish}>完成探索</Action></>
  const question=questions[step]
  return <><div className="quiz-heading"><span>长征五问</span><span>0{step+1} / 05</span></div><div className="thin-progress"><i style={{width:`${(step+1)*20}%`}}/></div><h2 className="quiz-question">{question.prompt}</h2><div className="answer-list">{question.options.map((option,i)=><button key={option} className={answer!==null?(i===question.answer?'correct':i===answer?'incorrect':''):''} disabled={answer!==null} onClick={()=>{setAnswer(i);if(i===question.answer)setScore(s=>s+1)}}><i>{String.fromCharCode(65+i)}</i><span>{option}</span>{answer!==null&&i===question.answer&&<Icon name="check" size={18}/>}</button>)}</div>{answer!==null&&<div className="answer-feedback" aria-live="polite"><strong>{answer===question.answer?'回答正确':'一起记住这个答案'}</strong><p>{question.explanation}</p></div>}<Action disabled={answer===null} onClick={()=>{if(step===questions.length-1)finish();else{setStep(step+1);setAnswer(null)}}}>{step===questions.length-1?'完成探索':'下一题'}</Action></>
}

export function SearchPanel({ open }: { open:(p:Panel)=>void }) {
  const [query,setQuery]=useState('')
  const results=exhibits.map((e,i)=>({...e,index:i})).filter(e=>`${e.name}${e.description}`.includes(query.trim()))
  return <><label className="search-field"><Icon name="search" size={20}/><input placeholder="搜索展厅、故事或地点" value={query} onChange={e=>setQuery(e.target.value)} aria-label="搜索内容"/>{query&&<button aria-label="清除搜索" onClick={()=>setQuery('')}><Icon name="close" size={16}/></button>}</label><p className="search-label">{query?`${results.length} 个相关展项`:'你可以从这里开始'}</p><div className="list-group">{results.map(e=><button className="list-row" key={e.id} onClick={()=>open({kind:'exhibit',index:e.index})}><Icon name="pin" size={20}/><span className="row-text"><strong>{e.name}</strong><small>{e.date} · {e.place}</small></span><Icon name="chevron" size={14}/></button>)}</div>{results.length===0&&<div className="empty-state"><Icon name="search" size={35}/><h3>还没有找到</h3><p>试试“遵义”“雪山”或“会师”。</p></div>}</>
}
export function SettingsPanel({ large,setLarge }: { large:boolean;setLarge:(v:boolean)=>void }) { return <><h2 className="panel-title">读得舒适一点。</h2><p className="panel-description">根据你的习惯，调整阅读体验。</p><button className="settings-line" role="switch" aria-checked={large} onClick={()=>setLarge(!large)}><span className="text-size-icon">Aa</span><span>放大阅读文字</span><span className={`toggle ${large?'on':''}`}/></button><div className="reading-preview"><strong>每一步，都有回响。</strong><p style={{fontSize:large?19:15}}>跟随一条路线，走近一段历史。</p></div><p className="context-note">动画自动遵循设备的“减少动态效果”设置。</p></> }
export function CollectionPanel({ saved,open }: { saved:Saved;open:(p:Panel)=>void }) { return <>{saved.favorites.length===0?<div className="empty-state"><Icon name="heart" size={38}/><h2>把有共鸣的，留下来。</h2><p>在讲解或影片中轻点爱心，<br/>它们就会出现在这里。</p></div>:<div className="list-group">{exhibits.map((e,i)=>saved.favorites.includes(e.id)&&<button key={e.id} className="list-row" onClick={()=>open({kind:'exhibit',index:i})}><Icon name="audio"/><span className="row-text"><strong>{e.name}</strong><small>展厅讲解</small></span><Icon name="chevron" size={14}/></button>)}{films.map((f,i)=>saved.favorites.includes(f.id)&&<button key={f.id} className="list-row" onClick={()=>open({kind:'movie',index:i})}><Icon name="cinema"/><span className="row-text"><strong>{f.title}</strong><small>光影内容</small></span><Icon name="chevron" size={14}/></button>)}</div>}</> }
export function CardPanel({ saved,notify }: { saved:Saved;notify:(s:string)=>void }) {
  const date=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
  const download=()=>{
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100"><rect width="800" height="1100" fill="#f5f4f0"/><g font-family="system-ui, sans-serif" fill="#242825"><text x="72" y="110" font-size="28">栈川行 / ZHANCHUAN XING</text><text x="72" y="265" font-size="61">每一步，</text><text x="72" y="350" font-size="61">都有回响。</text><text x="72" y="430" font-size="24" fill="#72756f">长征胜利九十周年 · 1936—2026</text><path d="M130 755C300 800 400 670 270 610S410 500 470 620 650 660 680 520" fill="none" stroke="#b64046" stroke-width="9" stroke-linecap="round"/><text x="72" y="895" font-size="27">${saved.visited.length} 个故事 · ${saved.completed.length} 次探索</text><path d="M72 949h656" stroke="#d9dbd3"/><text x="72" y="1000" font-size="21" fill="#72756f">${date} · 我的栈川行</text></g></svg>`
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='栈川行-我的旅程纪念卡.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('纪念卡已生成，可保存为矢量图')
  }
  return <><div className="souvenir"><div className="wordmark"><BrandMark size={22}/><strong>栈川行</strong></div><h2>每一步，<br/>都有回响。</h2><span className="eyebrow">1936 — 2026</span><JourneyArtwork/><p>{saved.visited.length} 个故事 · {saved.completed.length} 次探索</p><footer>{date}<span>我的栈川行</span></footer></div><Action icon="download" onClick={download}>保存纪念卡</Action></>
}
