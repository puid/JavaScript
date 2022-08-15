import fs from 'node:fs'
import path from 'node:path'

import { Chars } from '../lib/chars'

export type DataParams = {
  readonly binFile: string,
  readonly testName: string,
  readonly total: number,
  readonly risk: number,
  readonly chars: string,
  readonly count: number
}

const fixedBytes = (arr: readonly number[]) => staticBytes(new Uint8Array(arr))

const fileBytes = (binFile: string) => staticBytes(new Uint8Array(fs.readFileSync(binFile)))

const staticBytes = (bytes: Uint8Array) => {
    // eslint-disable-next-line functional/no-let
    let offset = 0
    return (n: number) => {
      const subBytes = bytes.subarray(offset, n + offset)
      offset += n
      return subBytes
    }
  }

const dataPath = (dataName: string, fileName: string) => 
  path.join(__dirname, '..', '..', '..', 'data', dataName, fileName)

const dataParams = (dataName: string): DataParams => {
  const paramsPath = dataPath(dataName, 'params')
  const params = fs.readFileSync(paramsPath, 'utf-8').split('\n')
  return {
    binFile: dataPath('', params[0]),
    testName: params[1],
    total: parseInt(params[2]),
    risk: parseFloat(params[3]),
    chars: charsParam(params[4]),
    count: parseInt(params[5])
  }
}

const charsParam = (param: string) => {
  const [charsType, charsDef] = param.split(':')
  if (charsType === 'custom') {
    return charsDef
  }
  switch(charsDef) {
    case 'alpha':
      return Chars.Alpha
    case 'alpha_lower':
      return Chars.AlphaLower
    case 'alpha_upper':
      return Chars.AlphaUpper
    case 'alphanum':
      return Chars.AlphaNum
    case 'alphanum_lower':
      return Chars.AlphaNumLower
    case 'alphanum_upper':
      return Chars.AlphaNumUpper
    case 'base32':
      return Chars.Base32
    case 'base32_hex':
      return Chars.Base32Hex
    case 'base32_hex_upper':
      return Chars.Base32HexUpper
    case 'hex':
      return Chars.Hex
    case 'hex_upper':
      return Chars.HexUpper
    case 'safe32':
      return Chars.Safe32
    case 'safe64':
      return Chars.Safe64
    case 'safe_ascii':
      return Chars.SafeAscii
    case 'symbol':
      return Chars.Symbol
    default:
      return 'Error'
  }
}

const dataIds = (dataName: string) => fs.readFileSync(dataPath(dataName, 'ids'), 'utf-8').split('\n')

export { dataIds, dataParams, fileBytes, fixedBytes }