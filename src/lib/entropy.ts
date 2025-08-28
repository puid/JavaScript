const { ceil, log2, sqrt, trunc } = Math

/**
 * Shannon entropy bits necessary for `total` number of IDs with `risk` of repeat
 *
 * ### Example (es module)
 * ```js
 * import { entropyBits } from 'puid-js'
 *
 * entropyBits(100000, 1e12)
 * // => 72.08241808752197
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { entropyBits } = require('puid-js')
 *
 * entropyBits(10.0e6, 1.0e18)
 * // => 105.3016990363956
 * ```
 *
 * @param total - total potential IDs
 *        risk  - risk of repeat
 *
 * @returns entropy bits
 */
const entropyBits = (total: number, risk: number): number => {
  if (total == 0 || total == 1) return 0
  if (risk == 0 || risk == 1) return 0

  const n = log2(total) + log2(total - 1)

  return n + log2(risk) - 1
}

/**
 * Risk given entropy `bits` after `total` IDs
 *
 * This approximation is conservative and will underestimate the true risk.
 *
 * @param bits - entropy bits
 *        total - total IDs
 *
 * @returns risk of repeat
 *
 * ### Example (es module)
 * ```js
 * import { entropyRisk } from 'puid-js'
 *
 * entropyRisk(96, 1.0e7)
 * // => 1584563250285288
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { entropyRisk } = require('puid-js')
 *
 * entropyRisk(96, 1.0e7)
 * // => 1584563250285288
 * ```
 */
const entropyRisk = (bits: number, total: number): number => {
  if (total == 0 || total == 1) return 0
  if (bits <= 0) return 0

  const n = log2(total) + log2(total - 1)
  return 2 ** (bits - n + 1)
}

/**
 * Total possible IDs given entropy `bits` and repeat `risk`
 *
 * This exact inversion with flooring is conservative and will underestimate the true total.
 *
 * @param bits - entropy bits
 *        risk - risk of repeat
 *
 * @returns total possible IDs
 *
 * ### Example (es module)
 * ```js
 * import { entropyTotal } from 'puid-js'
 *
 * entropyTotal(64, 1e9)
 * // => 192077
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { entropyTotal } = require('puid-js')
 *
 * entropyTotal(64, 1e9)
 * // => 192077
 * ```
 */
const entropyTotal = (bits: number, risk: number): number => {
  if (bits <= 0) return 0
  if (risk == 0 || risk == 1) return 0

  const c = 2 ** (bits + 1) / risk
  return (1 + sqrt(1 + 4 * c)) / 2
}

/**
 * Entropy bits per character for character set
 *
 * ### Example (es module)
 * ```js
 * import { entropyBitsPerChar } from 'puid-js'
 *
 * entropyBitsPerChar('dingosky')
 * // => 3.0
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { Chars, entropyBitsPerChar } = require('puid-js')
 *
 * entropyBitsPerChar(Chars.alphaNum)
 * // => 5.954196310386875
 * ```
 *
 * @param chars - string of valid characters
 *
 * @returns entropy bits per character
 */
const entropyBitsPerChar = (chars: string): number => log2(chars.length)

/**
 * Bits necessary for a `puid` of length `len` using characters `chars`
 *
 * ### Example (es module)
 * ```js
 * import { bitsForLen } from 'puid-js'
 *
 * bitsForLen('dingosky', 14)
 * // => 42
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { Chars, bitsForLen } = require('puid-js')
 *
 * bitsForLen(Chars.safeAscii, 15)
 * // => 97
 * ```
 *
 * @param chars - string of valid characters
 *        len - length of ID
 *
 * @return bits needed to generate a string of `len` using characters `chars`
 */
const bitsForLen = (chars: string, len: number): number => trunc(len * entropyBitsPerChar(chars))

/**
 * Length necessary to have an ID of `bits` entropy using characters `chars`
 *
 * ### Example (es module)
 * ```js
 * import { lenForBits } from 'puid-js'
 *
 * lenForBits('dingosky', 42)
 * // => 14
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { Chars, lenForBits } = require('puid-js')
 *
 * lenForBits(Chars.safeAscii, 97)
 * // => 15
 * ```
 *
 * @param chars - string of valid characters
 *        bits - bits of ID
 *
 * @return len needed to generate a string of with `bits` entropy using characters `chars`
 */
const lenForBits = (chars: string, bits: number): number => ceil(bits / entropyBitsPerChar(chars))

export { bitsForLen, entropyBitsPerChar, entropyBits, entropyTotal, entropyRisk, lenForBits }
