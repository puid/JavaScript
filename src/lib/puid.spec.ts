import test from 'ava'

import { Chars } from './chars'
import prngBytes from './prngBytes'
import puid from './puid'
import { fixedBytes } from './util'

test('puid with invalid chars', (t) => {
  const { error: notUnique } = puid({ chars: 'dingosky-dog' })
  t.regex(notUnique.message, /not unique/)

  const { error: invalid } = puid({ chars: 'dingo sky' })
  t.regex(invalid.message, /Invalid/)
})

test('puid invalid total/risk pair', (t) => {
  const { error: onlyTotal } = puid({ total: 1000 })
  t.regex(onlyTotal.message, /specified together/)

  const { error: onlyRisk } = puid({ risk: 1000 })
  t.regex(onlyRisk.message, /specified together/)
})

test('puid with both entropyBytes and entropyValues config', (t) => {
  const randomValues = (_: EntropyBytes) => { _ }
  const { error: whoops } = puid({ entropyBytes: prngBytes, entropyValues: randomValues })
  t.regex(whoops.message, /specify both/)
})

test('puid total/risk and bits', (t) => {
  const { error: notBoth } = puid({ total: 1000, risk: 10000, bits: 12 })
  t.regex(notBoth.message, /Cannot specify both/)
})

test('puid default', (t) => {
  const { generator: randId } = puid()

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
  const { generator: alphaId } = puid({ total: 10000, risk: 1e12, chars: Chars.Alpha })

  const info = alphaId.info
  t.truthy(info)

  const { bits, bitsPerChar, charsName, ere, length } = info
  t.is(bits, 68.41)
  t.is(bitsPerChar, 5.7)
  t.is(charsName, 'alpha')
  t.is(ere, 0.71)
  t.is(length, 12)
})

const charsOption = (desc: string, chars: string, bits: number) => {
  test(desc, (t) => {
    const { generator: randId } = puid({ chars: chars })

    const { bits: puidBits, chars: puidChars } = randId.info
    t.is(puidBits, bits)
    t.is(puidChars, chars)
  })
}

charsOption('Safe32', Chars.Safe32, 130)
charsOption('AlphaNum', Chars.AlphaNum, 130.99)
charsOption('dingosky', 'dingosky', 129)

test('puid bits', (t) => {
  const { generator: randId } = puid({ bits: 64 })
  t.is(randId.info.bits, 66)
})

test('Chars count power of 2 with no carry', (t) => {
  const hexBytes = fixedBytes([0x99, 0xb4, 0x4f, 0x80, 0xc8, 0x89])
  const { generator: hexId } = puid({ bits: 24, chars: Chars.Hex, entropyBytes: hexBytes })

  t.is(hexId.info.charsName, 'hex')

  t.is(hexId(), '99b44f')
  t.is(hexId(), '80c889')
})

test('3-bit custom dingosky', (t) => {
  const dingoskyBytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0xbd, 0x72])
  const { generator: dingoskyId } = puid({ bits: 24, chars: 'dingosky', entropyBytes: dingoskyBytes })

  t.is(dingoskyId.info.charsName, 'custom')

  t.is(dingoskyId(), 'kiyooodd')
  t.is(dingoskyId(), 'insgkskn')
})

test('2-bit custom DNA', (t) => {
  const dnaBytes = fixedBytes([203, 219, 82, 162])
  const { generator: dnaId } = puid({ bits: 16, chars: 'ATCG', entropyBytes: dnaBytes })

  t.is(dnaId(), 'GACGGTCG')
  t.is(dnaId(), 'TTACCCAC')
})

test('1-bit custom TF', (t) => {
  const tfBytes = fixedBytes([0b11111011, 0b00000100, 0b00101100, 0b10110011])
  const { generator: tfId } = puid({ bits: 16, chars: 'FT', entropyBytes: tfBytes })

  t.is(tfId(), 'TTTTTFTTFFFFFTFF')
  t.is(tfId(), 'FFTFTTFFTFTTFFTT')
})

test('Hex chars (count power of 2 with carry)', (t) => {
  //    C    7    C    9    0    0    2    A    B    D    7    2
  // 1100 0111 1100 1001 0000 0000 0010 1010 1011 1101 0111 0010
  //
  const hexBytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0xbd])
  const { generator: hexUpperId } = puid({ bits: 12, chars: Chars.HexUpper, entropyBytes: hexBytes })
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
  const { generator: dingoskyId } = puid({ bits: 9, chars: 'dingosky', entropyBytes: dingoskyBytes })
  t.is(dingoskyId(), 'kiy')
  t.is(dingoskyId(), 'ooo')
  t.is(dingoskyId(), 'ddi')
  t.is(dingoskyId(), 'nsg')
  t.is(dingoskyId(), 'ksk')
})

test('dîngøsky chars (count power of 2 with carry)', (t) => {
  const dingoskyUtf8Bytes = fixedBytes([0xc7, 0xc9, 0x00, 0x2a, 0xbd, 0x72])
  const { generator: dingoskyUtf8Id } = puid({ bits: 9, chars: 'dîngøsky', entropyBytes: dingoskyUtf8Bytes })
  t.is(dingoskyUtf8Id(), 'kîy')
  t.is(dingoskyUtf8Id(), 'øøø')
  t.is(dingoskyUtf8Id(), 'ddî')
  t.is(dingoskyUtf8Id(), 'nsg')
  t.is(dingoskyUtf8Id(), 'ksk')
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
  const { generator: safe32Id } = puid({ bits: 20, chars: Chars.Safe32, entropyBytes: safe32Bytes })
  t.is(safe32Id(), 'MhrR')
  t.is(safe32Id(), 'BGqL')
  t.is(safe32Id(), '2nNB')
})

test('puid safe32 entropyValues', (t) => {
  const valuesBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x03, 0xb7, 0x3c])
  const entropyValues = (buf: EntropyBytes) => buf.set(valuesBytes(buf.length))

  const { generator: valuesId } = puid({ bits: 20, chars: Chars.Safe32, entropyValues })
  t.is(valuesId(), 'MhrR')
  t.is(valuesId(), 'BGqL')
  t.is(valuesId(), '2nNB')
})

test('AlphaLower chars (26 chars, 5+ bits', (t) => {
  // shifts: [ [ 26, 5 ], [ 31, 3 ] ]
  //
  //    5    3    c    8    8    d    e    6    3    e    2    6    a    0
  // 0101 0011 1100 1000 1000 1101 1110 0110 0011 1110 0010 0110 1010 0000
  //
  // 01010 01111 00100 01000 110 111 10011 00011 111 00010 01101 01000 00
  // |---| |---| |---| |---| xxx xxx |---| |---| xxx |---| |---| |---|
  //   10    15     4     8   27  30   19     3   28    2    13     8
  //    k     p     e     i             t     d         c     n     i
  //
  const alphaLowerBytes = fixedBytes([0x53, 0xc8, 0x8d, 0xe6, 0x3e, 0x26, 0xa0])
  const { generator: alphaLowerId } = puid({ bits: 14, chars: Chars.AlphaLower, entropyBytes: alphaLowerBytes })
  t.is(alphaLowerId(), 'kpe')
  t.is(alphaLowerId(), 'itd')
  t.is(alphaLowerId(), 'cni')
})

test('AlphaNum chars (62 chars, 6 bits)', (t) => {
  //
  // shifts: [ [62, 6] ]
  //
  //    D    2    E    3    E    9    F    A    1    9    0    0
  // 1101 0010 1110 0011 1110 1001 1111 1010 0001 1001 0000 0000
  //
  // 110100 101110 001111 101001 111110 100001 100100 000000
  // |----| |----| |----| |----| xxxxxx |----| |----| |----|
  //   52     46     15     41     62     33     36      0
  //    0      u      P      p             h      k      A
  //
  const alphaNumBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xfa, 0x19, 0x00])
  const { generator: alphaNumId } = puid({ bits: 17, chars: Chars.AlphaNum, entropyBytes: alphaNumBytes })
  t.is(alphaNumId(), '0uP')
  t.is(alphaNumId(), 'phk')
})

test('Base32 chars (32 chars, 5 bits', (t) => {
  const base32Bytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x12, 0xce])
  const { generator: base32Id } = puid({ bits: 25, chars: Chars.Base32, entropyBytes: base32Bytes })
  t.is(base32Id(), 'UFLYN')
  t.is(base32Id(), 'QKT4F')
})

test('Base32Hex chars (32 chars, 5 bits)', (t) => {
  const base32HexBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x12, 0xce, 0x28])
  const { generator: base32HexId } = puid({ bits: 30, chars: Chars.Base32Hex, entropyBytes: base32HexBytes })
  t.is(base32HexId(), 'qbhujm')
  t.is(base32HexId(), 'gp2b72')
})

test('Base32HexUpper chars (32 chars, 5 bits)', (t) => {
  const base32HexUpperBytes = fixedBytes([0xd2, 0xe3, 0xe9, 0xda, 0x19, 0x12, 0xce, 0x28])
  const { generator: base32HexUpperId } = puid({
    bits: 20,
    chars: Chars.Base32HexUpper,
    entropyBytes: base32HexUpperBytes
  })
  t.is(base32HexUpperId(), 'QBHU')
  t.is(base32HexUpperId(), 'JMGP')
  t.is(base32HexUpperId(), '2B72')
})

test('puid from Chars.AlphaNumLower', (t) => {
  const { generator: alphaNumLowerId } = puid({ bits: 35, chars: Chars.AlphaNumLower })

  const { bits, bitsPerChar, chars, charsName, ere, length } = alphaNumLowerId.info
  t.is(bits, 36.19)
  t.is(bitsPerChar, 5.17)
  t.is(chars, Chars.AlphaNumLower)
  t.is(charsName, 'alphaNumLower')
  t.is(ere, 0.65)
  t.is(length, 7)
  t.is(alphaNumLowerId().length, length)
})

test('puid from Chars.AlphaNumUpper', (t) => {
  const { generator: alphaNumUpperId } = puid({ bits: 52, chars: Chars.AlphaNumUpper })

  const { bits, bitsPerChar, chars, charsName, ere, length } = alphaNumUpperId.info
  t.is(bits, 56.87)
  t.is(bitsPerChar, 5.17)
  t.is(chars, Chars.AlphaNumUpper)
  t.is(charsName, 'alphaNumUpper')
  t.is(ere, 0.65)
  t.is(length, 11)
  t.is(alphaNumUpperId().length, length)
})

test('puid from Chars.AlphaUpper', (t) => {
  const { generator: alphaUpperId } = puid({ bits: 48, chars: Chars.AlphaUpper })

  const { bits, bitsPerChar, chars, charsName, ere, length } = alphaUpperId.info
  t.is(bits, 51.7)
  t.is(bitsPerChar, 4.7)
  t.is(chars, Chars.AlphaUpper)
  t.is(charsName, 'alphaUpper')
  t.is(ere, 0.59)
  t.is(length, 11)
  t.is(alphaUpperId().length, length)
})

test('puid from Chars.SafeAscii', (t) => {
  const { generator: safeAsciiId } = puid({ bits: 52, chars: Chars.SafeAscii })

  const { bits, bitsPerChar, chars, charsName, ere, length } = safeAsciiId.info
  t.is(bits, 58.43)
  t.is(bitsPerChar, 6.49)
  t.is(chars, Chars.SafeAscii)
  t.is(charsName, 'safeAscii')
  t.is(ere, 0.81)
  t.is(length, 9)
  t.is(safeAsciiId().length, length)
})

test('puid from Chars.Symbol', (t) => {
  const { generator: symbolId } = puid({ bits: 59, chars: Chars.Symbol })

  const { bits, bitsPerChar, chars, charsName, ere, length } = symbolId.info
  t.is(bits, 62.5)
  t.is(bitsPerChar, 4.81)
  t.is(chars, Chars.Symbol)
  t.is(charsName, 'symbol')
  t.is(ere, 0.6)
  t.is(length, 13)
  t.is(symbolId().length, length)
})

test('256 characters', (t) => {
  const singleByte = Chars.Safe64

  const doubleStart = 0x0100
  const doubleByte = String.fromCodePoint(...new Array(128).fill(doubleStart).map((start, ndx) => start + ndx))

  const tripleStart = 0x4dc0
  const tripleByte = String.fromCodePoint(...new Array(64).fill(tripleStart).map((start, ndx) => start + ndx))

  const { generator: c256Id } = puid({ chars: singleByte + doubleByte + tripleByte })
  t.is(c256Id.info.length, c256Id().length)
  t.is(c256Id.info.bitsPerChar, 8)
  t.is(c256Id.info.ere, 0.5)
})
