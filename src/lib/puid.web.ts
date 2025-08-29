import { EntropyFunction, Puid, PuidConfig, PuidResult } from '../types/puid'

import muncher from './bits'
import { byteLength } from './byteLength'
import { Chars, charsName, validChars } from './chars'
import { decode, encode } from './encoder/transformer'
import { entropyBits, entropyBitsPerChar, entropyRisk, entropyTotal } from './entropy'

const round2 = (f: number): number => round(f * 100) / 100

const { ceil, round } = Math

const selectEntropyFunction = (puidConfig: PuidConfig): EntropyFunction => {
  if (puidConfig.entropyValues) return { byValues: true, source: puidConfig.entropyValues }
  if (puidConfig.entropyBytes) return { byValues: false, source: puidConfig.entropyBytes }

  type CryptoLike = { getRandomValues?: (b: Uint8Array) => void }
  const cryptoObj = (globalThis as { crypto?: CryptoLike }).crypto
  const gv = cryptoObj?.getRandomValues?.bind(cryptoObj) as ((b: Uint8Array) => void) | undefined
  if (gv) return { byValues: true, source: gv }

  // No Node randomBytes fallback in web entry
  throw new Error('No entropy source available: provide entropyValues or ensure Web Crypto is available')
}

export default (puidConfig: PuidConfig = {}): PuidResult => {
  const DEFAULT_ENTROPY = 128

  // Validate chars upfront
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

  // In web build, if no entropy provided, require Web Crypto
  if (!puidConfig.entropyBytes && !puidConfig.entropyValues) {
    const hasWebCrypto =
      typeof (globalThis as { crypto?: { getRandomValues?: (b: Uint8Array) => void } }).crypto?.getRandomValues ===
      'function'
    if (!hasWebCrypto) return { error: new Error('Web Crypto getRandomValues not available. Provide entropyValues.') }
  }

  const puidEntropyBits =
    puidConfig.total && puidConfig.risk
      ? entropyBits(puidConfig.total, puidConfig.risk)
      : puidConfig.bits || DEFAULT_ENTROPY
  const puidBitsPerChar = entropyBitsPerChar(puidChars)
  const puidLen = round(ceil(puidEntropyBits / puidBitsPerChar))
  const ere = (puidBitsPerChar * puidChars.length) / (8 * byteLength(puidChars))

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
    length: puidLen
  })

  const effectiveBits = puidBitsPerChar * puidLen
  puid.risk = (total: number): number => entropyRisk(effectiveBits, total)
  puid.total = (risk: number): number => entropyTotal(effectiveBits, risk)

  return { generator: puid }
}
