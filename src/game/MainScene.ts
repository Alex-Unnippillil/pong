import Phaser from 'phaser'
import type { RealtimeChannel } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'
import { aiMove, movePaddle } from './paddle'
import { ScoreManager, Side } from './score'

export default class MainScene extends Phaser.Scene {
  private static readonly INTERPOLATION = 0.2
  private ball!: Phaser.GameObjects.Arc
  private player!: Phaser.GameObjects.Rectangle
  private opponent!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private playerScoreText!: Phaser.GameObjects.Text
  private opponentScoreText!: Phaser.GameObjects.Text
  private velocity = new Phaser.Math.Vector2(200, 200)
  private paddleSpeed = 300
  private paddleHeight = 100
  private score = new ScoreManager()
  private matchId?: string
  private channel?: RealtimeChannel
  private remotePaddleY: number | null = null
  private remoteBall: { x: number; y: number; vx: number; vy: number } | null =
    null
  private lastRemoteUpdate = 0
  private spectator = false

  constructor(matchId?: string, spectator = false) {
    super('MainScene')
    this.matchId = matchId
    this.spectator = spectator
  }

  preload() {
    // Preload assets here if needed
  }

  create() {
    const { width, height } = this.scale
    this.ball = this.add.circle(width / 2, height / 2, 10, 0xffffff)
    this.player = this.add.rectangle(
      30,
      height / 2,
      20,
      this.paddleHeight,
      0xffffff,
    )
    this.opponent = this.add.rectangle(
      width - 30,
      height / 2,
      20,
      this.paddleHeight,
      0xffffff,
    )
    this.cursors = this.input.keyboard.createCursorKeys()
    this.playerScoreText = this.add
      .text(width / 4, 20, '0', { color: '#fff', fontSize: '32px' })
      .setOrigin(0.5, 0.5)
    this.opponentScoreText = this.add
      .text((width * 3) / 4, 20, '0', { color: '#fff', fontSize: '32px' })
      .setOrigin(0.5, 0.5)

    const unsubscribeScore = this.score.onMatchEnd(async (result) => {
      this.events.emit('matchEnd', result)
      if (this.matchId) {
        try {
          const response = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              matchId: this.matchId,
              p1Score: result.playerScore,
              p2Score: result.opponentScore,
            }),
          })
          if (!response.ok) {
            console.error('Failed to submit score')
          }
        } catch (error) {
          console.error('Failed to submit score', error)
        }
      }
    })

    if (this.matchId && supabase) {
      this.channel = supabase
        .channel(`match:${this.matchId}`)
        .on('broadcast', { event: 'state' }, ({ payload }) => {
          this.remotePaddleY = payload.paddleY
          this.remoteBall = {
            x: payload.ballX,
            y: payload.ballY,
            vx: payload.velX,
            vy: payload.velY,
          }
          this.lastRemoteUpdate = Date.now()
        })
      void this.channel.subscribe()
    } else if (this.matchId && !supabase) {
      this.add
        .text(width / 2, height / 2, 'Supabase is unavailable', {
          color: '#fff',
          fontSize: '16px',
        })
        .setOrigin(0.5)
    }

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      unsubscribeScore()
      this.channel?.unsubscribe()
    })
  }

  private resetBall(direction: number) {
    const { width, height } = this.scale
    this.ball.setPosition(width / 2, height / 2)
    this.velocity.set(200 * direction, Phaser.Math.Between(-200, 200))
  }

  private handleScore(side: Side) {
    this.score.addPoint(side)
    this.playerScoreText.setText(String(this.score.playerScore))
    this.opponentScoreText.setText(String(this.score.opponentScore))
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000
    const now = Date.now()
    const hasRemote = now - this.lastRemoteUpdate < 1000

    if (this.cursors.up?.isDown) {
      this.player.y = movePaddle(
        this.player.y,
        -1,
        this.paddleSpeed,
        dt,
        this.scale.height,
        this.paddleHeight,
      )
    } else if (this.cursors.down?.isDown) {
      this.player.y = movePaddle(
        this.player.y,
        1,
        this.paddleSpeed,
        dt,
        this.scale.height,
        this.paddleHeight,
      )
    }

    if (hasRemote && this.remotePaddleY !== null) {
      this.opponent.y = Phaser.Math.Linear(
        this.opponent.y,
        this.remotePaddleY,
        MainScene.INTERPOLATION,
      )
    } else {
      this.opponent.y = aiMove(
        this.opponent.y,
        this.ball.y,
        this.paddleSpeed,
        dt,
        this.scale.height,
        this.paddleHeight,
      )
    }

    this.ball.x += this.velocity.x * dt
    this.ball.y += this.velocity.y * dt

    if (hasRemote && this.remoteBall) {
      this.ball.x = Phaser.Math.Linear(
        this.ball.x,
        this.remoteBall.x,
        MainScene.INTERPOLATION,
      )
      this.ball.y = Phaser.Math.Linear(
        this.ball.y,
        this.remoteBall.y,
        MainScene.INTERPOLATION,
      )
      this.velocity.set(this.remoteBall.vx, this.remoteBall.vy)
    }

    if (this.ball.y <= 0 || this.ball.y >= this.scale.height) {
      this.velocity.y *= -1
    }

    if (this.ball.x < 0) {
      this.handleScore('opponent')
      this.resetBall(1)
    } else if (this.ball.x > this.scale.width) {
      this.handleScore('player')
      this.resetBall(-1)
    } else {
      const ballBounds = this.ball.getBounds()
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          ballBounds,
          this.player.getBounds(),
        )
      ) {
        this.velocity.x = Math.abs(this.velocity.x)
      } else if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          ballBounds,
          this.opponent.getBounds(),
        )
      ) {
        this.velocity.x = -Math.abs(this.velocity.x)
      }
    }

    void this.channel?.send({
      type: 'broadcast',
      event: 'state',
      payload: {
        paddleY: this.player.y,
        ballX: this.ball.x,
        ballY: this.ball.y,
        velX: this.velocity.x,
        velY: this.velocity.y,
      },
    })

    if (this.spectator && this.matchId) {
      void fetch(`/api/match/${this.matchId}/spectate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paddleY: this.player.y,
          opponentY: this.opponent.y,
          ballX: this.ball.x,
          ballY: this.ball.y,
          playerScore: this.score.playerScore,
          opponentScore: this.score.opponentScore,
        }),
        keepalive: true,
      })
    }
  }
}
