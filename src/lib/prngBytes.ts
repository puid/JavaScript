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

const BYTES_USED_PER_FLOAT_64 = 6

const endian = (() => {
  const buf32 = Uint32Array.from([0xff])
  const buf8 = new Uint8Array(buf32)
  return buf8[0] === 0xff ? 'little' : 'big'
})()

const prngBytes = (): EntropyBytes => {
  const float64Buffer = new ArrayBuffer(8)
  const float64View = new DataView(float64Buffer)
  float64View.setFloat64(0, Math.random())

  if (endian === 'little') return new Uint8Array(float64Buffer, 2)

  const bytesBuffer = new Uint8Array(float64Buffer, 0, BYTES_USED_PER_FLOAT_64)
  bytesBuffer.set(new Uint8Array(float64Buffer, BYTES_USED_PER_FLOAT_64), 4)
  return bytesBuffer
}

export default (n: number): EntropyBytes => {
  const entropyBuffer = new ArrayBuffer(n)
  const chunkCount = Math.floor(n / BYTES_USED_PER_FLOAT_64)

  const entropyBytes = [...Array(chunkCount).keys()].reduce((buf, ndx) => {
    buf.set(prngBytes(), ndx * BYTES_USED_PER_FLOAT_64)
    return buf
  }, new Uint8Array(entropyBuffer))
  const tailCount = n % BYTES_USED_PER_FLOAT_64
  entropyBytes.set(prngBytes().subarray(0, tailCount), chunkCount * BYTES_USED_PER_FLOAT_64)

  return entropyBytes
}
