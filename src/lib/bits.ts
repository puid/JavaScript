import { EntropyByBytes, EntropyByValues, EntropyFunction, PuidBitsMuncher } from '../types/puid'

import { entropyBitsPerChar } from './entropy'
import puidEncoder from './puidEncoder'

const { ceil, floor, log2, round } = Math

const bitsPerChar = (chars: string) => ceil(entropyBitsPerChar(chars))

const pow2 = (n: number): number => Math.pow(2, n)
const isPow2 = (n: number): boolean => pow2(round(log2(n))) === n
const isBitZero = (n: number, bit: number): boolean => (n & (1 << (bit - 1))) === 0

type AcceptValue = readonly [accept: boolean, shift: number]
type BitShift = readonly [number, number]
type BitShifts = readonly BitShift[]

// Create array of minimum bits required to determine if a value is less than nChars
// Array elements are of the form [n, bits]: For values less than n, bits bits are required
//
// As example, the bits shifts array for the 36 AlphaNumLower characters is:
//   [36, 6], [39, 5], [47, 3], [63, 2]
//
// Each value slice uses 6 bits of entropy. In bits, 36 is 100100.
// Now suppose we slice the value 50. In bits, 50 is 110010.
//
// Only two bits are necessary to determine 100100 < 110010
//
const computeBitShifts = (chars: string): BitShifts => {
  const nBitsPerChar = bitsPerChar(chars)
  const baseValue = chars.length % 2 == 0 ? chars.length - 1 : chars.length
  const baseBitShift: BitShift = [baseValue, ceil(nBitsPerChar)]

  if (isPow2(chars.length)) return [baseBitShift]

  return new Array(nBitsPerChar)
    .fill(null)
    .reduce((acc, _n, ndx) => {
      acc.push(ndx)
      return acc
    }, [])
    .slice(2)
    .reduce(
      (shifts: BitShifts, bit: number) => {
        if (isBitZero(baseValue, bit)) {
          const bitShift: BitShift = [baseValue | (pow2(bit) - 1), nBitsPerChar - bit + 1]
          return shifts.concat([bitShift])
        }
        return shifts
      },
      [baseBitShift]
    )
}

const bitShiftsCache = new Map<string, BitShifts>()
const bitShifts = (chars: string): BitShifts => {
  const cached = bitShiftsCache.get(chars)
  if (cached) return cached
  const shifts = computeBitShifts(chars)
  bitShiftsCache.set(chars, shifts)
  return shifts
}

const entropyByBytes = (skipBytes: number, entropyBuffer: ArrayBuffer, sourceBytes: EntropyByBytes) => {
  const entropyBytes = new Uint8Array(entropyBuffer)
  const bytesLen = entropyBytes.length
  if (skipBytes === 0) {
    entropyBytes.set(sourceBytes(bytesLen))
  } else {
    entropyBytes.set(sourceBytes(bytesLen - skipBytes), skipBytes)
  }
}

const entropyByValues = (skipBytes: number, entropyBuffer: ArrayBuffer, sourceValues: EntropyByValues) => {
  if (skipBytes === 0) {
    const entropyBytes = new Uint8Array(entropyBuffer)
    sourceValues(entropyBytes)
  } else {
    const rightBytes = new Uint8Array(entropyBuffer, skipBytes)
    sourceValues(rightBytes)
  }
}

// Fill passed entropy buffer using entropy function
const fillEntropy = (entropyOffset: number, entropyBuffer: ArrayBuffer, entropyFunction: EntropyFunction): number => {
  const entropyBytes: Uint8Array = new Uint8Array(entropyBuffer)

  const nEntropyBytes = entropyBytes.length
  const nEntropyBits = 8 * nEntropyBytes

  const { byValues, source } = entropyFunction

  if (entropyOffset === nEntropyBits) {
    // No carry
    if (byValues) {
      entropyByValues(0, entropyBuffer, source)
    } else {
      entropyByBytes(0, entropyBuffer, source)
    }
  } else {
    // Handle carry
    const nUnusedBits = nEntropyBits - entropyOffset
    const nUnusedBytes = ceil(nUnusedBits / 8)

    const offsetByteNum = floor(entropyOffset / 8)

    // Move unused bytes to the left
    const unusedBytes = new Uint8Array(entropyBuffer, offsetByteNum)
    entropyBytes.set(unusedBytes)

    // Fill right bytes with new random values
    if (byValues) {
      entropyByValues(nUnusedBytes, entropyBuffer, source)
    } else {
      entropyByBytes(nUnusedBytes, entropyBuffer, source)
    }
  }

  return entropyOffset % 8
}

const valueAt = (offset: number, nBits: number, bytes: Uint8Array): number => {
  const lByteNdx = floor(offset / 8)
  const lByte = bytes[lByteNdx]!
  const lBitNum = offset % 8

  if (lBitNum + nBits <= 8) {
    return ((lByte << lBitNum) & 0xff) >> (8 - nBits)
  }

  const rByte = bytes[lByteNdx + 1]!
  const rBitNum = lBitNum + nBits - 8

  const lValue = ((lByte << lBitNum) & 0xff) >> (lBitNum - rBitNum)
  const rValue = rByte >> (8 - rBitNum)

  return lValue + rValue
}

export default (puidLen: number, puidChars: string, entropyFunction: EntropyFunction): PuidBitsMuncher => {
  const nBitsPerChar = bitsPerChar(puidChars)
  const nBitsPerPuid = nBitsPerChar * puidLen
  const nBytesPerPuid = ceil(nBitsPerPuid / 8)

  const bufferLen = nBytesPerPuid + 1

  let entropyOffset = 8 * bufferLen
  const entropyBuffer = new ArrayBuffer(bufferLen)
  const entropyBytes = new Uint8Array(entropyBuffer)

  const charsEncoder = puidEncoder(puidChars)
  const nChars = puidChars.length
  const mapper = new Array(puidLen).fill(0).map((zero, ndx) => zero + ndx)

  // When chars count is a power of 2, sliced bits always yield a valid value
  if (isPow2(nChars)) {
    return () => {
      entropyOffset = fillEntropy(entropyOffset, entropyBuffer, entropyFunction)
      const codes = new Array<number>(puidLen)
      for (let i = 0; i < puidLen; i++) {
        codes[i] = charsEncoder(valueAt(entropyOffset + i * nBitsPerChar, nBitsPerChar, entropyBytes))
      }
      entropyOffset += nBitsPerPuid
      return String.fromCharCode(...codes)
    }
  }

  // When chars count not a power of 2, sliced bits may yield an invalid value

  const nEntropyBits = 8 * entropyBytes.length
  const puidShifts = bitShifts(puidChars)

  const acceptValue = (value: number): AcceptValue => {
    // Value is valid if it is less than the number of characters
    if (value < nChars) {
      return [true, nBitsPerChar]
    }

    // For invalid value, shift the minimal bits necessary to determine validity
    const bitShift = puidShifts.find((bs) => value <= bs[0])
    const shift = bitShift && bitShift[1]
    return [false, shift || nBitsPerChar]
  }

  // Slice value from entropy bytes
  const sliceValue = () => {
    // Add more entropy bytes if necessary
    if (nEntropyBits < entropyOffset + nBitsPerChar) {
      entropyOffset = fillEntropy(entropyOffset, entropyBuffer, entropyFunction)
    }

    const slicedValue = valueAt(entropyOffset, nBitsPerChar, entropyBytes)

    const [accept, shift] = acceptValue(slicedValue)
    // Returned shift is the minimal bits necessary to determine if slice value is valid
    entropyOffset += shift

    if (accept) {
      return charsEncoder(slicedValue)
    }
    // If value not acceptable, slice another
    return sliceValue()
  }

  return () => String.fromCharCode(...mapper.map(() => sliceValue()))
}

export { bitShifts }
