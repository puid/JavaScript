import test from 'ava'

import prngBytes from './prngBytes'
import puid from './puid'

test('prng bytes', (t) => {
  t.is(prngBytes(4).length, 4)
  t.is(prngBytes(6).length, 6)
  t.is(prngBytes(8).length, 8)
  t.is(prngBytes(20).length, 20)
})

test.only('prng puid', (t) => {
  const { generator: randId } = puid({ entropyBytes: prngBytes })
  t.assert(!!randId)
  if (randId) t.is(randId().length, randId.info.length)
})
