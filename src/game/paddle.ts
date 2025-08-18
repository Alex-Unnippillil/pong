import { clamp } from '../utils/physics'

export function movePaddle(
  y: number,
  direction: number,
  speed: number,
  dt: number,
  screenHeight: number,
  paddleHeight: number,
): number {
  let newY = y + direction * speed * dt
  const half = paddleHeight / 2
  newY = clamp(newY, half, screenHeight - half)
  return newY
}

export function aiMove(
  currentY: number,
  targetY: number,
  speed: number,
  dt: number,
  screenHeight: number,
  paddleHeight: number,
): number {
  const direction = targetY < currentY ? -1 : 1
  return movePaddle(currentY, direction, speed, dt, screenHeight, paddleHeight)
}
