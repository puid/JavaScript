import { generate, puid, Chars } from 'puid-js'

const id = generate({ chars: Chars.Safe32 })
console.log('id:', id)

const { generator } = puid({ total: 1e5, risk: 1e12, chars: Chars.Safe32 })
if (!generator) {
  throw new Error('puid() returned error in example')
}
console.log('gen:', generator())

