
import { EntropyFunction, Puid, PuidConfig, PuidResult } from '../types/puid'

import muncher from './bits'
import { byteLength } from './chars'
import { Chars, charsName, metrics, validChars } from './chars'
import { decode, encode } from './encoder/transformer'
import { entropyBits, entropyBitsPerChar, entropyRisk, entropyTotal } from './entropy'

const round2 = (f: number): number => round(f * 100) / 100

const { ceil, round } = Math

const selectEntropyFunction = (puidConfig: PuidConfig): EntropyFunction => {
  if (puidConfig.entropyValues) return { byValues: true, source: puidConfig.entropyValues }
  if (puidConfig.entropyBytes) return { byValues: false, source: puidConfig.entropyBytes }

  // Use Web Crypto API
  type CryptoLike = { getRandomValues?: (b: Uint8Array) => void }
  const cryptoObj = (globalThis as { crypto?: CryptoLike }).crypto
  const gv = cryptoObj?.getRandomValues?.bind(cryptoObj) as ((b: Uint8Array) => void) | undefined
  if (gv) return { byValues: true, source: gv }

  throw new Error('Web Crypto API not available')
}

/**
 * Create `puid` generating function
 *
 * ### Example (es module)
 * ```js
 * import Chars, puid from 'puid-js'
 *
 * const { generator: safe32Id } = puid({ total: 100000, risk: 1e12, chars: Chars.Safe32 })
 * safe32Id()
 * // => qJhBqMJd44n4Q8n
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * const { Chars, puid } = require('puid-js')
 *
 * const { generator: alphaNumId } = puid({ total: 100000, risk: 1e12, chars: Chars.AlphaNum })
 * alphaNumId()
 * // => HcR2OzLQzTNKg
 * ```
 *
 * @param config: Optional PuidConfig for configuration of ID generation
 *
 * @PuidConfig
 *   - `total`: Total number of potential (i.e. expected) IDs
 *   - `risk`: Risk of repeat in `total` IDs
 *   - `bits`: ID entropy bits
 *   - `chars`: ID characters
 *   - `entropyBytes`: EntropyByBytes function for source entropy
 *   - `entropyValues`: EntropyByValues function for source entropy
 *
 * @Notes
 *   - All config fields are optional
 *   - `total/risk` must be set together
 *   - `total/risk` and `bits` cannot both be set
 *   - `chars` must be valid (see `Chars.validChars` function)
 *   - Only one entropy source function can be set
 *   - `entropyBytes` is the form of the function `crypto.randomBytes`
 *   - `entropyValues` is the form of the function `crypto.getRandomValues`
 *   - If no entropy source set, `crypto.randomBytes` is used
 *
 * @return { generator: puid, error: Error }
 *   - `success` is a function that generates a new `puid` per call
 *   - `error` is an Error indicating the PuidConfig error
 *   - One and only one of `success` or `error` is returned
 */

export default (puidConfig: PuidConfig = {}): PuidResult => {
  const DEFAULT_ENTROPY = 128

  if (puidConfig.chars) {
    const [isValid, errorMessage] = validChars(puidConfig.chars)
    if (!isValid) return { error: new Error(errorMessage) }
  }
  const puidChars = puidConfig.chars || Chars.Safe64

  if (puidConfig.total && !puidConfig.risk) return { error: new Error('Total and risk must be specified together') }
  if (!puidConfig.total && puidConfig.risk) return { error: new Error('Total and risk must be specified together') }
  if (puidConfig.total && puidConfig.bits) return { error: new Error('Cannot specify both total/risk and bits') }

  if (puidConfig.entropyBytes && puidConfig.entropyValues) {
    return { error: new Error('Cannot specify both entropyBytes and entropyValues functions') }
  }

  const puidEntropyBits =
    puidConfig.total && puidConfig.risk
      ? entropyBits(puidConfig.total, puidConfig.risk)
      : puidConfig.bits || DEFAULT_ENTROPY
  const puidBitsPerChar = entropyBitsPerChar(puidChars)
  const puidLen = round(ceil(puidEntropyBits / puidBitsPerChar))
  const ere = (puidBitsPerChar * puidChars.length) / (8 * byteLength(puidChars))
  const ete = metrics(puidChars).ete

  const bitsMuncher = muncher(puidLen, puidChars, selectEntropyFunction(puidConfig))

  const puid: Puid = (): string => bitsMuncher()

  puid.decode = (text: string): Uint8Array => decode(puidChars, text)
  puid.encode = (bytes: Uint8Array): string => encode(puidChars, bytes)

  puid.info = Object.freeze({
    bits: round2(puidBitsPerChar * puidLen),
    bitsPerChar: round2(puidBitsPerChar),
    chars: puidChars,
    charsName: charsName(puidChars),
    ere: round2(ere),
    ete: round2(ete),
    length: puidLen
  })

  const effectiveBits = puidBitsPerChar * puidLen
  puid.risk = (total: number): number => entropyRisk(effectiveBits, total)
  puid.total = (risk: number): number => entropyTotal(effectiveBits, risk)

  return { generator: puid }
}
