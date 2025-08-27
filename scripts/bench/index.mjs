import { Bench } from 'tinybench'

// Benchmark against built outputs to avoid TS/runtime overhead
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = require(path.resolve(__dirname, '../../build/main/index.js'))
const { puid, generate, Chars } = pkg

const bench = new Bench({ time: 1000 })

const puidSafe32 = puid({ chars: Chars.Safe32 })
if ('error' in puidSafe32) throw puidSafe32.error
const safe32Gen = puidSafe32.generator

bench
  .add('puid() pre-built generator (Safe32)', () => {
    safe32Gen()
  })
  .add('puid() new generator each time (Safe32)', () => {
    const res = puid({ chars: Chars.Safe32 })
    if ('generator' in res) res.generator()
  })
  .add('generate() default (Safe64, 128 bits)', () => {
    generate()
  })
  .add('generate() Safe32', () => {
    generate({ chars: Chars.Safe32 })
  })

await bench.run()

console.table(
  bench.tasks.map((t) => ({
    name: t.name,
    hz: Math.round(t.hz),
    '±%': (t.result?.rme ?? 0).toFixed(2),
    samples: t.result?.samples.length ?? 0
  }))
)

