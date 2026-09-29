// @vitest-environment happy-dom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import MobileOnboarding, { GOALS, TermsReader, normalizedOnboardingStep } from './MobileOnboarding.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
vi.mock('../sheets.jsx', () => ({ askAddDeviceData: vi.fn() }))

let host, root
const state = (step, overrides = {}) => ({
  personalization: { displayName: '', goals: [], ...overrides },
  onboarding: { version: 3, step, complete: false, legal: step > 2 ? { termsVersion: '1.0' } : null, draft: null },
  routines: [], workouts: [], bodyweight: [], week: {}, dayPlan: {},
})
const update = vi.fn(mut => useStore.setState(({ S }) => { const next = structuredClone(S); mut(next); return { S: next } }))
const mount = (step, overrides) => {
  useStore.setState({ S: state(step, overrides), update, chooseLocalMode: vi.fn().mockResolvedValue(undefined) })
  act(() => root.render(<MobileOnboarding />))
}
const animate = element => act(() => element.dispatchEvent(new Event('animationend', { bubbles: true })))
const type = (input, value) => act(() => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
})

beforeEach(() => {
  vi.useFakeTimers()
  update.mockClear()
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
})
afterEach(() => {
  act(() => root.unmount())
  host.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('V4 startup and mobile onboarding', () => {
  it('starts automatically with the approved identity, no CTA, and no legacy 1300ms transition', () => {
    mount(1)
    expect(host.querySelector('.onboarding-splash img')?.getAttribute('src')).toBe('/brand/barbell-icon-only.svg')
    expect(host.querySelector('button')).toBeFalsy()
    act(() => vi.advanceTimersByTime(1300))
    expect(host.querySelector('.onboarding-splash')).toBeTruthy()
  })

  it('uses animation completion once to move from Splash to Welcome', () => {
    mount(1)
    const identity = host.querySelector('.splash-identity')
    animate(identity)
    expect(host.textContent).toContain('Welcome to Barbell')
    animate(identity)
    expect(useStore.getState().S.onboarding.step).toBe(2)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('cancels Splash completion when the animated screen unmounts', () => {
    mount(1)
    const identity = host.querySelector('.splash-identity')
    act(() => root.unmount())
    identity.dispatchEvent(new Event('animationend', { bubbles: true }))
    expect(useStore.getState().S.onboarding.step).toBe(1)
    root = createRoot(host)
  })

  it('provides a short completion-driven reduced-motion Splash', async () => {
    window.matchMedia.mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const cancel = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: vi.fn(() => ({ finished: Promise.resolve(), cancel })) })
    try {
      mount(1)
      const identity = host.querySelector('.splash-identity')
      expect(identity.classList.contains('reduce-motion')).toBe(true)
      await act(async () => Promise.resolve())
      expect(host.textContent).toContain('Welcome to Barbell')
    } finally {
      delete HTMLElement.prototype.animate
    }
  })

  it('renders Welcome copy and sends Get Started directly to Name', async () => {
    mount(2)
    expect(host.textContent).toContain('Welcome to Barbell')
    expect(host.textContent).toContain('Your workout. Your progress.')
    await act(async () => host.querySelector('.onboarding-actions .btn').click())
    expect(host.textContent).toContain('What’s your name?')
    expect(host.textContent).not.toContain('Date of birth')
  })

  it('opens the existing Terms and Privacy readers and keeps the reader free of a custom close control', () => {
    const openSheet = vi.fn()
    useUI.setState({ openSheet })
    mount(2)
    const links = [...host.querySelectorAll('.onboarding-actions small button')]
    act(() => links[0].click())
    act(() => links[1].click())
    expect(openSheet).toHaveBeenCalledTimes(2)
    act(() => root.render(<TermsReader close={vi.fn()} />))
    expect([...host.querySelectorAll('button')].map(button => button.textContent)).toEqual(['I Understand'])
  })

  it('shows 1 / 2 at 50%, supports Back, and validates blank and whitespace names', () => {
    mount(3)
    const progress = host.querySelector('[role="progressbar"]')
    expect(progress.getAttribute('aria-valuenow')).toBe('1')
    expect(progress.querySelector('span').style.getPropertyValue('--progress')).toBe('50%')
    const input = host.querySelector('#onboarding-name')
    const submit = host.querySelector('button[type="submit"]')
    expect(submit.disabled).toBe(true)
    type(input, '   ')
    expect(submit.disabled).toBe(true)
    act(() => host.querySelector('.onboarding-back').click())
    expect(host.textContent).toContain('Welcome to Barbell')
  })

  it('focuses the real name input after 300ms and cancels pending autofocus on unmount', () => {
    mount(3)
    const input = host.querySelector('#onboarding-name')
    act(() => vi.advanceTimersByTime(299))
    expect(document.activeElement).not.toBe(input)
    act(() => vi.advanceTimersByTime(1))
    expect(document.activeElement).toBe(input)
    const focus = vi.spyOn(input, 'focus')
    act(() => root.unmount())
    act(() => vi.advanceTimersByTime(300))
    expect(focus).not.toHaveBeenCalled()
    root = createRoot(host)
  })

  it('normalizes once, blurs, and waits 200ms before a keyboard form submission reaches Goal', () => {
    mount(3)
    const input = host.querySelector('#onboarding-name')
    type(input, '  Sunain  ')
    act(() => input.focus())
    act(() => host.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    act(() => host.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    expect(useStore.getState().S.personalization.displayName).toBe('Sunain')
    expect(document.activeElement).not.toBe(input)
    expect(host.textContent).toContain('What’s your name?')
    act(() => vi.advanceTimersByTime(199))
    expect(host.textContent).toContain('What’s your name?')
    act(() => vi.advanceTimersByTime(1))
    expect(host.textContent).toContain('What’s your goal?')
    expect(useStore.getState().S.onboarding.step).toBe(4)
  })

  it('uses the same form path for the visible Continue button and preserves the name across remount', () => {
    mount(3)
    type(host.querySelector('#onboarding-name'), '  Alex  ')
    act(() => host.querySelector('button[type="submit"]').click())
    act(() => vi.advanceTimersByTime(200))
    expect(host.textContent).toContain('What’s your goal?')
    expect(useStore.getState().S.personalization.displayName).toBe('Alex')
    act(() => root.unmount())
    root = createRoot(host)
    act(() => root.render(<MobileOnboarding />))
    act(() => host.querySelector('.onboarding-back').click())
    expect(host.querySelector('#onboarding-name').value).toBe('Alex')
  })

  it('keeps exactly one compatible selected goal and creates no plan', () => {
    mount(4)
    const buttons = [...host.querySelectorAll('[role="radio"]')]
    expect(buttons).toHaveLength(GOALS.length)
    act(() => buttons[0].click())
    act(() => buttons[3].click())
    expect(useStore.getState().S.personalization.goals).toEqual(['Muscle Gain'])
    expect(useStore.getState().S.routines).toEqual([])
    expect(host.textContent).not.toContain('/21')
  })

  it('finishes the unchanged Preparing handoff without silently creating a routine', () => {
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
