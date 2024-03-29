import test, { ExecutionContext } from 'ava'

import { default as puid } from './lib/puid'
import { dataIds, dataParams, fileBytes } from './lib/util'

const testData = (t: ExecutionContext, dataName: string) => {
  const params = dataParams(dataName)
  const ids = dataIds(dataName)

  const { binFile, chars, total, risk } = params
  const entropyBytes = fileBytes(binFile)

  const { generator: randId } = puid({ total, risk, chars, entropyBytes })

  t.assert(!!randId)

  if (randId) ids.forEach((id) => id !== '' && t.is(id, randId()))
}

test('alphanum data', (t) => testData(t, 'alphanum'))

test('alpha_10_lower data', (t) => testData(t, 'alpha_10_lower'))

test('dingosky data', (t) => testData(t, 'dingosky'))

test('safe32 data', (t) => testData(t, 'safe32'))

test('safe_ascii data', (t) => testData(t, 'safe_ascii'))

test('unicode data', (t) => testData(t, 'unicode'))
