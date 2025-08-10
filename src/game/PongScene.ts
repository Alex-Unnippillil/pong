import Phaser from 'phaser'
import posthog from 'posthog-js'

export class PongScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Arc
  private leftPaddle!: Phaser.GameObjects.Rectangle
  private rightPaddle!: Phaser.GameObjects.Rectangle

  constructor() {
    super('PongScene')
  }

  preload() {}

  create() {
    const { width, height } = this.scale

    this.leftPaddle = this.add.rectangle(30, height / 2, 20, 100, 0xffffff)
    this.rightPaddle = this.add.rectangle(
      width - 30,
      height / 2,
      20,
      100,
      0xffffff,
    )
    this.physics.add.existing(this.leftPaddle, true)
    this.physics.add.existing(this.rightPaddle, true)

    this.ball = this.add.circle(width / 2, height / 2, 10, 0xffffff)
    this.physics.add.existing(this.ball)
    const ballBody = this.ball.body as Phaser.Physics.Arcade.Body
    ballBody.setCollideWorldBounds(true, 1, 1)
    ballBody.setBounce(1, 1)
    ballBody.setVelocity(200, 200)

    this.physics.add.collider(this.ball, this.leftPaddle)
    this.physics.add.collider(this.ball, this.rightPaddle)

    posthog.capture('match_start')
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      posthog.capture('match_end')
    })
  }

  update() {
    const pointer = this.input.activePointer
    this.leftPaddle.y = Phaser.Math.Clamp(
      pointer.worldY,
      this.leftPaddle.height / 2,
      this.scale.height - this.leftPaddle.height / 2,
    )
    ;(
      this.leftPaddle.body as Phaser.Physics.Arcade.StaticBody
    ).updateFromGameObject()

    this.rightPaddle.y = Phaser.Math.Clamp(
      this.ball.y,
      this.rightPaddle.height / 2,
      this.scale.height - this.rightPaddle.height / 2,
    )
    ;(
      this.rightPaddle.body as Phaser.Physics.Arcade.StaticBody
    ).updateFromGameObject()
  }
}
