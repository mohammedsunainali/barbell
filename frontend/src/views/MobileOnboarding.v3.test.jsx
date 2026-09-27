// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../store/useStore.js'
import MobileOnboarding, { GOALS, normalizedOnboardingStep } from './MobileOnboarding.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
vi.mock('../sheets.jsx', () => ({ askAddDeviceData: vi.fn() }))

let host, root
const state = (step, overrides = {}) => ({
  personalization: { displayName: '', goals: [], ...overrides },
  onboarding: { version: 3, step, complete: false, legal: step > 2 ? { termsVersion: '1.0' } : null, draft: null },
  routines: [], workouts: [], bodyweight: [], week: {}, dayPlan: {},
})
const mount = step => {
  useStore.setState({ S: state(step), update: mut => useStore.setState(({ S }) => { const next = structuredClone(S); mut(next); return { S: next } }) })
  act(() => root.render(<MobileOnboarding />))
}
beforeEach(() => { vi.useFakeTimers(); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers() })

describe('V3 mobile onboarding', () => {
  it('starts with an automatic splash and no CTA', () => {
    mount(1)
    expect(host.querySelector('.onboarding-splash')).toBeTruthy()
    expect(host.querySelector('button')).toBeFalsy()
    act(() => vi.advanceTimersByTime(1300))
    expect(host.textContent).toContain('Welcome to Barbell')
  })

  it('requires a trimmed name and uses 1 / 2 progress', () => {
    mount(3)
    expect(host.textContent).toContain('1 / 2')
    expect(host.querySelector('button[type="submit"]').disabled).toBe(true)
    act(() => useStore.setState(({ S }) => ({ S: { ...S, personalization: { ...S.personalization, displayName: '  Sunain  ' } } })))
    act(() => host.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    expect(useStore.getState().S.personalization.displayName).toBe('Sunain')
    expect(host.textContent).toContain('What’s your goal?')
  })

  it('keeps exactly one compatible selected goal and creates no plan', () => {
    mount(4)
    const buttons = [...host.querySelectorAll('[role="radio"]')]
    expect(buttons).toHaveLength(GOALS.length)
    act(() => buttons[0].click()); act(() => buttons[3].click())
    expect(useStore.getState().S.personalization.goals).toEqual(['Muscle Gain'])
    expect(useStore.getState().S.routines).toEqual([])
    expect(host.textContent).not.toContain('/21')
  })

  it('finishes the Preparing handoff without silently creating a routine', () => {
    mount(5)
    expect(host.textContent).toContain('Analyzing your goal...')
    for (let i = 0; i < 5; i += 1) act(() => vi.runOnlyPendingTimers())
    expect(useStore.getState().S.onboarding).toMatchObject({ version: 3, step: 5, complete: true, draft: null })
    expect(useStore.getState().S.routines).toEqual([])
    expect(useStore.getState().needsMobileOnboarding).toBe(false)
  })

  it('migrates an incomplete V2 flow into the lightweight inputs', () => {
    expect(normalizedOnboardingStep({ version: 2, step: 12, legal: { termsVersion: '1.0' } })).toBe(4)
    expect(normalizedOnboardingStep({ version: 2, step: 3, legal: { termsVersion: '1.0' } })).toBe(3)
  })
})
