import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { ChatBox } from './ChatBox'

const send = vi.fn()
const unsubscribe = vi.fn()
let handler: ((arg: { payload: { message: string } }) => void) | undefined

const channelMock = {
  on: vi.fn(
    (
      _type: string,
      _filter: unknown,
      cb: (arg: { payload: { message: string } }) => void,
    ) => {
      handler = cb
      return channelMock
    },
  ),
  subscribe: vi.fn(),
  unsubscribe,
  send,
}

vi.mock('@/lib/supabase', () => ({
  supabase: { channel: () => channelMock },
}))

describe('ChatBox', () => {
  it('sends user messages and receives broadcast', async () => {
    const { unmount } = render(<ChatBox matchId="1" />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'message' }),
    )

    await act(async () => {
      handler?.({ payload: { message: 'world' } })
    })
    expect(await screen.findByText('world')).toBeInTheDocument()

    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
