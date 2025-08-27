import { EntropyByBytes, EntropyByValues, EntropyFunction, Puid, PuidConfig, PuidResult } from '../types/puid'

import muncher from './bits'
import { Chars, charsName, validChars } from './chars'
import { entropyBits, entropyBitsPerChar } from './entropy'

const round2 = (f: number): number => round(f * 100) / 100

const { ceil, round } = Math

const selectEntropyFunction = (puidConfig: PuidConfig): EntropyFunction => {
  if (puidConfig.entropyValues) return [true, puidConfig.entropyValues as EntropyByValues]
  if (puidConfig.entropyBytes) return [false, puidConfig.entropyBytes as EntropyByBytes]

  const g: any = globalThis as any
  const gv = g?.crypto?.getRandomValues as ((buf: Uint8Array) => Uint8Array) | undefined
  if (typeof gv === 'function') return [true, (buffer: Uint8Array) => { gv.call(g.crypto, buffer) }]

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
    const hasWebCrypto = typeof (globalThis as any)?.crypto?.getRandomValues === 'function'
    if (!hasWebCrypto) return { error: new Error('Web Crypto getRandomValues not available. Provide entropyValues.') }
  }

  const puidEntropyBits =
    puidConfig.total && puidConfig.risk
      ? entropyBits(puidConfig.total, puidConfig.risk)
      : puidConfig.bits || DEFAULT_ENTROPY
  const puidBitsPerChar = entropyBitsPerChar(puidChars)
  const puidLen = round(ceil(puidEntropyBits / puidBitsPerChar))
  const ere = (puidBitsPerChar * puidChars.length) / (8 * Buffer.byteLength(puidChars))

  const bitsMuncher = muncher(puidLen, puidChars, selectEntropyFunction(puidConfig))

  const puid: Puid = (): string => bitsMuncher()

  // eslint-disable-next-line functional/immutable-data
  puid.info = {
    bits: round2(puidBitsPerChar * puidLen),
    bitsPerChar: round2(puidBitsPerChar),
    chars: puidChars,
    charsName: charsName(puidChars),
    ere: round2(ere),
    length: puidLen
  }

  return { generator: puid }
}
