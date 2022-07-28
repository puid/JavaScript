/* eslint-disable functional/prefer-readonly-type */
type ErrorMessage = string

type ErrorResult = {
  error: Error
  success?: never
}

type SuccessResult<T> = {
  error?: never
  success: T
}

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

type PuidBuffer = ArrayBuffer
type PuidBytes = Uint8Array
type PuidBits = [offset: number, bits: PuidBytes]
type PuidBitsMuncher = () => string
type PuidBitsSlicer = (puidBits: PuidBits) => number[]
type PuidEncoder = (n: number) => number

type EntropyBytes = Uint8Array
type EntropyBuffer = ArrayBuffer

type EntropyByBytes = (nBytes: number) => EntropyBytes
// eslint-disable-next-line functional/no-return-void
type EntropyByValues = (buffer: EntropyBytes) => void

type EntropySource = EntropyByBytes | EntropyByValues
type EntropyFunction = [byValues: boolean, source: EntropySource]

type PuidConfig = {
  chars?: string
  bits?: number
  total?: Total
  entropyBytes?: EntropyByBytes
  entropyValues?: EntropyByValues
  risk?: Risk
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
