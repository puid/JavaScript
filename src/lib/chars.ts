import { ValidChars } from '../types/puid'

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
  Crockford32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
  Decimal = '0123456789',
  Hex = '0123456789abcdef',
  HexUpper = Base16,
  SafeAscii = '!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~',
  Safe32 = '2346789bdfghjmnpqrtBDFGHJLMNPQRT',
  Safe64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  Symbol = '!#$%&()*+,-./:;<=>?@[]^_{|}~',
  WordSafe32 = '23456789CFGHJMPQRVWXcfghjmpqrvwx'
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
  [Chars.Crockford32]: 'crockford32',
  [Chars.Hex]: 'hex',
  [Chars.Safe32]: 'safe32',
  [Chars.Safe64]: 'safe64',
  [Chars.SafeAscii]: 'safeAscii',
  [Chars.Symbol]: 'symbol',
  [Chars.WordSafe32]: 'wordSafe32'
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
