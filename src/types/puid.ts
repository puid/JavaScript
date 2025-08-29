export type EntropyByBytes = (nBytes: number) => Uint8Array

export type EntropyByValues = (buffer: Uint8Array) => void
export type PuidConfig = {
  readonly chars?: string
  readonly bits?: number
  readonly total?: number
  readonly entropyBytes?: EntropyByBytes
  readonly entropyValues?: EntropyByValues
  readonly risk?: number
}

export type ErrorMessage = string

export type ValidChars = [boolean, ErrorMessage]

export type Total = number
export type Risk = number

export type PuidBits = [offset: number, bits: Uint8Array]
export type PuidBitsMuncher = () => string
export type PuidBitsSlicer = (puidBits: PuidBits) => number[]
export type PuidEncoder = (n: number) => number

export type EntropySource = EntropyByBytes | EntropyByValues
export type EntropyFunction = { byValues: true; source: EntropyByValues } | { byValues: false; source: EntropyByBytes }

export type PuidInfo = {
  readonly bits: number
  readonly bitsPerChar: number
  readonly chars: string
  readonly charsName: string
  readonly ere: number
  readonly length: number
}

export type Puid = {
  (): string
  encode: (bytes: Uint8Array) => string
  decode: (text: string) => Uint8Array
  info: PuidInfo
  risk: (total: number) => number
  total: (risk: number) => number
}

export type PuidError = {
  readonly error: Error
  readonly generator?: never
}

export type PuidGenerator = {
  readonly error?: never
  readonly generator: Puid
}

export type PuidResult = PuidError | PuidGenerator
