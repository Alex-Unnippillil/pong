# ADR 1: Phaser 3 vs PixiJS 8

## Context

We needed a 2D game framework for PhotonPong. Options considered were Phaser 3 and PixiJS 8.

## Decision

Phaser 3 was chosen because it provides a batteries-included game loop, physics, input handling, and sound system out of the box, reducing integration effort. PixiJS is primarily a rendering library requiring additional plugins for game mechanics.

## Consequences

- Faster initial development with less custom glue code.
- Larger bundle size than a minimal PixiJS setup, but acceptable given project scope.
