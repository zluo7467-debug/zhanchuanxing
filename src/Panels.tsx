import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BrandMark, Icon, JourneyArtwork } from './Visuals'
import { exhibits, films, questions } from './content'
import { Action, type Panel, type Saved } from './ui'

export function Sheet({ children, close, title }: { children: ReactNode; close: ()=>void; title: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey=(event: KeyboardEvent)=>{
      if(event.key==='Escape') close()
      if(event.key==='Tab') {
        const focusable=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0 && !element.closest('[inert]'))
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

export function ConnectPanel({ connected, connect, disconnect }: { connected:boolean;connect:()=>void;disconnect:()=>void }) {
  const [connecting,setConnecting]=useState(false)
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null)
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[])
  return <><div className={`connection-visual ${connecting?'searching':''}`}><span/><span/><div><Icon name="robot" size={55}/></div></div><div className="center-heading"><span className="eyebrow">同行向导</span><h2>{connected?'很高兴，与你同行':'让栈川行陪你走一程'}</h2><p>带路、讲解，也把光影带到你身边。</p></div><div className="device-choice"><Icon name="robot" size={28}/><span className="row-text"><strong>机器人 A07</strong><small>演示设备 · 不连接真实硬件</small></span><span className="connection-status">{connected?'已连接':'可连接'}</span></div><Action onClick={()=>{if(connected){disconnect();return}setConnecting(true);timer.current=setTimeout(connect,900)}} secondary={connected} disabled={connecting} icon={connected?'close':'check'}>{connected?'断开连接':connecting?'正在连接…':'连接我的向导'}</Action><p className="context-note">设备接入后，影片投影和导览指令将在此同步。</p></>
}

export function GamePanel({ variant, complete, close }: { variant:number;complete:(id:string)=>void;close:()=>void }) {
  const [phase,setPhase]=useState<'intro'|'play'|'result'>('intro')
  const [step,setStep]=useState(0)
  const [answer,setAnswer]=useState<number|null>(null)
  const [score,setScore]=useState(0)
  const [order,setOrder]=useState<number[]>([])
  const [incorrect,setIncorrect]=useState(false)
  const finish=()=>{complete(variant===0?'route':'quiz');setPhase('result')}
  if(phase==='intro') return <><div className="game-intro-art">{variant===0?<JourneyArtwork/>:<Icon name="book" size={70}/>}</div><span className="eyebrow">{variant===0?'串联路线':'历史回顾'}</span><h2 className="panel-title">{variant===0?'把足迹，连成征途':'五问，走近长征'}</h2><p className="panel-description">{variant===0?'按时间先后，依次选择长征中的五个节点。每一次选择，都让这段历史更清晰。':'从五个历史问题出发，了解长征的重要地点与时刻。每一题都有简短解读。'}</p><div className="route-facts"><span><Icon name="clock" size={16}/>约 2 分钟</span><span><Icon name="profile" size={16}/>单人探索</span></div><Action onClick={()=>setPhase('play')}>开始探索</Action></>
  if(phase==='result') return <div className="game-result"><span className="result-mark"><Icon name="check" size={44}/></span><p className="eyebrow">再走近一点</p><h2>又走近历史一点。</h2><p>{variant===0?'你已串联起五个重要节点。':`你答对了 ${score} / ${questions.length} 题，完成本次学习。`}</p><div className="result-note"><strong>{variant===0?'从出发，到会师':'从历史，到今天'}</strong><p>真正留下的，不只是一个答案，<br/>还有继续了解的好奇心。</p></div><Action icon="check" onClick={close}>记住这一刻</Action></div>
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
