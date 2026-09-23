import { films } from './content.ts'

export type ProjectionStage = 'idle' | 'preparing' | 'ready' | 'playing' | 'paused' | 'ended'
export type Projection = { filmIndex: number | null; stage: ProjectionStage; elapsed: number }
export const emptyProjection: Projection = { filmIndex: null, stage: 'idle', elapsed: 0 }
export const projectionLabels: Record<ProjectionStage, string> = {
  idle: '沉浸放映', preparing: '机器人正在前往', ready: '请前往投影点',
  playing: '放映中', paused: '已暂停', ended: '放映已结束',
}
export function prepareProjection(index: number): Projection {
  if (!Number.isInteger(index) || !films[index]) throw new RangeError('Unknown projection content')
  return { filmIndex: index, stage: 'preparing', elapsed: 0 }
}
export function projectionReady(state: Projection): Projection {
  return state.stage === 'preparing' ? { ...state, stage: 'ready' } : state
}
export function startProjection(state: Projection): Projection {
  if (state.filmIndex === null || !['ready','paused','ended'].includes(state.stage)) return state
  return { ...state, stage: 'playing', elapsed: state.stage === 'ended' ? 0 : state.elapsed }
}
export function pauseProjection(state: Projection): Projection {
  return state.stage === 'playing' ? { ...state, stage: 'paused' } : state
}
export function tickProjection(state: Projection): Projection {
  if (state.stage !== 'playing' || state.filmIndex === null || films[state.filmIndex].game) return state
  const elapsed = Math.min(state.elapsed + 1, films[state.filmIndex].duration)
  return { ...state, elapsed, stage: elapsed === films[state.filmIndex].duration ? 'ended' : 'playing' }
}
