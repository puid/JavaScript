import { generate, puid } from '../../build/module/index.mjs'

const ok = typeof generate === 'function' && typeof puid === 'function'
console.log(ok ? 'ok' : 'bad')
