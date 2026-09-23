import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { routes, exhibits } from '../src/content.ts'
import { evidence } from '../src/evidence.ts'
import { emptyProjection, prepareProjection, projectionReady, startProjection, pauseProjection, tickProjection } from '../src/projection.ts'
import { readJourney, startJourney, switchJourney, advanceJourney, remainingMinutes, stopMinutes, walkingPath, walkingInfo, mapRooms } from '../src/journey.ts'

test('all routes finish only after each arrival and retain a valid resume state', () => {
  routes.forEach((route, index) => {
    let journey = startJourney(index)
    assert.equal(remainingMinutes(journey), route.minutes)
    assert.equal(route.stops.reduce((sum, _, step) => sum + stopMinutes(index, step), 0), route.minutes)
    route.stops.forEach((_, step) => {
      assert.equal(journey.step, step)
      assert.equal(remainingMinutes(journey), route.stops.slice(step).reduce((sum, _, offset) => sum + stopMinutes(index, step + offset), 0))
      assert.equal(advanceJourney(journey), journey)
      assert.deepEqual(readJourney(JSON.stringify(journey)), journey)
      journey = advanceJourney({ ...journey, arrived: true })
    })
    assert.equal(journey.status, 'finished')
    assert.equal(remainingMinutes(journey), 0)
    assert.deepEqual(readJourney(JSON.stringify(journey)), journey)
    assert.equal(advanceJourney(journey), journey)
  })
})

test('malformed or impossible saved journeys are rejected', () => {
  const good = startJourney(0)
  for (const value of [null, '', '{', 'null', '[]', ...[
    { routeIndex: -1 }, { routeIndex: 99 }, { step: -1 }, { step: 99 },
    { step: .5 }, { arrived: 'yes' }, { startedAt: 'bad-date' },
    { status: 'finished' }, { status: 'finished', step: 4, arrived: false },
  ].map(patch => JSON.stringify({ ...good, ...patch }))]) assert.equal(readJourney(value), null)
  assert.throws(() => startJourney(99), RangeError)
})

test('legacy journeys migrate station identities without assigning the wrong flags', () => {
  const legacy = { routeIndex: 0, step: 2, arrived: true, status: 'active', startedAt: '2026-09-20T12:00:00Z' }
  const migrated = readJourney(JSON.stringify(legacy))
  assert.equal(migrated.routeIndex, 1)
  assert.equal(routes[migrated.routeIndex].stops[migrated.step], 4)
  assert.deepEqual(migrated.flags, [0,1,4])
  assert.equal(readJourney(JSON.stringify({ ...legacy, routeIndex: 2 })).routeIndex, 1)
  assert.equal(readJourney(JSON.stringify({ ...legacy, step: 88 })), null)
})

test('walking paths are orthogonal and avoid unrelated gallery interiors', () => {
  const rooms = mapRooms
  const stationRoom = [0,1,2,3,4,5,6]
  for (const from of [null,0,1,2,3,4,5,6]) for (let to = 0; to < 7; to++) {
    const points = walkingPath(from, to)
    points.slice(1).forEach((p, i) => {
      const a = points[i]
      assert.ok(a[0] === p[0] || a[1] === p[1])
      rooms.forEach(([x1,y1,x2,y2], room) => {
        if (room === stationRoom[to] || (from !== null && room === stationRoom[from])) return
        const intersects = a[0] === p[0]
          ? a[0] > x1 && a[0] < x2 && Math.max(a[1],p[1]) > y1 && Math.min(a[1],p[1]) < y2
          : a[1] > y1 && a[1] < y2 && Math.max(a[0],p[0]) > x1 && Math.min(a[0],p[0]) < x2
        assert.equal(intersects, false, `${from} -> ${to} cuts room ${room}`)
      })
    })
    assert.equal(walkingInfo(from,to).meters === 0, from === to)
  }
})

test('all seven real audio tracks match their captions, script and WAV durations', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/audio/narration.json', import.meta.url), 'utf8'))
  assert.equal(manifest.length, exhibits.length)
  exhibits.forEach((exhibit, index) => {
    const track = manifest.find(t => t.id === exhibit.id)
    const wav = readFileSync(new URL(`../public/audio/${exhibit.id}.wav`, import.meta.url))
    assert.equal(wav.toString('ascii',0,4), 'RIFF')
    assert.equal(wav.toString('ascii',8,12), 'WAVE')
    assert.equal(wav.readUInt32LE(4), wav.length - 8)
    assert.equal(wav.readUInt16LE(20), 1)
    assert.equal(wav.readUInt16LE(22), 1)
    assert.equal(wav.readUInt32LE(24), 16000)
    assert.equal(wav.readUInt32LE(40), wav.length - 44)
    const duration = (wav.length - 44) / wav.readUInt32LE(28)
    assert.ok(Math.abs(duration - track.duration) < .001)
    assert.ok(duration > 60)
    assert.deepEqual(track.cues.slice(1).map(cue => cue.text), evidence[index].paragraphs)
    track.cues.forEach((cue,i) => {
      assert.equal(cue.start, i === 0 ? 0 : track.cues[i-1].end)
      assert.ok(cue.end > cue.start)
    })
    assert.ok(Math.abs(track.cues.at(-1).end - duration) < .001)
  })
})

test('switching routes retains every flag and continues at the first unfinished station', () => {
  assert.deepEqual(routes.map(r => [r.minutes, r.stops]), [[40,[0,1,4,6]], [90,[0,1,2,3,4,5,6]]])
  const original = { ...startJourney(1), step: 3, flags: [0,1,2], arrived: false }
  const short = switchJourney(0, original)
  assert.equal(routes[short.routeIndex].stops[short.step], 4)
  assert.deepEqual(short.flags, [0,1,2])
  assert.equal(remainingMinutes(short), 20)
  const full = switchJourney(1, { ...short, flags: [0,1,2,4] })
  assert.equal(routes[1].stops[full.step], 3)
  const advanced = advanceJourney({ ...full, arrived: true, flags: [...full.flags,3] })
  assert.equal(routes[1].stops[advanced.step], 5)
  assert.deepEqual(readJourney(JSON.stringify(advanced)), advanced)
  assert.equal(switchJourney(0, { ...full, flags: [0,1,2,3,4,5,6] }).status, 'finished')
})

test('every station has aligned content and a supplied image; projection game is bundled', () => {
  assert.equal(exhibits.length, 7)
  assert.equal(evidence.length, 7)
  exhibits.forEach((e,i) => {
    assert.ok(existsSync(new URL(`../public/exhibits/${e.image}`, import.meta.url)))
    assert.ok(evidence[i].paragraphs.length >= 4)
    assert.ok(evidence[i].options[evidence[i].answer])
  })
  const game = readFileSync(new URL('../public/projection-game/red-star-adventure/index.html', import.meta.url), 'utf8')
  assert.ok(game.includes('背好行囊，出发'))
})

test('projection needs only request and arrival confirmation; preparation never auto-plays', () => {
  const request = prepareProjection(0)
  assert.equal(request.stage, 'preparing')
  assert.equal(startProjection(request), request)
  const ready = projectionReady(request)
  assert.equal(ready.stage, 'ready')
  const playing = startProjection(ready)
  assert.equal(playing.stage, 'playing')
  const elapsed = tickProjection(playing)
  assert.equal(elapsed.elapsed, 1)
  const paused = pauseProjection(elapsed)
  assert.equal(tickProjection(paused), paused)
  assert.equal(startProjection(paused).elapsed, 1)
  assert.equal(projectionReady(emptyProjection), emptyProjection)
  assert.throws(() => prepareProjection(88), RangeError)
})

test('content replacement resets progress; games are not truncated by film timer', () => {
  const game = startProjection(projectionReady(prepareProjection(3)))
  assert.equal(tickProjection(game), game)
  const replacement = prepareProjection(1)
  assert.equal(replacement.stage, 'preparing')
  assert.equal(replacement.elapsed, 0)
  const ended = tickProjection({filmIndex:1,stage:'playing',elapsed:311})
  assert.equal(ended.stage, 'ended')
  assert.equal(startProjection(ended).elapsed, 0)
})
