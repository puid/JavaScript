/* eslint-disable functional/prefer-readonly-type */
type ErrorMessage = string

type PuidError = {
  error: Error
  generator?: never
}

type PuidGenerator = {
  error?: never
  generator: Puid
}

type PuidResult = PuidError | PuidGenerator

type ValidChars = ErrorMessage | null

type Total = number
type Risk = number

type PuidBits = [offset: number, bits: Uint8Array]
type PuidBitsMuncher = () => string
type PuidBitsSlicer = (puidBits: PuidBits) => number[]
type PuidEncoder = (n: number) => number

type EntropyByBytes = (nBytes: number) => Uint8Array
// eslint-disable-next-line functional/no-return-void
type EntropyByValues = (buffer: Uint8Array) => void

type EntropySource = EntropyByBytes | EntropyByValues
type EntropyFunction = [byValues: boolean, source: EntropySource]

type PuidConfig = {
  chars?: string
  bits?: number
  total?: number
  entropyBytes?: EntropyByBytes
  entropyValues?: EntropyByValues
  risk?: number
}

type PuidInfo = {
  bits: number
  bitsPerChar: number
  chars: string
  charsName: string
  ere: number
  length: number
}

// eslint-disable-next-line functional/no-mixed-type
type Puid = {
  (): string
  info: Readonly<PuidInfo>
}
