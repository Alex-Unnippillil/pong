import React from 'react'
import { render } from '@testing-library/react'
import { GameCanvas } from './GameCanvas'
import Phaser from 'phaser'

vi.mock('phaser', () => ({
  default: { AUTO: 'AUTO', Game: vi.fn(() => ({ destroy: vi.fn() })) },
}))

test('renders and initializes Phaser', () => {
  render(<GameCanvas />)
  expect((Phaser as any).Game).toHaveBeenCalled()
})
