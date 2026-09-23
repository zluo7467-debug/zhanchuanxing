import { exhibits } from './content'
import { mapEntrance, mapPoints, mapRooms, walkingPath } from './journey'

export function MuseumMap({ from, target, selected, flags, stops, onSelect }: { from: number | null; target: number; selected: number | null; flags: number[]; stops: number[]; onSelect: (i: number) => void }) {
  const here = from === null ? mapEntrance : [177, mapPoints[from][1]]
  return <svg viewBox="0 0 354 405" aria-label={`示意地图：你在${from === null ? '入口' : exhibits[from].name}，目标${exhibits[target].name}`}>
    <g className="map-rooms">{mapRooms.map(([x1, y1, x2, y2], i) => <rect key={i} x={x1} y={y1} width={x2-x1} height={y2-y1} rx="10"/>)}</g>
    <path d={`M177 370V60 ${mapPoints.map(([x,y]) => `M177 ${y}H${x}`).join(' ')}`} className="map-route-back"/>
    {from !== target && <path d={walkingPath(from, target).map(([x,y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')} className="direction-path"/>}
    {exhibits.map((exhibit, i) => <g key={exhibit.id} role="button" tabIndex={0} aria-label={`查看${exhibit.name}${flags.includes(i) ? '，已插旗' : ''}`} aria-pressed={selected === i} className={`map-node ${i === target ? 'selected' : ''} ${flags.includes(i) ? 'flagged' : ''} ${selected === i ? 'inspecting' : ''} ${stops.includes(i) ? 'on-route' : 'off-route'}`} onClick={() => onSelect(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i) } }}>
      <circle cx={mapPoints[i][0]} cy={mapPoints[i][1]} r="18"/>
      <text x={mapPoints[i][0]} y={mapPoints[i][1]+4}>{String(i+1).padStart(2,'0')}</text>
      <text className="station-label" x={mapPoints[i][0]} y={mapPoints[i][1]+29}>{exhibit.name}</text>
      {flags.includes(i) && <g transform={`translate(${mapPoints[i][0]+26},${mapPoints[i][1]-17})`} className="map-flag"><path d="M0 0v23M0 1c5-3 9 3 14 0v10c-5 3-9-3-14 0"/></g>}
    </g>)}
    <g className="you-are-here" transform={`translate(${here[0]},${here[1]})`}><circle r="9" fill="white"/><circle r="5" fill="var(--red)"/><text x="0" y="23" textAnchor="middle">你在这里</text></g>
    <text x="82" y="330" className="map-exit-label">入口 / 服务台</text>
  </svg>
}
