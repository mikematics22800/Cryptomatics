import { describe, expect, it } from 'vitest'
import { resolvePostAuthPath } from './resolvePostAuthPath.js'

describe('resolvePostAuthPath', () => {
  it('returns / when from is missing or has no pathname', () => {
    expect(resolvePostAuthPath(null)).toBe('/')
    expect(resolvePostAuthPath({})).toBe('/')
  })

  it('maps login and register to /', () => {
    expect(resolvePostAuthPath({ pathname: '/login' })).toBe('/')
    expect(resolvePostAuthPath({ pathname: '/register' })).toBe('/')
  })

  it('preserves pathname, search, and hash', () => {
    expect(
      resolvePostAuthPath({
        pathname: '/coin/btc',
        search: '?x=1',
        hash: '#tab',
      }),
    ).toBe('/coin/btc?x=1#tab')
  })
})
