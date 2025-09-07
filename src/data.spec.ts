import fs from 'node:fs'
import path from 'node:path'

import test, { ExecutionContext } from 'ava'

import { default as puid } from './lib/puid'
import { dataIds, dataParams, fileBytes } from './lib/util'

// Allow skipping data-driven cross-repo tests in CI or when PUID_SKIP_DATA_TESTS is set
// Also skip automatically if the cross-repo data directory is not present
const dataRoot = path.join(__dirname, '..', '..', 'data')
const skipData =
  !!process.env.PUID_SKIP_DATA_TESTS || !!process.env.CI || !!process.env.GITHUB_ACTIONS || !fs.existsSync(dataRoot)
const it = skipData ? test.skip : test

const testData = (t: ExecutionContext, dataName: string) => {
  const params = dataParams(dataName)
  const ids = dataIds(dataName)

  const { binFile, chars, total, risk } = params
  const entropyBytes = fileBytes(binFile)

  const { generator: randId } = puid({ total, risk, chars, entropyBytes })

  t.assert(!!randId)

  if (randId) ids.forEach((id) => id !== '' && t.is(id, randId()))
}

it('alphanum data', (t) => testData(t, 'alphanum'))

it('alpha_10_lower data', (t) => testData(t, 'alpha_10_lower'))

it('dingosky data', (t) => testData(t, 'dingosky'))

it('safe32 data', (t) => testData(t, 'safe32'))

it('safe_ascii data', (t) => testData(t, 'safe_ascii'))

it('unicode data', (t) => testData(t, 'unicode'))
