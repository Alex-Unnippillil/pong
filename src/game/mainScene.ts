import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private ball!: Phaser.Physics.Arcade.Image
  private leftPaddle!: Phaser.Physics.Arcade.Image
  private rightPaddle!: Phaser.Physics.Arcade.Image
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: { W: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key }
  private leftScore = 0
  private rightScore = 0
  private scoreText!: Phaser.GameObjects.Text

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.image(
      'pixel',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAJ02/w8AAAAASUVORK5CYII=',
    )
  }

  create() {
    const { width, height } = this.scale

    this.physics.world.setBoundsCollision(false, false, true, true)

    this.ball = this.physics.add.image(width / 2, height / 2, 'pixel')
    this.ball.setDisplaySize(10, 10)
    this.ball.setCollideWorldBounds(true)
    this.ball.setBounce(1, 1)

    this.leftPaddle = this.physics.add.image(30, height / 2, 'pixel')
    this.leftPaddle.setDisplaySize(10, 100)
    this.leftPaddle.setImmovable(true)
    this.leftPaddle.setCollideWorldBounds(true)

    this.rightPaddle = this.physics.add.image(width - 30, height / 2, 'pixel')
    this.rightPaddle.setDisplaySize(10, 100)
    this.rightPaddle.setImmovable(true)
    this.rightPaddle.setCollideWorldBounds(true)

    this.physics.add.collider(this.ball, this.leftPaddle)
    this.physics.add.collider(this.ball, this.rightPaddle)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys('W,S') as {
      W: Phaser.Input.Keyboard.Key
      S: Phaser.Input.Keyboard.Key
    }

    this.scoreText = this.add
      .text(width / 2, 20, '0 : 0', { fontSize: '24px', color: '#ffffff' })
      .setOrigin(0.5, 0)

    this.resetBall()
  }

  update() {
    if (this.keys.W.isDown) {
      this.leftPaddle.setVelocityY(-300)
    } else if (this.keys.S.isDown) {
      this.leftPaddle.setVelocityY(300)
    } else {
      this.leftPaddle.setVelocityY(0)
    }

    if (this.cursors.up?.isDown) {
      this.rightPaddle.setVelocityY(-300)
    } else if (this.cursors.down?.isDown) {
      this.rightPaddle.setVelocityY(300)
    } else {
      this.rightPaddle.setVelocityY(0)
    }

    const { width } = this.scale

    if (this.ball.x < 0) {
      this.rightScore++
      this.updateScore()
      this.resetBall()
    } else if (this.ball.x > width) {
      this.leftScore++
      this.updateScore()
      this.resetBall()
    }
  }

  private resetBall() {
    const { width, height } = this.scale
    this.ball.setPosition(width / 2, height / 2)
    const velocityX = Phaser.Math.Between(-200, 200)
    const velocityY = Phaser.Math.Between(-200, 200) || 200
    this.ball.setVelocity(velocityX, velocityY)
  }

  private updateScore() {
    this.scoreText.setText(`${this.leftScore} : ${this.rightScore}`)
  }
}

export default MainScene
