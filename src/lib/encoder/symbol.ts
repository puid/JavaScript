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

export default (): PuidEncoder => {
  const s1 = '!'.charCodeAt(0)
  const s2 = '#'.charCodeAt(0) - 1
  const s3 = '('.charCodeAt(0) - 5
  const s4 = ':'.charCodeAt(0) - 13
  const s5 = '['.charCodeAt(0)
  const s6 = ']'.charCodeAt(0) - 21
  const s7 = '{'.charCodeAt(0) - 24

  return (n: number) => {
    if (n === 0) return s1
    if (n < 5) return n + s2
    if (n < 13) return n + s3
    if (n < 20) return n + s4
    if (n === 20) return s5
    if (n < 24) return n + s6
    return n + s7
  }
}
