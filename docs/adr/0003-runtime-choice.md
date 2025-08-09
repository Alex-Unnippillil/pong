# ADR 3: Edge vs Node Runtime

## Context

Next.js API routes can run on Edge or Node runtimes.

## Decision

Edge runtime will be used for latency-sensitive matchmaking endpoints. Node runtime is retained for Prisma-powered routes that require native modules.

## Consequences

- Mixed runtimes increase complexity but provide optimal performance where needed.
