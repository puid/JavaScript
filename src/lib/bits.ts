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
import crypto from 'crypto'

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
  .reduce((shifts: BitShifts, bit: number) => {
    if (isBitZero(chars.length, bit)) {
      const shift: BitShift = [chars.length | pow2(bit) - 1, nBitsPerChar - bit + 1]
      return shifts.concat([shift])
    }
    return shifts
  }, [baseBitShift])
}

const valueAt = (lOffset: number, nBits: number, puidBytes: PuidBytes): number => {
  const lByteNdx = floor(lOffset / 8)
  const lByte = puidBytes[lByteNdx]

  const lBitNum = lOffset % 8
  // eslint-disable-next-line functional/no-let
  let rBitNum = lBitNum + nBits

  if (rBitNum <= 8) {
    return ((lByte << lBitNum) & 0xff) >> (lBitNum + (8 - rBitNum))
  }
  rBitNum -= 8

  const rByte = puidBytes[lByteNdx + 1]

  const lValue = ((lByte << lBitNum) & 0xff) >> (lBitNum - rBitNum)
  const rValue = rByte >> (8 - rBitNum)

  return lValue + rValue
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

const fillEntropy = (entropyBits: EntropyBits, entropyFunction: EntropyFunction) => {
  const [offset, entropyBuffer] = entropyBits

  const entropyBytes: PuidBytes = new Uint8Array(entropyBuffer)

  const nEntropyBytes = entropyBytes.length
  const nEntropyBits = 8 * nEntropyBytes

  // New offset
  // eslint-disable-next-line functional/immutable-data
  entropyBits[0] = offset % 8

  const [byValues, entropySource] = entropyFunction

  if (offset === nEntropyBits) {
    // No carry
    if (byValues) {
      entropyByValues(0, entropyBuffer, entropySource as EntropyByValues)
    } else {
      entropyByBytes(0, entropyBuffer, entropySource as EntropyByBytes)
    }
  } else {
    // Handle carry
    const nUnusedBits = nEntropyBits - offset
    const nUnusedBytes = ceil(nUnusedBits / 8)

    const offsetByteNum = floor(offset / 8)

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
}

const selectEntropyFunction = (puidConfig: PuidConfig): EntropyFunction => {
  if (puidConfig.entropyValues) {
    return [true, puidConfig.entropyValues as EntropyByValues]
  } else if (puidConfig.entropyBytes) {
    return [false, puidConfig.entropyBytes as EntropyByBytes]
  } else {
    return [false, crypto.randomBytes]
    // [true, crypto.getRandomValues]
  }
}

export default (puidLen: number, puidChars: string, puidConfig: PuidConfig): PuidBitsMuncherResult => {
  if (puidConfig.entropyBytes && puidConfig.entropyValues) {
    return { error: new Error('Cannot specify both entropyBytes and entropyValues functions') }
  }

  const nBitsPerChar = bitsPerChar(puidChars)
  const nBitsPerPuid = nBitsPerChar * puidLen
  const nBytesPerPuid = ceil(nBitsPerPuid / 8)

  const bufferLen = nBytesPerPuid + 1
  const entropyBuffer = new ArrayBuffer(bufferLen)
  const entropyBits: EntropyBits = [8 * bufferLen, entropyBuffer]
  const entropyBytes = new Uint8Array(entropyBuffer)
  const entropyFunction = selectEntropyFunction(puidConfig)

  const charsEncoder = encoder(puidChars)
  const puidEncoded = (value: number) => String.fromCharCode(charsEncoder(value))

  if (isPow2(puidChars.length)) {
    // When chars count is a power of 2, sliced bits always yield a valid char
    const mapper = new Array(puidLen).fill(0).map((zero, ndx) => zero + ndx)

    const bitsMuncher = () => {
      fillEntropy(entropyBits, entropyFunction)
      const entropyOffset = entropyBits[0]
      // eslint-disable-next-line functional/immutable-data
      entropyBits[0] = entropyOffset + nBitsPerPuid
      return mapper.reduce((puid: string, ndx: number) => {
        const value = valueAt(entropyOffset + ndx * nBitsPerChar, nBitsPerChar, entropyBytes)
        return puid + puidEncoded(value)
      }, '')
    }

    return { success: bitsMuncher }
  }

  const nChars = puidChars.length
  const nEntropyBits = 8 * entropyBytes.length
  const puidShifts = bitShifts(puidChars)

  const acceptValue = (value: number): AcceptValue => {
    if (value < nChars) {
      return [true, nBitsPerChar]
    }
    const bitShift = puidShifts.find((bs) => value < bs[0])
    const shift = bitShift && bitShift[1]
    return [false, shift || nBitsPerChar]
  }

  const sliceBits = (puid: string): string => {
    if (puid.length === puidLen) {
      // End recursion
      return puid
    }

    if (nEntropyBits < entropyBits[0] + nBitsPerChar) {
      fillEntropy(entropyBits, entropyFunction)
    }

    const slicedValue = valueAt(entropyBits[0], nBitsPerChar, entropyBytes)

    const [accept, shift] = acceptValue(slicedValue)
    // eslint-disable-next-line functional/immutable-data
    entropyBits[0] += shift

    return sliceBits(accept ? puid + puidEncoded(slicedValue) : puid)
  }

  const bitsMuncher = () => sliceBits('')

  return { success: bitsMuncher }
}

export { bitShifts }
