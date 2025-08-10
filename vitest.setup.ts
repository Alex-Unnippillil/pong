import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next-auth/providers/email', () => ({ default: () => ({}) }))
vi.mock('next-auth/providers/github', () => ({ default: () => ({}) }))
vi.mock('next-auth/providers/google', () => ({ default: () => ({}) }))
