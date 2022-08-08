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

  allChars.forEach((chars) => t.is(validChars(chars), null))
})

test('valid custom characters', (t) => t.is(validChars('dingosky'), null))

test('invalid characters', (t) => {
  t.regex(validChars('dingo sky'), /Invalid/)
  t.regex(validChars('dingo sky'), /Invalid/)
  t.regex(validChars("dingo'sky"), /Invalid/)
  t.regex(validChars('dingo\\sky'), /Invalid/)
  t.regex(validChars('dingo`sky'), /Invalid/)
  t.regex(validChars('dingo\x7Fsky'), /Invalid/)
})

test('non-unique character', (t) => t.regex(validChars('unique'), /not unique/))

test('too few custom characters', (t) => {
  t.regex(validChars(''), /at least/)
  t.regex(validChars('1'), /at least/)
})

test('too many custom characters', (t) => {
  const tooMany = new Array(257).fill('a').toString()
  t.regex(validChars(tooMany), /greater/)
})
