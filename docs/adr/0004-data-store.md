# ADR 4: Data Store Choices

## Context

We need persistent storage for users, matches, and leaderboards plus fast ephemeral storage for caching and rate limiting.

## Decision

Postgres via Prisma is used for primary data to leverage relational schema and migrations. Upstash Redis provides serverless caching and rate limiting.

## Consequences

- Requires managing Postgres migrations.
- Redis introduces eventual consistency for cached leaderboard but keeps API responses fast.
