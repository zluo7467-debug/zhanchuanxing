import { routes } from './content.ts'

export type Journey = { routeIndex: number; step: number; arrived: boolean; status: 'active' | 'finished'; startedAt: string }
export function readJourney(value: string | null): Journey | null {
  try {
    const v = JSON.parse(value || 'null')
    if (!v || !Number.isInteger(v.routeIndex) || !routes[v.routeIndex] || !Number.isInteger(v.step) || v.step < 0 || v.step >= routes[v.routeIndex].stops.length || typeof v.arrived !== 'boolean' || !['active', 'finished'].includes(v.status) || typeof v.startedAt !== 'string' || !Number.isFinite(Date.parse(v.startedAt))) return null
    if (v.status === 'finished' && (v.step !== routes[v.routeIndex].stops.length - 1 || !v.arrived)) return null
    return v
  } catch { return null }
}
export function startJourney(routeIndex: number): Journey {
  if (!Number.isInteger(routeIndex) || !routes[routeIndex]) throw new RangeError('Unknown route')
  return { routeIndex, step: 0, arrived: false, status: 'active', startedAt: new Date().toISOString() }
}
export function advanceJourney(j: Journey): Journey {
  if (j.status === 'finished' || !j.arrived) return j
  return j.step === routes[j.routeIndex].stops.length - 1 ? { ...j, status: 'finished' } : { ...j, step: j.step + 1, arrived: false }
}
export function remainingMinutes(j: Journey): number {
  const route = routes[j.routeIndex]
  return j.status === 'finished' ? 0 : route.minutes - Math.ceil(route.minutes * j.step / route.stops.length)
}
export function stopMinutes(routeIndex: number, step: number): number {
  const r = routes[routeIndex]
  return Math.ceil(r.minutes * (step + 1) / r.stops.length) - Math.ceil(r.minutes * step / r.stops.length)
}
export const mapPoints = [[69, 249], [88, 85], [263, 85], [266, 247], [166, 221]]
// Exit each gallery before crossing the illustrated corridor; never cut through a room.
export function walkingPath(from: number | null, to: number): number[][] {
  const a = from === null ? [164, 314] : mapPoints[from]
  const b = mapPoints[to]
  if (from === to) return [a]
  const fromY = from === 1 || from === 2 ? 151 : 299
  const toY = to === 1 || to === 2 ? 151 : 299
  const corridor = fromY === toY ? [] : [[119, fromY], [119, toY]]
  return [a, [a[0], fromY], ...corridor, [b[0], toY], b]
}
// Illustrative walking distances, never sensor readings.
export function walkingInfo(from: number | null, to: number) {
  const points = walkingPath(from, to)
  const distance = points.slice(1).reduce((total, p, i) => total + Math.abs(p[0] - points[i][0]) + Math.abs(p[1] - points[i][1]), 0)
  const meters = Math.round(distance * .28)
  return { meters, minutes: meters === 0 ? 0 : Math.max(1, Math.ceil(meters / 55)) }
}
