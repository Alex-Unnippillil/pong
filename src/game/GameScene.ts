import Phaser from 'phaser'

export class GameScene extends Phaser.Scene {
  private playerPaddle!: Phaser.GameObjects.Rectangle
  private aiPaddle!: Phaser.GameObjects.Rectangle
  private ball!: Phaser.GameObjects.Arc
  private playerScore = 0
  private aiScore = 0
  private playerScoreText!: Phaser.GameObjects.Text
  private aiScoreText!: Phaser.GameObjects.Text
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super('GameScene')
  }

  preload() {
    // No assets to load yet
  }

  create() {
    const { width, height } = this.scale

    this.playerPaddle = this.add
      .rectangle(30, height / 2, 20, 100, 0xffffff)
      .setOrigin(0.5)
    this.aiPaddle = this.add
      .rectangle(width - 30, height / 2, 20, 100, 0xffffff)
      .setOrigin(0.5)
    this.ball = this.add.circle(width / 2, height / 2, 10, 0xffffff)

    this.physics.add.existing(this.playerPaddle, false)
    this.physics.add.existing(this.aiPaddle, false)
    this.physics.add.existing(this.ball, false)

    const playerBody = this.playerPaddle.body as Phaser.Physics.Arcade.Body
    playerBody.setImmovable(true).setCollideWorldBounds(true)

    const aiBody = this.aiPaddle.body as Phaser.Physics.Arcade.Body
    aiBody.setImmovable(true).setCollideWorldBounds(true)

    const ballBody = this.ball.body as Phaser.Physics.Arcade.Body
    ballBody.setCollideWorldBounds(true, 1, 1)
    ballBody.setBounce(1, 1)
    ballBody.setVelocity(200, 200)

    this.physics.add.collider(this.ball, this.playerPaddle)
    this.physics.add.collider(this.ball, this.aiPaddle)

    this.playerScoreText = this.add
      .text(width / 4, 20, '0', { fontSize: '32px', color: '#ffffff' })
      .setOrigin(0.5)
    this.aiScoreText = this.add
      .text((3 * width) / 4, 20, '0', { fontSize: '32px', color: '#ffffff' })
      .setOrigin(0.5)

    this.cursors =
      this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys

    this.events.emit('gameStart')
  }

  update() {
    const paddleSpeed = 300

    const playerBody = this.playerPaddle.body as Phaser.Physics.Arcade.Body
    if (this.cursors.up?.isDown) {
      playerBody.setVelocityY(-paddleSpeed)
    } else if (this.cursors.down?.isDown) {
      playerBody.setVelocityY(paddleSpeed)
    } else {
      playerBody.setVelocityY(0)
    }

    const aiBody = this.aiPaddle.body as Phaser.Physics.Arcade.Body
    const tolerance = 10
    if (this.ball.y < this.aiPaddle.y - tolerance) {
      aiBody.setVelocityY(-paddleSpeed)
    } else if (this.ball.y > this.aiPaddle.y + tolerance) {
      aiBody.setVelocityY(paddleSpeed)
    } else {
      aiBody.setVelocityY(0)
    }

    const ballBody = this.ball.body as Phaser.Physics.Arcade.Body
    const { width } = this.scale
    if (ballBody.x <= 0) {
      this.aiScore += 1
      this.aiScoreText.setText(String(this.aiScore))
      this.resetBall()
    } else if (ballBody.x >= width) {
      this.playerScore += 1
      this.playerScoreText.setText(String(this.playerScore))
      this.resetBall()
    }
  }

  private resetBall() {
    const { width, height } = this.scale
    this.ball.setPosition(width / 2, height / 2)
    const ballBody = this.ball.body as Phaser.Physics.Arcade.Body
    ballBody.setVelocity(
      Phaser.Math.Between(-200, 200),
      Phaser.Math.Between(-150, 150),
    )

    const winningScore = 5
    if (this.playerScore >= winningScore) {
      this.events.emit('gameEnd', { winner: 'player' })
      this.scene.pause()
    } else if (this.aiScore >= winningScore) {
      this.events.emit('gameEnd', { winner: 'ai' })
      this.scene.pause()
    }
  }
}
