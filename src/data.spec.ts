import test, { ExecutionContext } from 'ava'

import { default as puid } from './lib/puid'
import { dataIds, dataParams, fileBytes } from './lib/util'
import type { DataParams } from './lib/util'

const puidMod = (params: DataParams) => {
  const { binFile, chars, total, risk } = params
  const entropyBytes = fileBytes(binFile)

  const { generator: randId } = puid({ total, risk, chars, entropyBytes })    
  return randId
}

const testData = (t: ExecutionContext, dataName: string) => {
  const params = dataParams(dataName)
  const alphanumId = puidMod(params)

  const ids = dataIds(dataName)
  ids.forEach(id => id !== '' && t.is(id, alphanumId()))
 }

test('alphanum data', (t) => testData(t, 'alphanum'))

test('alpha_10_lower data', (t) => testData(t, 'alpha_10_lower'))
