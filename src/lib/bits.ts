// MIT License
//
// Copyright (c) 2022 Knoxen
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import encoder from './encoder'
import { entropyBitsPerChar } from './entropy'

const { ceil, floor, log2, round } = Math

const bitsPerChar = (chars: string) => ceil(entropyBitsPerChar(chars))

const pow2 = (n: number): number => Math.pow(2, n)
const isPow2 = (n: number): boolean => pow2(round(log2(n))) === n
const isBitZero = (n: number, bit: number): boolean => (n & (1 << (bit - 1))) === 0

type AcceptValue = readonly [accept: boolean, shift: number]
type BitShift = readonly [number, number]
type BitShifts = readonly BitShift[]

const bitShifts = (chars: string): BitShifts => {
  const nBitsPerChar = bitsPerChar(chars)
  const baseBitShift: BitShift = [chars.length, ceil(nBitsPerChar)]

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
        if (isBitZero(chars.length, bit)) {
          const shift: BitShift = [chars.length | (pow2(bit) - 1), nBitsPerChar - bit + 1]
          return shifts.concat([shift])
        }
        return shifts
      },
      [baseBitShift]
    )
}

const entropyByBytes = (skipBytes: number, entropyBuffer: EntropyBuffer, sourceBytes: EntropyByBytes) => {
  const entropyBytes = new Uint8Array(entropyBuffer)
  const bytesLen = entropyBytes.length
  if (skipBytes === 0) {
    entropyBytes.set(sourceBytes(bytesLen))
  } else {
    entropyBytes.set(sourceBytes(bytesLen - skipBytes), skipBytes)
  }
}

const entropyByValues = (skipBytes: number, entropyBuffer: EntropyBuffer, sourceValues: EntropyByValues) => {
  if (skipBytes === 0) {
    const entropyBytes = new Uint8Array(entropyBuffer)
    sourceValues(entropyBytes)
  } else {
    const rightBytes = new Uint8Array(entropyBuffer, skipBytes)
    sourceValues(rightBytes)
  }
}

const fillEntropy = (entropyOffset: number, entropyBuffer: ArrayBuffer, entropyFunction: EntropyFunction): number => {
  const entropyBytes: PuidBytes = new Uint8Array(entropyBuffer)

  const nEntropyBytes = entropyBytes.length
  const nEntropyBits = 8 * nEntropyBytes

  const [byValues, entropySource] = entropyFunction

  if (entropyOffset === nEntropyBits) {
    // No carry
    if (byValues) {
      entropyByValues(0, entropyBuffer, entropySource as EntropyByValues)
    } else {
      entropyByBytes(0, entropyBuffer, entropySource as EntropyByBytes)
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
      entropyByValues(nUnusedBytes, entropyBuffer, entropySource as EntropyByValues)
    } else {
      entropyByBytes(nUnusedBytes, entropyBuffer, entropySource as EntropyByBytes)
    }
  }

  return entropyOffset % 8
}

const valueAt = (lOffset: number, nBits: number, puidBytes: PuidBytes): number => {
  const lByteNdx = floor(lOffset / 8)
  const lByte = puidBytes[lByteNdx]
  const lBitNum = lOffset % 8

  if (lBitNum + nBits <= 8) {
    return ((lByte << lBitNum) & 0xff) >> (8 - nBits)
  }

  const rByte = puidBytes[lByteNdx + 1]
  const rBitNum = lBitNum + nBits - 8

  const lValue = ((lByte << lBitNum) & 0xff) >> (lBitNum - rBitNum)
  const rValue = rByte >> (8 - rBitNum)

  return lValue + rValue
}

export default (puidLen: number, puidChars: string, entropyFunction: EntropyFunction): PuidBitsMuncherResult => {
  const nBitsPerChar = bitsPerChar(puidChars)
  const nBitsPerPuid = nBitsPerChar * puidLen
  const nBytesPerPuid = ceil(nBitsPerPuid / 8)

  const bufferLen = nBytesPerPuid + 1
  // eslint-disable-next-line functional/no-let
  let entropyOffset = 8 * bufferLen
  const entropyBuffer = new ArrayBuffer(bufferLen)
  const entropyBytes = new Uint8Array(entropyBuffer)

  const charsEncoder = encoder(puidChars)
  const nChars = puidChars.length
  const mapper = new Array(puidLen).fill(0).map((zero, ndx) => zero + ndx)

  if (isPow2(nChars)) {
    // When chars count is a power of 2, sliced bits always yield a valid value
    const bitsMuncher = () => {
      entropyOffset = fillEntropy(entropyOffset, entropyBuffer, entropyFunction)
      const codes = mapper.map((ndx: number) =>
        charsEncoder(valueAt(entropyOffset + ndx * nBitsPerChar, nBitsPerChar, entropyBytes))
      )
      entropyOffset += nBitsPerPuid
      return String.fromCharCode(...codes)
    }

    return { success: bitsMuncher }
  }

  const nEntropyBits = 8 * entropyBytes.length
  const puidShifts = bitShifts(puidChars)

  const acceptValue = (value: number): AcceptValue => {
    // Value is valid if it is less than the number of characters
    if (value < nChars) {
      return [true, nBitsPerChar]
    }

    // For invalid value, shift the minimal bits necessary to determine validity
    const bitShift = puidShifts.find((bs) => value < bs[0])
    const shift = bitShift && bitShift[1]
    return [false, shift || nBitsPerChar]
  }

  // When chars count not a power of 2, sliced bits may yield an invalid value
  const sliceValue = () => {
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

  const bitsMuncher = () => String.fromCharCode(...mapper.map(() => sliceValue()))

  return { success: bitsMuncher }
}

export { bitShifts }
