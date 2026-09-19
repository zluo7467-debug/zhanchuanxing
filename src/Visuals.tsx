import { useId } from 'react'
import type { IconName } from './content'

// One optical weight and rounded geometry throughout. All marks remain editable SVG.
export function Icon({ name, size = 22, className = '' }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m4 10 8-6 8 6v9a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19Z" /><path d="M9 20v-6h6v6" /></>,
    compass: <><circle cx="12" cy="12" r="8.5"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/></>,
    cinema: <><rect x="3" y="5" width="18" height="12.5" rx="3"/><path d="m10 9 5 2.5-5 2.5Z M8 21h8m-4-3.5V21"/></>,
    explore: <><path d="m12 3.5 7.7 4.2v8.6L12 20.5l-7.7-4.2V7.7Z M4.3 7.7 12 12l7.7-4.3 M12 12v8.5"/><path d="m8.2 5.6 7.6 4.2"/></>,
    profile: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2.5a7 7 0 0 1 14 0V21"/></>,
    arrow: <path d="M4 12h15m-5-5 5 5-5 5"/>, chevron: <path d="m9 5 7 7-7 7"/>, close: <path d="m6 6 12 12M18 6 6 18"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.7"/><path d="m16 16 4.5 4.5"/></>,
    pin: <><path d="M18.5 9.5c0 5-6.5 11-6.5 11s-6.5-6-6.5-11a6.5 6.5 0 1 1 13 0Z"/><circle cx="12" cy="9.5" r="2"/></>,
    audio: <><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/></>,
    robot: <><rect x="4" y="7" width="16" height="13" rx="5"/><path d="M12 7V3m-2.5 0h5 M8.5 12v2m7-2v2 M9.5 17h5"/></>,
    route: <><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M5 16V8a3 3 0 0 1 6 0v8a4 4 0 0 0 8 0V8"/></>,
    play: <path d="M8 4.5 20 12 8 19.5Z"/>, pause: <><path d="M8 5v14m8-14v14" strokeWidth="3"/></>, check: <path d="m5 12 4.5 4.5L19 7"/>,
    heart: <path d="M20 5.8a5.2 5.2 0 0 0-8 .9 5.2 5.2 0 0 0-8-.9C-1 11 7 17.5 12 21c5-3.5 13-10 8-15.2Z"/>,
    volume: <><path d="m11 5-5 4H3v6h3l5 4Z M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>, back: <path d="M19 12H4m5-5-5 5 5 5"/>,
    signal: <><path d="M4 18v-3m5 3v-6m5 6V9m5 9V5" strokeWidth="2.8"/></>,
    wifi: <><path d="M3 9a14 14 0 0 1 18 0M6 12.5a9 9 0 0 1 12 0m-9 3.2a4.6 4.6 0 0 1 6 0"/><circle cx="12" cy="19" r=".7" fill="currentColor"/></>,
    battery: <><rect x="2" y="6" width="18" height="12" rx="3"/><path d="M23 10v4"/><rect x="4.5" y="8.5" width="13" height="7" rx="1" fill="currentColor" stroke="none"/></>,
    settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="var(--surface, #fff)"/><circle cx="16" cy="17" r="2.5" fill="var(--surface, #fff)"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>,
    book: <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/></>,
    caption: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9H7v6h3m8-6h-3v6h3"/></>,
  }
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function BrandMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 24C-1 12 23 22 14 9 12 6 16 2 19 3M23 8c10 12-14 2-5 15 2 3-2 7-5 6" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round"/><circle cx="23" cy="5" r="2" fill="currentColor"/></svg>
}

export function JourneyArtwork({ compact = false }: { compact?: boolean }) {
  const id = useId().replace(/:/g, '')
  return <svg className={`journey-art ${compact ? 'compact' : ''}`} viewBox="0 0 354 205" fill="none" aria-label="以朱红丝带描绘的长征路线意象" role="img">
    <defs>
      <linearGradient id={`ribbon-${id}`} x1="54" y1="195" x2="302" y2="27" gradientUnits="userSpaceOnUse"><stop stopColor="#9c292e"/><stop offset=".32" stopColor="#dd615e"/><stop offset=".56" stopColor="#b8343b"/><stop offset=".8" stopColor="#e47470"/><stop offset="1" stopColor="#a52c35"/></linearGradient>
      <filter id={`shadow-${id}`} x="-35%" y="-40%" width="170%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <g stroke="#dddcd6" strokeWidth=".65" opacity=".65">
      <path d="M-30 129C22 72 47 30 95 40s16 58 54 69 70-103 124-103 109 80 97 161"/><path d="M-20 149C35 97 57 49 88 52s19 61 62 70S225 21 272 22s84 70 82 128"/><path d="M-7 163C43 119 63 63 83 67s22 65 69 70S228 38 272 39s73 66 69 114"/><path d="M6 178C56 136 62 79 82 83s27 70 74 67S235 54 272 55s52 55 51 91"/><path d="M24 194C65 163 67 97 82 101s39 68 77 64S238 70 270 72s33 38 34 58"/><path d="M54 211C91 170 82 131 102 145s25 38 65 35S238 92 264 91s18 31 17 35"/>
      <path d="M163 218c38-49 56-30 84-68s45-32 83-6 42 59 62 68M176 228c32-32 51-37 80-63s42-20 69-1 33 44 41 55M197 237c33-30 43-29 70-53s30-10 46 5 23 28 30 46"/>
    </g>
    <path d="M55 179C85 195 120 189 127 165s-38-39-38-60 28-31 46-18 24 49 53 40 18-52 47-65 50 4 61-34" stroke="#854137" strokeWidth="10" opacity=".17" filter={`url(#shadow-${id})`} transform="translate(0 7)"/>
    <path d="M55 179C85 195 120 189 127 165s-38-39-38-60 28-31 46-18 24 49 53 40 18-52 47-65 50 4 61-34" stroke={`url(#ribbon-${id})`} strokeWidth="7" strokeLinecap="round"/>
    <path d="M55 177C85 193 120 187 126 164s-38-39-38-60 29-31 47-18 24 49 53 40 18-52 47-65 50 4 61-34" stroke="#ffd2c4" strokeWidth=".7" strokeLinecap="round" opacity=".7"/>
    <circle cx="55" cy="179" r="5" fill="#fff" stroke="#b63a3d" strokeWidth="2"/><circle cx="296" cy="28" r="5" fill="#b63a3d" stroke="#fff" strokeWidth="2"/>
    <g fill="#777773" fontFamily="system-ui,sans-serif" fontSize="9"><text x="27" y="158">瑞金 · 1934</text><text x="236" y="14">会宁 · 1936</text></g>
  </svg>
}

export function FilmArtwork({ motif = 'turn', small = false }: { motif?: string; small?: boolean }) {
  return <div className={`film-artwork ${motif} ${small ? 'small' : ''}`} aria-hidden="true"><svg viewBox="0 0 354 230" fill="none">
    {motif === 'turn' ? <><g stroke="currentColor" opacity=".2">{[0,1,2,3,4,5,6,7].map(i=><path key={i} d={`M${85+i*11} -10v${79+i*2}c0 35 70 33 70 70v110`}/>)}</g><path d="M100-10v86c0 46 94 41 94 87v80" stroke="currentColor" strokeWidth="5"/><path d="m184 211 10 11 10-11" stroke="currentColor" strokeWidth="2"/></> : motif === 'mountain' ? <g stroke="currentColor">{[0,1,2,3,4,5,6].map(i=><path opacity={.72-i*.09} key={i} d={`M-20 ${205+i*12} 108 ${57+i*13}l45 48 51-75 172 ${190+i*13}`} strokeWidth={i===0?2:1}/>)}</g> : <><rect x="88" y="58" width="182" height="122" rx="3" stroke="currentColor"/><path d="m88 59 91 69 91-69M88 180l69-67m113 67-69-67" stroke="currentColor"/><path d="M167 152h25" stroke="currentColor" strokeWidth="2"/></>}
  </svg></div>
}
