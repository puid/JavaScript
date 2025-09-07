import { ValidChars } from '../types/puid'

import { bitShifts, isPow2 } from './bits'
import { entropyBitsPerChar } from './entropy'

export const byteLength = (s: string): number => {
  const TE = (globalThis as any).TextEncoder as { new (): { encode: (s: string) => Uint8Array } } | undefined
  if (!TE) throw new Error('No byte-length implementation available')
  return new TE().encode(s).length
}

const { ceil, log2, pow } = Math

/**
 * Pre-defined character sets
 */
export enum Chars {
  Alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  AlphaLower = 'abcdefghijklmnopqrstuvwxyz',
  AlphaUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  AlphaNum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  AlphaNumLower = 'abcdefghijklmnopqrstuvwxyz0123456789',
  AlphaNumUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  Base16 = '0123456789ABCDEF',
  Base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  Base32Hex = '0123456789abcdefghijklmnopqrstuv',
  Base32HexUpper = '0123456789ABCDEFGHIJKLMNOPQRSTUV',
  Base36 = '0123456789abcdefghijklmnopqrstuvwxyz',
  Base36Upper = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  Base45 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:',
  Base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  Base85 = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu',
  Bech32 = '023456789acdefghjklmnpqrstuvwxyz',
  Boolean = 'TF',
  Crockford32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
  Decimal = '0123456789',
  Dna = 'ACGT',
  Geohash = '0123456789bcdefghjkmnpqrstuvwxyz',
  Hex = '0123456789abcdef',
  HexUpper = Base16,
  SafeAscii = '!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
  Safe32 = '2346789bdfghjmnpqrtBDFGHJLMNPQRT',
  Safe64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  Symbol = '!#$%&()*+,-./:;<=>?@[]^_{|}~',
  UrlSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~',
  WordSafe32 = '23456789CFGHJMPQRVWXcfghjmpqrvwx',
  ZBase32 = 'ybndrfg8ejkmcpqxot1uwisza345h769',
}

const CHARS_NAME_MAP: Record<string, string> = {
  [Chars.Alpha]: 'alpha',
  [Chars.AlphaLower]: 'alphaLower',
  [Chars.AlphaUpper]: 'alphaUpper',
  [Chars.AlphaNum]: 'alphaNum',
  [Chars.AlphaNumLower]: 'alphaNumLower',
  [Chars.AlphaNumUpper]: 'alphaNumUpper',
  [Chars.Base16]: 'base16',
  [Chars.Base32]: 'base32',
  [Chars.Base32Hex]: 'base32Hex',
  [Chars.Base32HexUpper]: 'base32HexUpper',
  [Chars.Base36]: 'base36',
  [Chars.Base36Upper]: 'base36Upper',
  [Chars.Base45]: 'base45',
  [Chars.Base58]: 'base58',
  [Chars.Base85]: 'base85',
  [Chars.Bech32]: 'bech32',
  [Chars.Boolean]: 'boolean',
  [Chars.Crockford32]: 'crockford32',
  [Chars.Dna]: 'dna',
  [Chars.Geohash]: 'geohash',
  [Chars.Hex]: 'hex',
  [Chars.Safe32]: 'safe32',
  [Chars.Safe64]: 'safe64',
  [Chars.SafeAscii]: 'safeAscii',
  [Chars.Symbol]: 'symbol',
  [Chars.UrlSafe]: 'urlSafe',
  [Chars.WordSafe32]: 'wordSafe32',
  [Chars.ZBase32]: 'zBase32',
}

export const charsName = (chars: string): string => CHARS_NAME_MAP[chars] ?? 'custom'

const validChar = (char: string): boolean => {
  if (char.codePointAt(1)) return false

  const codePointNonBreakSpace = 160
  const codePoint = codePointOf(char)

  if (codePoint < codePointOf('!')) return false
  if (char == '"') return false
  if (char == "'") return false
  if (char == '\\') return false
  if (char == '`') return false
  if (codePoint <= codePointOf('~')) return true
  if (codePoint < codePointNonBreakSpace) return false

  return true
}

const codePointOf = (char: string): number => char.codePointAt(0) as number

/**
 * Validates a string of characters.
 *
 * Valid character strings must:
 *   - Contain at least 2 characters
 *   - Contain a most 256 characters
 *   - Not contain a non-printable ascii character
 *   - Not contain any repeat characters
 *
 * ### Example (es module)
 * ```js
 * import { validChars } from 'puid-js'
 *
 * validChars('dingosky')
 * // => [true, '']
 *
 * validChars('dingodog')
 * // => [false, 'Characters not unique']
 *
 * ### Example (commonjs)
 * ```js
 * const {validChars } = require('puid-js')
 *
 * validChars('dingosky')
 * // => [true, '']
 * ```
 * @param chars - string of characters
 *
 * @returns [valid: boolean, errMessage: string]
 */
export const validChars = (chars: string): ValidChars => {
  const maxCharCount = 256

  // Pre-defined charsets are trusted
  if (CHARS_NAME_MAP[chars]) return [true, '']

  if (chars.length < 2) return [false, 'Need at least 2 characters']
  if (maxCharCount < chars.length) return [false, `Character count cannot be greater than ${maxCharCount}`]

  const charMap = Array.from(chars).reduce((map, char) => {
    map.set(char, validChar(char) ? (map.get(char) === false ? true : false) : null)
    return map
  }, new Map<string, boolean | null>())

  const ok = 'ok'
  const charsCheck = Array.from(charMap.values()).reduce((acc, value) => {
    if (acc === ok) return value === true ? 'Characters not unique' : value === null ? 'Invalid character' : ok
    return acc
  }, ok)

  return charsCheck === ok ? [true, ''] : [false, charsCheck]
}

/**
 * Metrics for a character set including entropy transform efficiency
 */
export interface CharMetrics {
  /** Average bits consumed per character */
  avgBits: number
  /** Bit shift rules used for character generation */
  bitShifts: ReadonlyArray<readonly [number, number]>
  /** Entropy representation efficiency (0 < ERE ≤ 1.0) */
  ere: number
  /** Entropy transform efficiency (0 < ETE ≤ 1.0) */
  ete: number
}

/**
 * Calculate the total bits consumed when rejecting values
 * @param charsetSize - Number of characters in the set
 * @param totalValues - Total possible values for the bit width (2^bitsPerChar)
 * @param shifts - Bit shift rules
 * @returns Total bits consumed on reject
 */
const bitsConsumedOnReject = (
  charsetSize: number,
  totalValues: number,
  shifts: ReadonlyArray<readonly [number, number]>
): number => {
  let sum = 0
  for (let value = charsetSize; value < totalValues; value++) {
    const bitShift = shifts.find((bs) => value <= bs[0])
    if (!bitShift) throw new Error('Invalid bitShifts: missing range')
    sum += bitShift[1]
  }
  return sum
}

/**
 * Calculate average byte size per character for a string
 * @param chars - Character string
 * @returns Average bytes per character
 */
const avgBytesPerChar = (chars: string): number => {
  const encoder = new TextEncoder()
  const totalBytes = encoder.encode(chars).length
  return totalBytes / chars.length
}

/**
 * Calculate entropy metrics for a character set.
 *
 * Returns a metrics object with the following properties:
 * - `avgBits`: Average bits consumed per character during generation
 * - `bitShifts`: Bit shift rules used for character generation
 * - `ere`: Entropy representation efficiency (0 < ERE ≤ 1.0), measures how efficiently
 *   the characters represent entropy in their string form
 * - `ete`: Entropy transform efficiency (0 < ETE ≤ 1.0), measures how efficiently
 *   random bits are transformed into characters during generation
 *
 * ### Example (es module)
 * ```js
 * import { metrics, Chars } from 'puid-js'
 *
 * metrics(Chars.Safe64)
 * // => {
 * //   avgBits: 6.0,
 * //   bitShifts: [[63, 6]],
 * //   ere: 0.75,
 * //   ete: 1.0
 * // }
 *
 * metrics(Chars.Alpha)
 * // => {
 * //   avgBits: 6.769230769230769,
 * //   bitShifts: [[51, 6], [55, 4], [63, 3]],
 * //   ere: 0.7125549647676365,
 * //   ete: 0.8421104129072068
 * // }
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { metrics, Chars } = require('puid-js')
 *
 * metrics(Chars.AlphaNum)
 * // => {
 * //   avgBits: 6.646793002915452,
 * //   bitShifts: [[61, 6], [63, 5]],
 * //   ere: 0.7440244996982898,
 * //   ete: 0.8957009989667183
 * // }
 * ```
 *
 * @param chars - string of valid characters
 * @returns Metrics object containing efficiency measurements
 */
export const metrics = (chars: string): CharMetrics => {
  const charsetSize = chars.length
  const bitsPerChar = ceil(entropyBitsPerChar(chars))
  const theoreticalBits = log2(charsetSize)
  const shifts = bitShifts(chars)

  // Calculate ERE (Entropy Representation Efficiency)
  // This measures how efficiently characters represent entropy in string form
  const avgRepBitsPerChar = avgBytesPerChar(chars) * 8
  const ere = theoreticalBits / avgRepBitsPerChar

  if (isPow2(charsetSize)) {
    // Power-of-2 charsets have perfect efficiency
    return {
      avgBits: bitsPerChar,
      bitShifts: shifts,
      ere,
      ete: 1.0
    }
  }

  // For non-power-of-2 charsets, calculate ETE
  const totalValues = pow(2, bitsPerChar)
  const probAccept = charsetSize / totalValues
  const probReject = 1 - probAccept

  const rejectCount = totalValues - charsetSize
  const rejectBits = bitsConsumedOnReject(charsetSize, totalValues, shifts)

  const avgBitsOnReject = rejectBits / rejectCount
  const avgBits = bitsPerChar + (probReject / probAccept) * avgBitsOnReject

  const ete = theoreticalBits / avgBits

  return {
    avgBits,
    bitShifts: shifts,
    ere,
    ete
  }
}
