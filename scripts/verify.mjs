import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { routes, exhibits } from '../src/content.ts'
import { evidence } from '../src/evidence.ts'
import { readJourney, startJourney, advanceJourney, remainingMinutes, stopMinutes, walkingPath, walkingInfo } from '../src/journey.ts'

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

test('walking paths are orthogonal and avoid unrelated gallery interiors', () => {
  const rooms = [[25,35,144,126],[202,35,329,126],[25,186,112,286],[225,186,329,286],[135,185,197,265]]
  const stationRoom = [2,0,1,3,4]
  for (const from of [null,0,1,2,3,4]) for (let to = 0; to < 5; to++) {
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

test('all five real audio tracks match their captions, script and WAV durations', () => {
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
