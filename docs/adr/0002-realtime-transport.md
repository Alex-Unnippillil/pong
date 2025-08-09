# ADR 2: Realtime Transport

## Context

PhotonPong requires realtime multiplayer state sync. Options: Supabase Realtime vs Pusher Channels.

## Decision

Supabase Realtime selected to stay within the Supabase ecosystem and leverage Postgres-based change feeds without additional vendor lock-in.

## Consequences

- Simplified auth and presence via Supabase.
- Requires WebSocket support; not available on some restrictive networks.
