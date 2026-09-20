import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { exhibits, formatTime } from './content'
import { Icon } from './Visuals'

type Cue = { text: string; start: number; end: number }
type Track = { id: string; duration: number; cues: Cue[] }
type AudioController = {
  index: number | null; playing: boolean; elapsed: number; duration: number; rate: number;
  error: string; loading: boolean; captions: boolean; walk: boolean; cue: string;
  tracks: Track[]; play: (index: number) => void; toggle: () => void; seek: (value: number) => void;
  setRate: (value: number) => void; setCaptions: (value: boolean) => void; setWalk: (value: boolean) => void; dismiss: () => void;
}
const AudioContext = createContext<AudioController | null>(null)
export function useAudioGuide() { return useContext(AudioContext)! }

export function AudioGuideProvider({ children, listened }: { children: ReactNode; listened: (id: string) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [index, setIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, updateRate] = useState(1)
  const [captions, setCaptions] = useState(true)
  const [walk, setWalk] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const listenedRef = useRef(listened)
  listenedRef.current = listened
  useEffect(() => {
    const abort = new AbortController()
    fetch(`${import.meta.env.BASE_URL}audio/narration.json`, { signal: abort.signal }).then(r => r.ok ? r.json() : []).then(setTracks).catch(() => {})
    return () => abort.abort()
  }, [])
  const attemptPlay = () => {
    const a = audioRef.current
    if (!a) return
    setError('')
    void a.play().catch(e => { if (e.name !== 'AbortError') { setError('音频未能播放，请检查网络后重试；文字稿仍可阅读。'); setLoading(false) } })
  }
  const play = (next: number) => {
    const a = audioRef.current
    if (!a) return
    if (next !== index || a.error) {
      a.src = `${import.meta.env.BASE_URL}audio/${exhibits[next].id}.wav`
      a.load()
      a.playbackRate = rate
      setIndex(next); setElapsed(0); setDuration(0); setLoading(true)
    } else if (a.ended) a.currentTime = 0
    attemptPlay()
  }
  const toggle = () => { if (audioRef.current?.paused) { if (index !== null && audioRef.current.error) play(index); else attemptPlay() } else audioRef.current?.pause() }
  const seek = (value: number) => { const a = audioRef.current; if (a && Number.isFinite(a.duration)) { a.currentTime = Math.min(a.duration, Math.max(0, value)); setElapsed(a.currentTime) } }
  const setRate = (value: number) => { updateRate(value); if (audioRef.current) audioRef.current.playbackRate = value }
  const dismiss = () => { audioRef.current?.pause(); setIndex(null); setElapsed(0); setDuration(0); setError('') }
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (index === null) { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = 'none'; return }
    navigator.mediaSession.metadata = new MediaMetadata({ title: exhibits[index].name, artist: '栈川行 · 普通话讲解', album: '陪你走完一段历史' })
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
    const a = audioRef.current!
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: attemptPlay, pause: () => a.pause(), seekbackward: () => seek(a.currentTime - 15), seekforward: () => seek(a.currentTime + 15), seekto: d => seek(d.seekTime ?? 0),
    }
    for (const [name, fn] of Object.entries(handlers)) { try { navigator.mediaSession.setActionHandler(name as MediaSessionAction, fn) } catch { /* Optional browser capability. */ } }
    return () => { for (const name of Object.keys(handlers)) { try { navigator.mediaSession.setActionHandler(name as MediaSessionAction, null) } catch { /* Optional browser capability. */ } } }
  }, [index, playing])
  useEffect(() => { if ('mediaSession' in navigator && duration > 0) { try { navigator.mediaSession.setPositionState({ duration, playbackRate: rate, position: Math.min(elapsed, duration) }) } catch { /* Older browsers may not support lock-screen position. */ } } }, [duration, elapsed, rate])
  const cue = tracks.find(t => t.id === (index === null ? '' : exhibits[index].id))?.cues.find(c => elapsed >= c.start && elapsed < c.end)?.text || ''
  return <AudioContext.Provider value={{ index, playing, elapsed, duration, rate, error, loading, captions, walk, cue, tracks, play, toggle, seek, setRate, setCaptions, setWalk, dismiss }}>
    <audio ref={audioRef} preload="metadata" onPlay={() => { setPlaying(true); setLoading(false) }} onPause={() => setPlaying(false)} onWaiting={() => setLoading(true)} onCanPlay={() => setLoading(false)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} onTimeUpdate={e => setElapsed(e.currentTarget.currentTime)} onEnded={() => { setPlaying(false); if (index !== null) listenedRef.current(exhibits[index].id) }} onError={() => { setPlaying(false); setLoading(false); setError('音频加载失败，请检查网络后重试。') }}/>
    {children}
  </AudioContext.Provider>
}

export function AudioControls({ index }: { index: number }) {
  const a = useAudioGuide()
  const active = a.index === index
  const duration = active && a.duration ? a.duration : a.tracks.find(t => t.id === exhibits[index].id)?.duration || 0
  const position = active ? a.elapsed : 0
  return <section className="guide-player" aria-label={`${exhibits[index].name}音频讲解`}>
    <div className="player-caption"><Icon name="audio" size={17}/><strong>随身听讲</strong><span>普通话 · 合成语音</span></div>
    <input type="range" min={0} max={duration || 1} step={1} disabled={!active || !a.duration} value={position} onChange={e => a.seek(Number(e.target.value))} aria-label="讲解进度" aria-valuetext={`${formatTime(position)}，共${formatTime(duration)}`}/>
    <div className="audio-times"><span>{formatTime(position)}</span><span>{duration ? formatTime(duration) : '加载时长…'}</span></div>
    <div className="transport"><button disabled={!active || !a.duration} onClick={() => a.seek(position - 15)} aria-label="后退15秒"><Icon name="back" size={20}/><span>15 秒</span></button><button className="main-play" onClick={() => active ? a.toggle() : a.play(index)} aria-label={active && a.playing ? '暂停讲解' : '播放讲解'}><Icon name={active && a.playing ? 'pause' : 'play'} size={26}/></button><button disabled={!active || !a.duration} onClick={() => a.seek(position + 15)} aria-label="前进15秒"><Icon name="arrow" size={20}/><span>15 秒</span></button></div>
    <div className="audio-options"><label>语速<select aria-label="讲解播放速度" value={a.rate} onChange={e => a.setRate(Number(e.target.value))}>{[.75, 1, 1.25, 1.5].map(rate => <option key={rate} value={rate}>{rate.toFixed(2).replace(/0$/, '')}×</option>)}</select></label><button aria-pressed={a.captions} onClick={() => a.setCaptions(!a.captions)}><Icon name="caption" size={17}/>字幕</button><button aria-pressed={a.walk} onClick={() => a.setWalk(!a.walk)}><Icon name="route" size={17}/>边走边听</button></div>
    {active && a.loading && <p className="player-note" role="status">正在缓冲讲解…</p>}
    {active && a.error && <p className="player-note" role="alert">{a.error}</p>}
    {a.captions && <div className="spoken-caption"><small>{active && a.playing ? '正在讲述' : '这一段，听什么'}</small><p>{active && a.cue ? a.cue : exhibits[index].description}</p></div>}
    {a.walk && <p className="player-note">可收起页面继续听。锁屏播放取决于浏览器支持；到站请在地图上确认，再选择下一段讲解。</p>}
  </section>
}

export function MiniPlayer({ open }: { open: (index: number) => void }) {
  const a = useAudioGuide()
  if (a.index === null) return null
  return <div className="mini-player glass"><button className="mini-track" onClick={() => open(a.index!)}><Icon name="audio" size={21}/><span><strong>{exhibits[a.index].name}</strong><small>{a.error ? '加载失败 · 点此重试' : a.playing ? '正在讲述' : '讲解已暂停'} · {formatTime(a.elapsed)}</small></span></button><button aria-label={a.playing ? '暂停随身听' : '继续随身听'} onClick={a.toggle}><Icon name={a.playing ? 'pause' : 'play'} size={20}/></button><button aria-label="关闭随身听" onClick={a.dismiss}><Icon name="close" size={18}/></button></div>
}
