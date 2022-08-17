import test from 'ava'

import { Chars, validChars } from './chars'

test('pre-defined Chars', (t) => {
  const allChars = [
    Chars.Alpha,
    Chars.AlphaLower,
    Chars.AlphaNum,
    Chars.AlphaNumLower,
    Chars.AlphaNumUpper,
    Chars.AlphaUpper,
    Chars.Base32,
    Chars.Base32Hex,
    Chars.Base32HexUpper,
    Chars.Decimal,
    Chars.Hex,
    Chars.HexUpper,
    Chars.SafeAscii,
    Chars.Safe32,
    Chars.Safe64
  ]

  allChars.forEach((chars) => t.is(validChars(chars)[0], true))
})

const invalidChars = (chars: string) => validChars(chars)[1]

test('valid custom characters', (t) => t.is(validChars('dingosky')[0], true))

test('invalid characters', (t) => {
  t.regex(invalidChars('dingo sky'), /Invalid/)
  t.regex(invalidChars('dingo sky'), /Invalid/)
  t.regex(invalidChars("dingo'sky"), /Invalid/)
  t.regex(invalidChars('dingo\\sky'), /Invalid/)
  t.regex(invalidChars('dingo`sky'), /Invalid/)
  t.regex(invalidChars('dingo\x7Fsky'), /Invalid/)
})

test('non-unique character', (t) => t.regex(invalidChars('unique'), /not unique/))

test('too few custom characters', (t) => {
  t.regex(invalidChars(''), /at least/)
  t.regex(invalidChars('1'), /at least/)
})

test('too many custom characters', (t) => {
  const tooMany = new Array(257).fill('a').toString()
  t.regex(invalidChars(tooMany), /greater/)
})
