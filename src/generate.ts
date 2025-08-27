import puid from './lib/puid'
import type { PuidConfig } from './types/puid'

export default function generate(config: PuidConfig = {}): string {
  const res = puid(config)
  if ('error' in res) throw res.error
  return res.generator()
}
