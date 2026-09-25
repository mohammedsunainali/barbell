import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('@capacitor/filesystem', () => ({ Filesystem: { writeFile: vi.fn() }, Directory: { Data: 'DATA' }, Encoding: { UTF8: 'utf8' } }))
import { Filesystem } from '@capacitor/filesystem'
import { nativeSave } from './mobile.js'
beforeEach(() => { Filesystem.writeFile.mockReset() })
it('serializes snapshots so an older native write cannot overwrite the background flush', async () => {
  let release
  Filesystem.writeFile.mockImplementationOnce(() => new Promise(resolve => { release = resolve })).mockResolvedValueOnce({})
  const old = nativeSave({ _ts: 1 })
  await vi.waitFor(() => expect(Filesystem.writeFile).toHaveBeenCalledTimes(1))
  const state = { _ts: 2 }
  const latest = nativeSave(state)
  state._ts = 3
  expect(Filesystem.writeFile).toHaveBeenCalledTimes(1)
  release({})
  await Promise.all([old, latest])
  expect(Filesystem.writeFile.mock.calls.map(([call]) => JSON.parse(call.data)._ts)).toEqual([1, 2])
})
it('keeps saving after a failed write', async () => {
  Filesystem.writeFile.mockRejectedValueOnce(new Error('disk full')).mockResolvedValueOnce({})
  await nativeSave({ _ts: 1 })
  await nativeSave({ _ts: 2 })
  expect(Filesystem.writeFile).toHaveBeenCalledTimes(2)
})
