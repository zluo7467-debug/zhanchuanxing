import { evidence } from '../src/evidence.ts'
import { exhibits } from '../src/content.ts'
console.log(JSON.stringify(exhibits.map((e, i) => ({ id: e.id, segments: [e.name + '。' + evidence[i].question, ...evidence[i].paragraphs] }))))
