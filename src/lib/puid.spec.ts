import test, { ExecutionContext } from 'ava'

import { Puid, PuidConfig } from '../types/puid'

import { Chars } from './chars'
import prngBytes from './prngBytes'
import puid from './puid'
import { fixedBytes } from './util'

const assertMessage = (t: ExecutionContext, error: Error | undefined, regex: RegExp) => {
  t.assert(!!error)
  if (error) t.regex(error.message, regex)
}

test('puid with invalid chars', (t) => {
  const { error: notUnique } = puid({ chars: 'dingosky-dog' })
  assertMessage(t, notUnique, /not unique/)

  const { error: invalid } = puid({ chars: 'dingo sky' })
  assertMessage(t, invalid, /Invalid/)
})

test('puid invalid total/risk pair', (t) => {
  const { error: onlyTotal } = puid({ total: 1000 })
  assertMessage(t, onlyTotal, /specified together/)

  const { error: onlyRisk } = puid({ risk: 1000 })
  assertMessage(t, onlyRisk, /specified together/)
})

test('puid with both entropyBytes and entropyValues config', (t) => {
  const randomValues = (_: Uint8Array) => {
    _
  }
  const { error: whoops } = puid({ entropyBytes: prngBytes, entropyValues: randomValues })
  assertMessage(t, whoops, /specify both/)
})

test('puid total/risk and bits', (t) => {
  const { error: notBoth } = puid({ total: 1000, risk: 10000, bits: 12 })
  assertMessage(t, notBoth, /Cannot specify both/)
})

const puidGenerator = (config?: PuidConfig): Puid => {
  const { generator } = puid(config)
  if (generator) return generator

  const cxError = () => 'CxError'
   
  cxError.info = {
    bits: -1,
    bitsPerChar: -1,
    chars: 'CxError',
    charsName: 'CxError',
    ere: -1,
    length: -1
  }
  return cxError
}

test('puid default', (t) => {
  const randId = puidGenerator()

  const info = randId.info
  t.truthy(info)

  const { bits, bitsPerChar, chars, charsName, ere, length } = info

  t.is(bits, 132)
  t.is(bitsPerChar, 6)
  t.is(chars, Chars.Safe64)
  t.is(charsName, 'safe64')
  t.is(ere, 0.75)
  t.is(length, 22)
  t.is(randId().length, length)
})

test('puid total/risk', (t) => {
  const alphaId = puidGenerator({ total: 10000, risk: 1e12, chars: Chars.Alpha })

  const info = alphaId.info
  t.truthy(info)

  const { bits, bitsPerChar, charsName, ere, length } = info
  t.is(bits, 68.41)
  t.is(bitsPerChar, 5.7)
  t.is(charsName, 'alpha')
  t.is(ere, 0.71)
  t.is(length, 12)
})

const charsOption = (chars: string, bits: number, t: ExecutionContext) => {
  const randId = puidGenerator({ chars: chars })

  const { bits: puidBits, chars: puidChars } = randId.info
  t.is(puidBits, bits)
  t.is(puidChars, chars)
}

test('Chars bits', (t) => {
  charsOption(Chars.Safe32, 130, t)
  charsOption(Chars.AlphaNum, 130.99, t)
  charsOption('dingosky', 129, t)
})

test('puid bits', (t) => {
  const randId = puidGenerator({ bits: 64 })
  t.is(randId.info.bits, 66)
})

test('Chars count power of 2 with no carry', (t) => {
  const hexBytes = fixedBytes([0x99, 0xb4, 0x4f, 0x80, 0xc8, 0x89])
  const hexId = puidGenerator({ bits: 24, chars: Chars.Hex, entropyBytes: hexBytes })

  t.is(hexId.info.charsName, 'hex')

  t.is(hexId(), '99b44f')
  t.is(hexId(), '80c889')
})

test('3-bit custom dingosky', (t) => {
  const dingoskyBytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0xbd, 0x72])
  const dingoskyId = puidGenerator({ bits: 24, chars: 'dingosky', entropyBytes: dingoskyBytes })

  t.is(dingoskyId.info.charsName, 'custom')

  t.is(dingoskyId(), 'kiyooodd')
  t.is(dingoskyId(), 'insgkskn')
})

test('2-bit custom DNA', (t) => {
  const dnaBytes = fixedBytes([203, 219, 82, 162])
  const dnaId = puidGenerator({ bits: 16, chars: 'ATCG', entropyBytes: dnaBytes })

  t.is(dnaId(), 'GACGGTCG')
  t.is(dnaId(), 'TTACCCAC')
})

test('1-bit custom TF', (t) => {
  const tfBytes = fixedBytes([0b11111011, 0b00000100, 0b00101100, 0b10110011])
  const tfId = puidGenerator({ bits: 16, chars: 'FT', entropyBytes: tfBytes })

  t.is(tfId(), 'TTTTTFTTFFFFFTFF')
  t.is(tfId(), 'FFTFTTFFTFTTFFTT')
})

test('Hex chars (count power of 2 with carry)', (t) => {
  //    C    7    C    9    0    0    2    A    B    D    7    2
  // 1100 0111 1100 1001 0000 0000 0010 1010 1011 1101 0111 0010
  //
  const hexBytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0xbd])
  const hexUpperId = puidGenerator({ bits: 12, chars: Chars.HexUpper, entropyBytes: hexBytes })

  t.is(hexUpperId(), 'C7C')
  t.is(hexUpperId(), '900')
  t.is(hexUpperId(), '2AB')
})

test('dingosky chars (count power of 2 with carry)', (t) => {
  //    C    7    C    9    0    0    2    A    B    D    7    2
  // 1100 0111 1100 1001 0000 0000 0010 1010 1011 1101 0111 0010
  //
  //  110 001 111 100 100 100 000 000 001 010 101 011 110 101 110 010
  //  |-| |-| |-| |-| |-| |-| |-| |-| |-| |-| |-| |-| |-| |-| |-| |-|
  //   k   i   y   o   o   o   d   d   i   n   s   g   k   s   k   n
  //
  const dingoskyBytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0xbd, 0x72])
  const dingoskyId = puidGenerator({ bits: 9, chars: 'dingosky', entropyBytes: dingoskyBytes })

  t.is(dingoskyId(), 'kiy')
  t.is(dingoskyId(), 'ooo')
  t.is(dingoskyId(), 'ddi')
  t.is(dingoskyId(), 'nsg')
  t.is(dingoskyId(), 'ksk')
})

test('dîngøsky chars (count power of 2 with carry)', (t) => {
  const dingoskyUtf8Bytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0xbd, 0x72])
  const dingoskyUtf8Id = puidGenerator({ bits: 9, chars: 'dîngøsky', entropyBytes: dingoskyUtf8Bytes })
  t.is(dingoskyUtf8Id(), 'kîy')
  t.is(dingoskyUtf8Id(), 'øøø')
  t.is(dingoskyUtf8Id(), 'ddî')
  t.is(dingoskyUtf8Id(), 'nsg')
  t.is(dingoskyUtf8Id(), 'ksk')
})

test('dîngøsky:￦ chars', (t) => {
  const unicodeBytes = fixedBytes([
    0xec, 0xf9, 0xdb, 0x7a, 0x33, 0x3d, 0x21, 0x97, 0xa0, 0xc2, 0xbf, 0x92, 0x80, 0xdd, 0x2f, 0x57, 0x12, 0xc1, 0x1a,
    0xef
  ])
  const unicodeId = puidGenerator({ bits: 24, chars: 'dîngøsky:￦', entropyBytes: unicodeBytes })

  t.is(unicodeId(), '￦gî￦￦nî￦')
  t.is(unicodeId(), 'ydkîsnsd')
  t.is(unicodeId(), 'îøsîndøk')
})

test('Safe32 (count non-power of 2 with carry)', (t) => {
  //    D    2    E    3    E    9    D    A    1    9    0    3    B    7    3    C
  // 1101 0010 1110 0011 1110 1001 1101 1010 0001 1001 0000 0011 1011 0111 0011 1100
  //
  // 11010 01011 10001 11110 10011 10110 10000 11001 00000 01110 11011 10011 1100
  // |---| |---| |---| |---| |---| |---| |---| |---| |---| |---| |---| |---|
  //   26    11    17    30    19    22    16    25     0    14    27    19
  //    M     h     r     R     B     G     q     L     2     n     N     B
  //
  const safe32Bytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const safe32Id = puidGenerator({ bits: 20, chars: Chars.Safe32, entropyBytes: safe32Bytes })
  t.is(safe32Id(), 'MhrR')
  t.is(safe32Id(), 'BGqL')
  t.is(safe32Id(), '2nNB')
})

test('puid safe32', (t) => {
  const valuesBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const entropyValues = (buf: Uint8Array) => buf.set(valuesBytes(buf.length))

  const valuesId = puidGenerator({ bits: 20, chars: Chars.Safe32, entropyValues })
  t.is(valuesId(), 'MhrR')
  t.is(valuesId(), 'BGqL')
  t.is(valuesId(), '2nNB')
})

test('AlphaLower chars, (26 chars, 5+ bits)', (t) => {
  const alphaLowerBytes = fixedBytes([0xf1, 0xb1, 0x78, 0x0b, 0xaa, 0x28])
  const alphaLowerId = puidGenerator({ bits: 14, chars: Chars.AlphaLower, entropyBytes: alphaLowerBytes })

  // shifts: [(25, 5), (27, 4), (31, 3)]
  //
  //    F    1    B    1    7    8    0    B    A    A
  // 1111 0001 1011 0001 0111 1000 0000 1011 1010 1010
  //
  // 111 10001 10110 00101 111 00000 00101 1101 01010
  // xxx |---| |---| |---| xxx |---| |---| xxxx |---|
  //  30   17    22     5   30    0     5    26   10
  //        r     w     f         a     f          k

  t.is(alphaLowerId(), 'rwf')
  t.is(alphaLowerId(), 'afk')
})

test('AlphaNum chars (62 chars, 6 bits)', (t) => {
  const alphaNumBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xfa, 0x19, 0x00])
  const alphaNumId = puidGenerator({ bits: 17, chars: Chars.AlphaNum, entropyBytes: alphaNumBytes })

  // shifts: [{61, 6}, {63, 5}]
  //
  //    D    2    E    3    E    9    F    A    1    9    0    0
  // 1101 0010 1110 0011 1110 1001 1111 1010 0001 1001 0000 0000
  //
  // 110100 101110 001111 101001 11111 010000 110010 000000 0
  // |----| |----| |----| |----| xxxxx |----| |----| |----|
  //   52     46     15     41     62     16     50      0
  //    0      u      P      p             Q      y      A
  //

  t.is(alphaNumId(), '0uP')
  t.is(alphaNumId(), 'pQy')
})

test('puid from AlphaNumLower', (t) => {
  const alphaNumLowerBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xfa, 0x19, 0x00, 0xc8, 0x2d])
  const alphaNumLowerId = puidGenerator({ bits: 12, chars: Chars.AlphaNumLower, entropyBytes: alphaNumLowerBytes })

  const { bits, bitsPerChar, chars, charsName, ere, length } = alphaNumLowerId.info
  t.is(bits, 15.51)
  t.is(bitsPerChar, 5.17)
  t.is(chars, Chars.AlphaNumLower)
  t.is(charsName, 'alphaNumLower')
  t.is(ere, 0.65)
  t.is(length, 3)

  t.is(alphaNumLowerId(), 's9p')
  t.is(alphaNumLowerId(), 'qib')
})

test('puid from AlphaNumUpper', (t) => {
  const alphaNumUpperBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xfa, 0x19, 0x00, 0xc8, 0x2d])
  const alphaNumUpperId = puidGenerator({ bits: 26, chars: Chars.AlphaNumUpper, entropyBytes: alphaNumUpperBytes })

  const { bits, bitsPerChar, chars, charsName, ere, length } = alphaNumUpperId.info
  t.is(bits, 31.02)
  t.is(bitsPerChar, 5.17)
  t.is(chars, Chars.AlphaNumUpper)
  t.is(charsName, 'alphaNumUpper')
  t.is(ere, 0.65)
  t.is(length, 6)

  t.is(alphaNumUpperId(), 'S9PQIB')
})

test('puid from AlphaUpper', (t) => {
  const alphaUpperBytes = fixedBytes([0xf1, 0xb1, 0x78, 0x0a, 0xc3, 0x28])
  const alphaUpperId = puidGenerator({ bits: 14, chars: Chars.AlphaUpper, entropyBytes: alphaUpperBytes })

  const { bits, bitsPerChar, chars, charsName, ere, length } = alphaUpperId.info
  t.is(bits, 14.1)
  t.is(bitsPerChar, 4.7)
  t.is(chars, Chars.AlphaUpper)
  t.is(charsName, 'alphaUpper')
  t.is(ere, 0.59)
  t.is(length, 3)

  t.is(alphaUpperId(), 'RWF')
  t.is(alphaUpperId(), 'AFM')
})

test('puid from Base16', (t) => {
  const base16Bytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0x16, 0x32])
  const base16Id = puidGenerator({
    bits: 12,
    chars: Chars.Base16,
    entropyBytes: base16Bytes
  })

  t.is(base16Id(), 'C7C')
  t.is(base16Id(), '900')
  t.is(base16Id(), '2A1')
  t.is(base16Id(), '632')
})

test('puid from Base32 chars (32 chars, 5 bits)', (t) => {
  const base32Bytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x00, 0x22])
  const base32Id = puidGenerator({ bits: 46, chars: Chars.Base32, entropyBytes: base32Bytes })

  t.is(base32Id(), '2LR6TWQZAA')
})

test('puid from Base32Hex chars (32 chars, 5 bits)', (t) => {
  const base32HexBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const base32HexId = puidGenerator({ bits: 30, chars: Chars.Base32Hex, entropyBytes: base32HexBytes })

  t.is(base32HexId(), 'qbhujm')
  t.is(base32HexId(), 'gp0erj')
})

test('puid from Base32HexUpper chars (32 chars, 5 bits)', (t) => {
  const base32HexUpperBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const base32HexUpperId = puidGenerator({
    bits: 14,
    chars: Chars.Base32HexUpper,
    entropyBytes: base32HexUpperBytes
  })

  t.is(base32HexUpperId(), 'QBH')
  t.is(base32HexUpperId(), 'UJM')
  t.is(base32HexUpperId(), 'GP0')
  t.is(base32HexUpperId(), 'ERJ')
})

test('puid Crockford32', (t) => {
  const valuesBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const entropyValues = (buf: Uint8Array) => buf.set(valuesBytes(buf.length))

  const valuesId = puidGenerator({ bits: 20, chars: Chars.Crockford32, entropyValues })
  t.is(valuesId(), 'TBHY')
  t.is(valuesId(), 'KPGS')
  t.is(valuesId(), '0EVK')
})

test('puid from Decimal (10 chars)', (t) => {
  const decimalBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c, 0xff])
  const decimalId = puidGenerator({ bits: 16, chars: Chars.Decimal, entropyBytes: decimalBytes })

  // shifts: [(9, 4), (11, 3), (15, 2)]
  //
  //    D    2    E    3    E    9    D    A    1    9    0    3    B    7    3    C    F    F
  // 1101 0010 1110 0011 1110 1001 1101 1010 0001 1001 0000 0011 1011 0111 0011 1100 1111 1111
  //
  // 11 0100 101 11 0001 11 11 0100 11 101 101 0000 11 0010 0000 0111 0110 11 1001 11 1001 111 1111
  // xx |--| xxx xx |--| xx xx |--| xx xxx xxx |--| xx |--| |--| |--| |--| xx |--| xx |--|
  // 13   4   11 12   1  15 13   4  14  11  10   0  12   2    0    7    6  14   9  14   9
  //      4           1          4               0       2    0    7    6       9       9

  t.is(decimalId(), '41402')
  t.is(decimalId(), '07699')
})

test('puid from Hex', (t) => {
  const hexBytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a])
  const hexId = puidGenerator({
    bits: 8,
    chars: Chars.Hex,
    entropyBytes: hexBytes
  })

  t.is(hexId(), 'c7')
  t.is(hexId(), 'c9')
  t.is(hexId(), '00')
  t.is(hexId(), '2a')
})

test('puid from HexUpper', (t) => {
  const hexUpperBytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0x16, 0x32])
  const hexUpperId = puidGenerator({
    bits: 12,
    chars: Chars.HexUpper,
    entropyBytes: hexUpperBytes
  })

  t.is(hexUpperId(), 'C7C')
  t.is(hexUpperId(), '900')
  t.is(hexUpperId(), '2A1')
  t.is(hexUpperId(), '632')
})

test('puid from SafeAscii', (t) => {
  const safeAsciiBytes = fixedBytes([0xa6, 0x33, 0x2a, 0xbe, 0xe6, 0x2d, 0xb3, 0x68, 0x41])
  const safeAsciiId = puidGenerator({ bits: 18, chars: Chars.SafeAscii, entropyBytes: safeAsciiBytes })

  // shifts: [(89, 7), (91, 6), (95, 5), (127, 2)]
  //
  //    A    6    3    3   2    A    B    E    E    6    2    D    B    3    6    8
  // 1010 0110 0011 0011 0010 1010 1011 1110 1110 0110 0010 1101 1011 0011 0110 1000 0100 0001
  //
  // 1010011 0001100  11 0010010 0101111 10111 0011000 101101 1011001 101101 0000100 0001
  // |-----| |-----|  xx |-----| |-----| xxxxx |-----| xxxxxx |-----| xxxxxx |-----|
  //    83      12   101    21      47     92     24      91     89      90      4
  //     x       /           8       R             ;              ~              &

  const { bits, bitsPerChar, chars, charsName, ere, length } = safeAsciiId.info
  t.is(bits, 19.48)
  t.is(bitsPerChar, 6.49)
  t.is(chars, Chars.SafeAscii)
  t.is(charsName, 'safeAscii')
  t.is(ere, 0.81)
  t.is(length, 3)

  t.is(safeAsciiId(), 'x/8')
  t.is(safeAsciiId(), 'R;~')
})

test('puid from Safe32', (t) => {
  const safe32Bytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const safe32Id = puidGenerator({
    bits: 21,
    chars: Chars.Safe32,
    entropyBytes: safe32Bytes
  })

  //    D    2    E    3    E    9    D    A    1    9    0    3    B    7    3    C
  // 1101 0010 1110 0011 1110 1001 1101 1010 0001 1001 0000 0011 1011 0111 0011 1100
  //
  // 11010 01011 10001 11110 10011 10110 10000 11001 00000 01110 11011 10011 1100
  // |---| |---| |---| |---| |---| |---| |---| |---| |---| |---| |---| |---|
  //   26    11    17    30    19    22    16    25     0    14    27    19
  //   M     h     r     R     B     G     q     L     2     n     N     B

  t.is(safe32Id(), 'MhrRB')
  t.is(safe32Id(), 'GqL2n')
})

test('puid from Safe64', (t) => {
  const safe64Bytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xfa, 0x19, 0x00])
  const safe64Id = puidGenerator({
    bits: 48,
    chars: Chars.Safe64,
    entropyBytes: safe64Bytes
  })

  t.is(safe64Id(), '0uPp-hkA')
})

test('puid from Symbol', (t) => {
  const symbolId = puidGenerator({ bits: 59, chars: Chars.Symbol })

  const { bits, bitsPerChar, chars, charsName, ere, length } = symbolId.info
  t.is(bits, 62.5)
  t.is(bitsPerChar, 4.81)
  t.is(chars, Chars.Symbol)
  t.is(charsName, 'symbol')
  t.is(ere, 0.6)
  t.is(length, 13)
  t.is(symbolId().length, length)
})

test('puid WordSafe32', (t) => {
  const valuesBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const entropyValues = (buf: Uint8Array) => buf.set(valuesBytes(buf.length))

  const valuesId = puidGenerator({ bits: 20, chars: Chars.WordSafe32, entropyValues })
  t.is(valuesId(), 'pHVw')
  t.is(valuesId(), 'XgRm')
  t.is(valuesId(), '2PqX')
})

test('Vowels (10 chars, 4 bits)', (t) => {
  const vowelBytes = fixedBytes([0xa6, 0x33, 0xf6, 0x9e, 0xbd, 0xee, 0xa7])
  //
  // shifts: [(9, 4), (11, 3), (15, 2)]
  //
  //    A    6    3    3    F    6    9    E    B    D    E    E    A    7
  // 1010 0110 0011 0011 1111 0110 1001 1110 1011 1101 1110 1110 1010 0111
  //
  // 101 0011 0001 1001 11 11 101 101 0011 11 0101 11 101 11 101 11 0101 0011 1
  // xxx |--| |--| |--| xx xx xxx xxx |--| xx |--| xx xxx xx xxx xx |--| |--|
  //  10   3    1    9  15 14  11  10   3  13   5  14  11 14  11 13   5    3
  //       o    e    U                  o       A                     A    o

  const vowelId = puidGenerator({ bits: 20, chars: 'aeiouAEIOU', entropyBytes: vowelBytes })
  t.is(vowelId(), 'oeUoAAo')
})

test('256 characters', (t) => {
  const singleByte = Chars.Safe64

  const doubleStart = 0x0100
  const doubleByte = String.fromCodePoint(...new Array(128).fill(doubleStart).map((start, ndx) => start + ndx))

  const tripleStart = 0x4dc0
  const tripleByte = String.fromCodePoint(...new Array(64).fill(tripleStart).map((start, ndx) => start + ndx))

  const c256Id = puidGenerator({ chars: singleByte + doubleByte + tripleByte })

  t.is(c256Id.info.length, c256Id().length)
  t.is(c256Id.info.bitsPerChar, 8)
  t.is(c256Id.info.ere, 0.5)
})
