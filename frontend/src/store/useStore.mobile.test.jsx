// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('../lib/mobile.js', () => ({ MOBILE: true, initReminderSync: vi.fn(), nativeLoad: vi.fn(), nativeSave: vi.fn(), onAppActive: vi.fn(), syncReminder: vi.fn(), writeAutoBackup: vi.fn() }))
vi.mock('../lib/api.js', () => ({ api: vi.fn(), setRemoteAuth: vi.fn() }))
vi.mock('../lib/remote.js', () => ({ loadRemote: vi.fn(), chooseLocal: vi.fn(), forgetRemote: vi.fn(), connect: vi.fn() }))
vi.mock('../lib/coach-device.js', () => ({ loadCoachDevice: vi.fn(), coachDeviceSettings: () => ({ mode: 'off' }), saveCoachDevice: vi.fn() }))
import { api } from '../lib/api.js'
import { nativeLoad } from '../lib/mobile.js'
import { loadRemote, forgetRemote } from '../lib/remote.js'
import { useStore, DEF } from './useStore.js'
const user = { id: 'owner', name: 'Lifter' }
const saved = { ...DEF, _ts: 100, routines: [{ id: 'r', name: 'Push', exercises: [] }], active: { id: 'session', exercises: [] } }
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks(); localStorage.clear()
  useStore.setState({ S: structuredClone(DEF), user: null, ready: false, config: null, sync: { offline: false, pending: false, lastSynced: 0 } })
  loadRemote.mockResolvedValue({ mode: 'remote', base: 'https://gym.example', token: 'token', user })
  nativeLoad.mockResolvedValue(structuredClone(saved))
  api.mockRejectedValue(new TypeError('offline'))
})
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers() })
describe('native paired boot after WebView storage eviction', () => {
  it('restores the private mirror and active session before an offline paired boot', async () => {
    await useStore.getState().boot()
    expect(useStore.getState().S.routines).toEqual(saved.routines)
    expect(useStore.getState().S.active).toEqual(saved.active)
    expect(useStore.getState().sync).toMatchObject({ offline: true, pending: true })
    expect(localStorage.getItem('gym_dirty')).toBe('1')
    expect(useStore.getState().ready).toBe(true)
  })
  it('keeps newer WebView edits over an older mirror', async () => {
    useStore.setState({ S: { ...structuredClone(saved), _ts: 200, restSec: 120 } })
    await useStore.getState().boot()
    expect(useStore.getState().S.restSec).toBe(120)
  })
  it('drops revoked identity and returns to local mode without losing the recovered workout', async () => {
    useStore.setState({ user })
    api.mockRejectedValue(Object.assign(new Error('revoked'), { status: 401 }))
    await useStore.getState().boot()
    expect(forgetRemote).toHaveBeenCalled()
    expect(useStore.getState().user).toBeNull()
    expect(useStore.getState().isGuest()).toBe(true)
    expect(useStore.getState().S.active).toEqual(saved.active)
  })
})

it('marks edits pending before the delayed network write can run', () => {
  useStore.setState({ user, ready: true })
  useStore.getState().update(s => { s.restSec = 120 })
  expect(localStorage.getItem('gym_dirty')).toBe('1')
  expect(useStore.getState().sync.pending).toBe(true)
  expect(api).not.toHaveBeenCalled()
})

it('does not clear pending edits when an older in-flight push succeeds', async () => {
  useStore.setState({ user, ready: true })
  let resolve
  api.mockImplementationOnce(() => new Promise(r => { resolve = r }))
  useStore.getState().update(s => { s.restSec = 120 })
  const push = useStore.getState().pushState()
  useStore.getState().update(s => { s.restSec = 150 })
  resolve({ rev: 1 })
  await push
  expect(localStorage.getItem('gym_dirty')).toBe('1')
  expect(useStore.getState().sync.pending).toBe(true)
})
