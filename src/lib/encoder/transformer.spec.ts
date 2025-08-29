import test from 'ava'

import { Chars } from '../chars'

import { decode, encode } from './transformer'

test('encode/decode AlphaNum', (t) => {
  const bytes = new Uint8Array([141, 138, 2, 168, 7, 11, 13, 0])
  const puid = encode(Chars.AlphaLower, bytes)
  t.is(puid, 'rwfafkahbmgq')
  t.deepEqual(decode(Chars.AlphaLower, puid), bytes)
})

test('encode/decode Base32', (t) => {
  const bytes = new Uint8Array([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x00, 0x22])
  const puid = encode(Chars.Base32, bytes)
  t.true(puid.startsWith('2LR6TWQZAA'))
  t.deepEqual(decode(Chars.Base32, puid), bytes)
})

test('encode/decode HexUpper', (t) => {
  const bytes = new Uint8Array([0xc7, 0xc9, 0x00, 0x2a, 0x16, 0x32])
  const puid = encode(Chars.HexUpper, bytes)
  t.is(puid, 'C7C9002A1632')
  t.deepEqual(decode(Chars.HexUpper, puid), bytes)
})

test('encode/decode Safe32', (t) => {
  const bytes = new Uint8Array([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x30])
  const puid = 'MhrRBGqL2nNB'
  t.is(encode(Chars.Safe32, bytes), puid)
  t.deepEqual(decode(Chars.Safe32, puid), bytes)
})

test('encode/decode Safe64', (t) => {
  const bytes = new Uint8Array([
    0x09, 0x25, 0x84, 0x3c, 0xbd, 0xc0, 0x89, 0xeb, 0x61, 0x75, 0x81, 0x65, 0x09, 0xb4, 0x9a, 0x54, 0x20
  ])
  const puid = 'CSWEPL3AiethdYFlCbSaVC'
  t.is(encode(Chars.Safe64, bytes), puid)
  t.deepEqual(decode(Chars.Safe64, puid), bytes)
})
