import { acceptValueFor, bitsPerChar, valueAt } from '../bits'
import puidEncoder from '../puidEncoder'

// Named export so we can add decode later
/**
 * Encode bytes into a string using the provided character set.
 *
 * ### Example (es module)
 * ```js
 * import { Chars, encode } from 'puid-js'
 *
 * const bytes = new Uint8Array([
 *   0x09, 0x25, 0x84, 0x3c, 0xbd, 0xc0, 0x89, 0xeb, 0x61, 0x75, 0x81, 0x65,
 *   0x09, 0xb4, 0x9a, 0x54, 0x20
 * ])
 * encode(Chars.Safe64, bytes)
 * // => 'CSWEPL3AiethdYFlCbSaVC'
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { Chars, encode } = require('puid-js')
 *
 * const bytes = new Uint8Array([
 *   0x09, 0x25, 0x84, 0x3c, 0xbd, 0xc0, 0x89, 0xeb, 0x61, 0x75, 0x81, 0x65,
 *   0x09, 0xb4, 0x9a, 0x54, 0x20
 * ])
 * encode(Chars.Safe64, bytes)
 * // => 'CSWEPL3AiethdYFlCbSaVC'
 * ```
 */
const encode = (chars: string, bytes: Uint8Array): string => {
  const nBitsPerChar = bitsPerChar(chars)
  const nEntropyBits = 8 * bytes.length
  if (nEntropyBits === 0) return ''

  const encoder = puidEncoder(chars)
  // Use rejection sampling path for all charsets
  const acceptValue = acceptValueFor(chars)

  let offset = 0
  const codes: number[] = []
  while (offset + nBitsPerChar <= nEntropyBits) {
    const v = valueAt(offset, nBitsPerChar, bytes)
    const [accept, shift] = acceptValue(v)
    offset += shift
    if (accept) codes.push(encoder(v))
  }
  return String.fromCharCode(...codes)
}

/**
 * Decode a string of characters back into bytes using the provided character set.
 * Pads the final partial byte with zeros if the bit-length is not a multiple of 8.
 *
 * ### Example (es module)
 * ```js
 * import { Chars, decode } from 'puid-js'
 *
 * const text = 'CSWEPL3AiethdYFlCbSaVC'
 * const bytes = decode(Chars.Safe64, text)
 * // => new Uint8Array([
 *   0x09, 0x25, 0x84, 0x3c, 0xbd, 0xc0, 0x89, 0xeb, 0x61, 0x75, 0x81, 0x65,
 *   0x09, 0xb4, 0x9a, 0x54, 0x20
 * ])
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { Chars, decode } = require('puid-js')
 *
 * const text = 'CSWEPL3AiethdYFlCbSaVC'
 * const bytes = decode(Chars.Safe64, text)
 * // => new Uint8Array([
 *   0x09, 0x25, 0x84, 0x3c, 0xbd, 0xc0, 0x89, 0xeb, 0x61, 0x75, 0x81, 0x65,
 *   0x09, 0xb4, 0x9a, 0x54, 0x20
 * ])
 * ```
 */
const decode = (chars: string, text: string): Uint8Array => {
  const nBitsPerChar = bitsPerChar(chars)
  if (text.length === 0) return new Uint8Array(0)

  // Map charCode -> value index
  const map = new Map<number, number>()
  for (let i = 0; i < chars.length; i++) {
    map.set(chars.charCodeAt(i), i)
  }

  let acc = 0
  let accBits = 0
  const out: number[] = []

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    const val = map.get(code)
    if (val === undefined) throw new Error('Invalid character for charset')

    acc = (acc << nBitsPerChar) | val
    accBits += nBitsPerChar

    while (accBits >= 8) {
      const shift = accBits - 8
      const byte = (acc >> shift) & 0xff
      out.push(byte)
      accBits -= 8
      acc = acc & ((1 << accBits) - 1)
    }
  }

  if (accBits > 0) {
    // Pad remaining bits with zeros on the right
    out.push((acc << (8 - accBits)) & 0xff)
  }

  return new Uint8Array(out)
}

export { encode, decode }
