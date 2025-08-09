# PostHog Event Plan

| Event                 | Properties         | Description                |
| --------------------- | ------------------ | -------------------------- |
| `game_start`          | `mode`             | Fired when a game begins   |
| `game_end`            | `mode`, `winner`   | Fired when a game ends     |
| `leaderboard_view`    | –                  | User views leaderboard     |
| `matchmaking_start`   | `mode`             | User initiates matchmaking |
| `matchmaking_success` | `mode`, `duration` | Matchmaking completed      |
| `settings_change`     | `setting`, `value` | User updates a setting     |
| `pwa_install`         | –                  | App installed as PWA       |
