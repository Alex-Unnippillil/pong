import { z } from 'zod'

export const telemetryEventSchemas = {
  match_start: z.object({
    matchId: z.string(),
  }),
  match_end: z.object({
    matchId: z.string(),
    winnerId: z.string(),
  }),
} as const

export type TelemetryEventType = keyof typeof telemetryEventSchemas
