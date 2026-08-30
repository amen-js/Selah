import { act, renderHook } from '@testing-library/react'
import { useReducedMotionPreference } from './useReducedMotionPreference'

describe('useReducedMotionPreference', () => {
  it('acompanha a preferência de movimento do sistema', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: (_: string, callback: (event: MediaQueryListEvent) => void) => {
        listener = callback
      },
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal('matchMedia', matchMedia)

    const { result } = renderHook(() => useReducedMotionPreference())
    expect(result.current).toBe(true)

    act(() => listener?.({ matches: false } as MediaQueryListEvent))
    expect(result.current).toBe(false)

    vi.unstubAllGlobals()
  })
})
