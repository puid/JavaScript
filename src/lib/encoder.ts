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

import { Chars } from './chars'
import alphaEncoder from './encoder/alpha'
import alphaCaseEncoder from './encoder/alphaCase'
import alphaNumEncoder from './encoder/alphaNum'
import base32Encoder from './encoder/base32'
import base32HexCaseEncoder from './encoder/base32HexCase'
import hexCaseEncoder from './encoder/hexCase'
import safe32Encoder from './encoder/safe32'
import safe64Encoder from './encoder/safe64'
import safeAsciiEncoder from './encoder/safeAscii'

export const customCharsEncoder = (chars: string): PuidEncoder => {
  const charCodes = chars.split('').map((c) => c.charCodeAt(0))
  return (n: number) => charCodes[n]
}

export default (chars: string): PuidEncoder => {
  if (chars === Chars.Alpha) return alphaEncoder()
  if (chars === Chars.AlphaLower) return alphaCaseEncoder()
  if (chars === Chars.AlphaUpper) return alphaCaseEncoder(true)
  if (chars === Chars.AlphaNum) return alphaNumEncoder()
  if (chars === Chars.Base32) return base32Encoder()
  if (chars === Chars.Base32Hex) return base32HexCaseEncoder()
  if (chars === Chars.Base32HexUpper) return base32HexCaseEncoder(true)
  if (chars === Chars.Hex) return hexCaseEncoder()
  if (chars === Chars.HexUpper) return hexCaseEncoder(true)
  if (chars === Chars.Safe32) return safe32Encoder()
  if (chars === Chars.Safe64) return safe64Encoder()
  if (chars === Chars.SafeAscii) return safeAsciiEncoder()

  return customCharsEncoder(chars)
}
