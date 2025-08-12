import Phaser from 'phaser'

export default class MainScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Arc
  private velocity = new Phaser.Math.Vector2(200, 200)

  constructor() {
    super('MainScene')
  }

  preload() {
    // Preload assets here if needed
  }

  create() {
    const { width, height } = this.scale
    this.ball = this.add.circle(width / 2, height / 2, 10, 0xffffff)
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000
    this.ball.x += this.velocity.x * dt
    this.ball.y += this.velocity.y * dt

    if (this.ball.x <= 0 || this.ball.x >= this.scale.width) {
      this.velocity.x *= -1
    }
    if (this.ball.y <= 0 || this.ball.y >= this.scale.height) {
      this.velocity.y *= -1
    }
  }
}
