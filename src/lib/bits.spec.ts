import test from 'ava'

import { bitShifts } from './bits'
import { Chars } from './chars'

test('chars: dingosky', (t) => t.deepEqual(bitShifts('dingosky'), [[8, 3]]))

test('Chars.Hex', (t) => t.deepEqual(bitShifts(Chars.Hex), [[16, 4]]))

test('Chars.Safe32', (t) => t.deepEqual(bitShifts(Chars.Safe32), [[32, 5]]))

test('Chars.AlphaNum', (t) => t.deepEqual(bitShifts(Chars.AlphaNum), [[62, 6]]))

test('Chars.Alpha', (t) =>
  t.deepEqual(bitShifts(Chars.Alpha), [
    [ 52, 6 ],
    [ 55, 5 ],
    [ 63, 3 ]
   ]))

test('Chars.AlphaLower', (t) =>
  t.deepEqual(bitShifts(Chars.AlphaLower), [
    [26, 5],
    [31, 3]
  ]))

test('Chars.AlphaNumLower', (t) =>
  t.deepEqual(bitShifts(Chars.AlphaNumLower), [
    [36, 6],
    [39, 5],
    [47, 3],
    [63, 2]
  ]))

test('Chars.SafeAscii', (t) =>
  t.deepEqual(bitShifts(Chars.SafeAscii), [
    [90, 7],
    [95, 5],
    [127, 2]
  ]))
