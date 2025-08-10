import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private leftPaddle!: Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.Body
  }
  private rightPaddle!: Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.Body
  }
  private ball!: Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body }
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wKey!: Phaser.Input.Keyboard.Key
  private sKey!: Phaser.Input.Keyboard.Key
  private leftScore = 0
  private rightScore = 0
  private scoreText!: Phaser.GameObjects.Text

  constructor() {
    super('MainScene')
  }

  preload() {}

  create() {
    const { width, height } = this.scale

    this.leftPaddle = this.add.rectangle(
      30,
      height / 2,
      20,
      100,
      0xffffff,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body }
    this.rightPaddle = this.add.rectangle(
      width - 30,
      height / 2,
      20,
      100,
      0xffffff,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body }
    this.ball = this.add.circle(
      width / 2,
      height / 2,
      10,
      0xffffff,
    ) as Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body }

    this.physics.add.existing(this.leftPaddle)
    this.physics.add.existing(this.rightPaddle)
    this.physics.add.existing(this.ball)

    const leftBody = this.leftPaddle.body
    const rightBody = this.rightPaddle.body
    const ballBody = this.ball.body

    leftBody.setImmovable(true).setCollideWorldBounds(true)
    rightBody.setImmovable(true).setCollideWorldBounds(true)

    ballBody
      .setCollideWorldBounds(true, 1, 1)
      .setBounce(1, 1)
      .setVelocity(200, 200)
    ballBody.checkCollision.left = false
    ballBody.checkCollision.right = false

    this.physics.add.collider(this.ball, this.leftPaddle)
    this.physics.add.collider(this.ball, this.rightPaddle)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S)

    this.scoreText = this.add
      .text(width / 2, 16, '0 : 0', {
        color: '#ffffff',
        fontSize: '32px',
      })
      .setOrigin(0.5, 0)
  }

  update() {
    const paddleSpeed = 300
    const leftBody = this.leftPaddle.body
    const rightBody = this.rightPaddle.body
    const ballBody = this.ball.body
    const { width, height } = this.scale

    if (this.wKey.isDown) {
      leftBody.setVelocityY(-paddleSpeed)
    } else if (this.sKey.isDown) {
      leftBody.setVelocityY(paddleSpeed)
    } else {
      leftBody.setVelocityY(0)
    }

    if (this.cursors.up?.isDown) {
      rightBody.setVelocityY(-paddleSpeed)
    } else if (this.cursors.down?.isDown) {
      rightBody.setVelocityY(paddleSpeed)
    } else {
      rightBody.setVelocityY(0)
    }

    if (ballBody.x < 0) {
      this.rightScore++
      this.resetBall()
    } else if (ballBody.x > width) {
      this.leftScore++
      this.resetBall()
    }

    this.scoreText.setText(`${this.leftScore} : ${this.rightScore}`)

    this.leftPaddle.y = Phaser.Math.Clamp(
      this.leftPaddle.y,
      this.leftPaddle.height / 2,
      height - this.leftPaddle.height / 2,
    )
    this.rightPaddle.y = Phaser.Math.Clamp(
      this.rightPaddle.y,
      this.rightPaddle.height / 2,
      height - this.rightPaddle.height / 2,
    )
  }

  private resetBall() {
    const { width, height } = this.scale
    const ballBody = this.ball.body as Phaser.Physics.Arcade.Body
    this.ball.setPosition(width / 2, height / 2)
    ballBody.setVelocity(
      Phaser.Math.Between(-200, 200),
      Phaser.Math.Between(-200, 200),
    )
  }
}

export default MainScene
