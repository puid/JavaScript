import test from 'ava'

import { acceptValueFor, bitShifts } from './bits'
import { Chars } from './chars'

test('chars: dingosky', (t) => t.deepEqual(bitShifts('dingosky'), [[7, 3]]))
test('chars: dîngøsky', (t) => t.deepEqual(bitShifts('dîngøsky'), [[7, 3]]))

test('chars: vowels', (t) =>
  t.deepEqual(bitShifts('aeiouAEIOU'), [
    [9, 4],
    [11, 3],
    [15, 2]
  ]))

test('Chars.Alpha', (t) =>
  t.deepEqual(bitShifts(Chars.Alpha), [
    [51, 6],
    [55, 4],
    [63, 3]
  ]))

test('Chars.AlphaLower', (t) =>
  t.deepEqual(bitShifts(Chars.AlphaLower), [
    [25, 5],
    [27, 4],
    [31, 3]
  ]))

test('Chars.AlphaNum', (t) =>
  t.deepEqual(bitShifts(Chars.AlphaNum), [
    [61, 6],
    [63, 5]
  ]))

test('Chars.AlphaNumLower', (t) =>
  t.deepEqual(bitShifts(Chars.AlphaNumLower), [
    [35, 6],
    [39, 4],
    [47, 3],
    [63, 2]
  ]))

test('Chars.Hex', (t) => t.deepEqual(bitShifts(Chars.Hex), [[15, 4]]))

test('Chars.SafeAscii', (t) =>
  t.deepEqual(bitShifts(Chars.SafeAscii), [
    [89, 7],
    [91, 6],
    [95, 5],
    [127, 2]
  ]))

test('Chars.Safe32', (t) => t.deepEqual(bitShifts(Chars.Safe32), [[31, 5]]))

test('acceptValueFor accept/reject shifts', (t) => {
  // Power-of-2 charset: always accept with full nBitsPerChar
  const acceptHex = acceptValueFor(Chars.Hex) // 16 chars, 4 bits
  let r = acceptHex(5)
  t.deepEqual(r, [true, 4])
  r = acceptHex(15)
  t.deepEqual(r, [true, 4])

  // Non-power-of-2 charset: verify reject paths choose minimal shift
  const acceptAlphaNumLower = acceptValueFor(Chars.AlphaNumLower) // 36 chars, 6 bits
  // Accept path
  let a = acceptAlphaNumLower(35)
  t.deepEqual(a, [true, 6])
  // Reject paths (see expected shifts [[35,6],[39,4],[47,3],[63,2]])
  a = acceptAlphaNumLower(36)
  t.deepEqual(a, [false, 4])
  a = acceptAlphaNumLower(40)
  t.deepEqual(a, [false, 3])
  a = acceptAlphaNumLower(63)
  t.deepEqual(a, [false, 2])
})
