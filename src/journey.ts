import { routes } from './content.ts'

export type Journey = { routeIndex: number; step: number; arrived: boolean; status: 'active' | 'finished'; startedAt: string; flags: number[] }
export function readJourney(value: string | null): Journey | null {
  try {
    let v = JSON.parse(value || 'null')
    // Earlier installations used five stations and three route indexes.
    if (v && !('flags' in v)) {
      const legacyRoutes = [[0,1,4,5,6], [0,1,6], [0,4,5,6]]
      const legacy = legacyRoutes[v.routeIndex]
      if (!Number.isInteger(v.routeIndex) || !legacy || !Number.isInteger(v.step) || v.step < 0 || v.step >= legacy.length || typeof v.arrived !== 'boolean' || !['active','finished'].includes(v.status) || typeof v.startedAt !== 'string' || !Number.isFinite(Date.parse(v.startedAt))) return null
      if (v.status === 'finished' && (v.step !== legacy.length - 1 || !v.arrived)) return null
      const routeIndex = v.routeIndex === 1 ? 0 : 1
      const flags = legacy.slice(0, v.step + (v.arrived ? 1 : 0))
      const current = legacy[v.step]
      v = { ...v, routeIndex, step: routes[routeIndex].stops.indexOf(current), flags }
    }
    if (!v || !Number.isInteger(v.routeIndex) || !routes[v.routeIndex] || !Number.isInteger(v.step) || v.step < 0 || v.step >= routes[v.routeIndex].stops.length || typeof v.arrived !== 'boolean' || !['active', 'finished'].includes(v.status) || typeof v.startedAt !== 'string' || !Number.isFinite(Date.parse(v.startedAt))) return null
    if (v.status === 'finished' && (v.step !== routes[v.routeIndex].stops.length - 1 || !v.arrived)) return null
    const flags = Array.isArray(v.flags) ? v.flags.filter((n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 7) : []
    return { ...v, flags: [...new Set(flags)] }
  } catch { return null }
}
export function startJourney(routeIndex: number): Journey {
  if (!Number.isInteger(routeIndex) || !routes[routeIndex]) throw new RangeError('Unknown route')
  return { routeIndex, step: 0, arrived: false, status: 'active', startedAt: new Date().toISOString(), flags: [] }
}
export function advanceJourney(j: Journey): Journey {
  if (j.status === 'finished' || !j.arrived) return j
  const next = routes[j.routeIndex].stops.findIndex((stop, i) => i > j.step && !j.flags.includes(stop))
  return next < 0 ? { ...j, step: routes[j.routeIndex].stops.length - 1, status: 'finished' } : { ...j, step: next, arrived: false }
}
export function switchJourney(routeIndex: number, previous: Journey | null): Journey {
  const fresh = startJourney(routeIndex)
  if (!previous) return fresh
  const flags = [...previous.flags]
  const step = routes[routeIndex].stops.findIndex(stop => !flags.includes(stop))
  return { ...fresh, flags, startedAt: previous.startedAt, step: step < 0 ? routes[routeIndex].stops.length - 1 : step, arrived: step < 0, status: step < 0 ? 'finished' : 'active' }
}
export function remainingMinutes(j: Journey): number {
  const route = routes[j.routeIndex]
  return j.status === 'finished' ? 0 : route.stops.reduce((sum, stop, step) => sum + (step >= j.step && (!j.flags.includes(stop) || step === j.step) ? stopMinutes(j.routeIndex, step) : 0), 0)
}
export function stopMinutes(routeIndex: number, step: number): number {
  const r = routes[routeIndex]
  return Math.ceil(r.minutes * (step + 1) / r.stops.length) - Math.ceil(r.minutes * step / r.stops.length)
}
export const mapPoints = [[82, 60], [272, 60], [272, 145], [82, 145], [82, 230], [272, 230], [272, 315]]
export const mapEntrance = [177, 370]
export const mapRooms = mapPoints.map(([x, y]) => [x - 56, y - 27, x + 56, y + 34])
// Exit each gallery before crossing the illustrated corridor; never cut through a room.
export function walkingPath(from: number | null, to: number): number[][] {
  const a = from === null ? mapEntrance : mapPoints[from]
  const b = mapPoints[to]
  if (from === to) return [a]
  return [a, [177, a[1]], [177, b[1]], b]
}
// Illustrative walking distances, never sensor readings.
export function walkingInfo(from: number | null, to: number) {
  const points = walkingPath(from, to)
  const distance = points.slice(1).reduce((total, p, i) => total + Math.abs(p[0] - points[i][0]) + Math.abs(p[1] - points[i][1]), 0)
  const meters = Math.round(distance * .28)
  return { meters, minutes: meters === 0 ? 0 : Math.max(1, Math.ceil(meters / 55)) }
}
