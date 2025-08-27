import { Bench } from 'tinybench'

// Benchmark against built outputs to avoid TS/runtime overhead
import { puid, generate, Chars } from '../../build/module/index.mjs'

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
  bench.tasks.map((t) => {
    const samples = t.result?.samples ?? []
    const meanNs = t.result?.mean ?? 0
    const nsPerOp = meanNs ? Math.round(meanNs) : NaN
    const ops = meanNs ? Math.round(1e9 / meanNs) : Math.round(t.hz || 0)
    let median = NaN
    if (samples.length) {
      const sorted = [...samples].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      median = sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    }
    return {
      name: t.name,
      'ns/op (mean)': nsPerOp,
      'ns/op (median)': median,
      'ops/s': ops,
      '±%': (t.result?.rme ?? 0).toFixed(2),
      samples: samples.length
    }
  })
)

