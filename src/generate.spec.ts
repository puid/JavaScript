import test from 'ava'

import puid from './lib/puid'

import { Chars, generate } from './index'

// Convenience wrapper should produce a string and match the HOF-derived length
test('generate() default matches HOF length', (t) => {
  const { generator } = puid()
  if (!generator) t.fail('puid() failed to produce generator')
  const expectedLen = generator!.info.length

  const id = generate()
  t.is(typeof id, 'string')
  t.is(id.length, expectedLen)
})

// It should throw on invalid config (e.g., total without risk)
test('generate() throws on invalid config', (t) => {
  const err = t.throws(() => generate({ total: 1000 } as any))
  t.truthy(err)
  if (err) t.regex(err.message, /specified together/i)
})

// Respect provided config and produce same length as HOF for that config
test('generate(config) length equals HOF length', (t) => {
  const config = { total: 10e6, risk: 1e15, chars: Chars.Safe32 }
  const { generator } = puid(config)
  if (!generator) t.fail('puid(config) failed to produce generator')
  const expectedLen = generator!.info.length

  const id = generate(config)
  t.is(id.length, expectedLen)
})
