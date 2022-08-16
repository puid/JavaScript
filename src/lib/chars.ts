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
  Base32 = '234567ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  Base32Hex = '0123456789abcdefghijklmnopqrstuv',
  Base32HexUpper = '0123456789ABCDEFGHIJKLMNOPQRSTUV',
  Decimal = '0123456789',
  Hex = '0123456789abcdef',
  HexUpper = '0123456789ABCDEF',
  SafeAscii = '!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
  Safe32 = '2346789bdfghjmnpqrtBDFGHJLMNPQRT',
  Safe64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  Symbol = '!#$%&()*+,-./:;<=>?@[]^_{|}~'
}

export const charsName = (chars: string): string => {
  if (chars === Chars.Alpha) return 'alpha'
  if (chars === Chars.AlphaLower) return 'alphaLower'
  if (chars === Chars.AlphaUpper) return 'alphaUpper'
  if (chars === Chars.AlphaNum) return 'alphaNum'
  if (chars === Chars.AlphaNumLower) return 'alphaNumLower'
  if (chars === Chars.AlphaNumUpper) return 'alphaNumUpper'
  if (chars === Chars.Base32) return 'base32'
  if (chars === Chars.Base32Hex) return 'base32Hex'
  if (chars === Chars.Base32HexUpper) return 'base32HexUpper'
  if (chars === Chars.Hex) return 'hex'
  if (chars === Chars.HexUpper) return 'hexUpper'
  if (chars === Chars.Safe32) return 'safe32'
  if (chars === Chars.Safe64) return 'safe64'
  if (chars === Chars.SafeAscii) return 'safeAscii'
  if (chars === Chars.Symbol) return 'symbol'
  return 'custom'
}

const validChar = (char: string): boolean => {
  const codePoint = codePointOf(char)

  if (160 < codePoint) return true

  if (char == '!') return true
  if (codePoint < codePointOf('#')) return false
  if (char == "'") return false
  if (char == '\\') return false
  if (char == '`') return false
  if (codePointOf('~') < codePoint) return false

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
 * // => [true, null]
 *
 * validChars('dingodog')
 * // => [false, 'Characters not unique']
 *
 * ### Example (commonjs)
 * ```js
 * const {validChars } = require('puid-js')
 *
 * validChars('dingosky')
 * // => [true, null]
 * ```
 * @param chars - string of characters
 *
 * @returns [valid: boolean, errMessage: string]
 */
export const validChars = (chars: string): ValidChars => {
  const maxCharCount = 256

  if (chars.length < 2) return 'Need at least 2 characters'
  if (maxCharCount < chars.length) return `Character count cannot be greater than ${maxCharCount}`

  const charMap = Array.from(chars).reduce((map, char) => {
    map.set(char, validChar(char) ? (map.get(char) === false ? true : false) : null)
    return map
  }, new Map<string, boolean | null>())

  const ok = 'ok'
  const charsCheck = Array.from(charMap.values()).reduce((acc, value) => {
    if (acc === ok) return value === true ? 'Characters not unique' : value === null ? 'Invalid character' : ok
    return acc
  }, ok)

  return charsCheck === ok ? null : charsCheck
}
