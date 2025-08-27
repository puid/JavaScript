export const byteLength = (s: string): number => {
  const B: any = (globalThis as any)?.Buffer
  if (B && typeof B.byteLength === 'function') return B.byteLength(s)
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length
  // Fallback: UTF-16 code units length; acceptable as a last resort for ere
  return s.length
}
