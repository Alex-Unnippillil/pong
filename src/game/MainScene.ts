import Phaser from 'phaser'
import { aiMove, movePaddle } from './paddle'
import { ScoreManager, Side } from './score'

export default class MainScene extends Phaser.Scene {
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

  constructor(matchId?: string) {
    super('MainScene')
    this.matchId = matchId
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

    this.score.onMatchEnd((result) => {
      this.events.emit('matchEnd', result)
      if (this.matchId) {
        fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId: this.matchId,
            p1Score: result.playerScore,
            p2Score: result.opponentScore,
          }),
        }).catch(() => {})
      }
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

    this.opponent.y = aiMove(
      this.opponent.y,
      this.ball.y,
      this.paddleSpeed,
      dt,
      this.scale.height,
      this.paddleHeight,
    )

    this.ball.x += this.velocity.x * dt
    this.ball.y += this.velocity.y * dt

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
  }
}
