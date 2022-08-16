const BYTES_USED_PER_FLOAT_64 = 6

const endian = (() => {
  const buf32 = Uint32Array.from([0xff])
  const buf8 = new Uint8Array(buf32)
  return buf8[0] === 0xff ? 'little' : 'big'
})()

const prngBytes = (): Uint8Array => {
  const float64Buffer = new ArrayBuffer(8)
  const float64View = new DataView(float64Buffer)
  float64View.setFloat64(0, Math.random())

  if (endian === 'little') return new Uint8Array(float64Buffer, 2)

  const bytesBuffer = new Uint8Array(float64Buffer, 0, BYTES_USED_PER_FLOAT_64)
  bytesBuffer.set(new Uint8Array(float64Buffer, BYTES_USED_PER_FLOAT_64), 4)
  return bytesBuffer
}

export default (n: number): Uint8Array => {
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
