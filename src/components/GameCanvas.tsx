'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import {
  BALL_SIZE,
  BALL_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_OFFSET,
  PADDLE_SPEED,
  PADDLE_WIDTH,
} from '../utils/gameConstants'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let cursors: Phaser.Types.Input.Keyboard.CursorKeys
    let wKey: Phaser.Input.Keyboard.Key
    let sKey: Phaser.Input.Keyboard.Key
    let leftPaddle: Phaser.Physics.Arcade.Image
    let rightPaddle: Phaser.Physics.Arcade.Image
    let ball: Phaser.Physics.Arcade.Image
    let scoreText: Phaser.GameObjects.Text
    let leftScore = 0
    let rightScore = 0

    const resetBall = (direction: number) => {
      ball.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2)
      ball.setVelocity(BALL_SPEED * direction, BALL_SPEED)
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      physics: { default: 'arcade' },
      scene: {
        preload() {
          this.load.image(
            'paddle',
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${PADDLE_WIDTH}" height="${PADDLE_HEIGHT}"><rect width="${PADDLE_WIDTH}" height="${PADDLE_HEIGHT}" fill="white"/></svg>`,
          )
          this.load.image(
            'ball',
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${BALL_SIZE}" height="${BALL_SIZE}"><rect width="${BALL_SIZE}" height="${BALL_SIZE}" fill="white"/></svg>`,
          )
        },
        create() {
          leftPaddle = this.physics.add
            .image(PADDLE_OFFSET, GAME_HEIGHT / 2, 'paddle')
            .setImmovable(true)
          rightPaddle = this.physics.add
            .image(GAME_WIDTH - PADDLE_OFFSET, GAME_HEIGHT / 2, 'paddle')
            .setImmovable(true)
          ball = this.physics.add
            .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ball')
            .setCollideWorldBounds(true)
            .setBounce(1, 1)
          resetBall(Phaser.Math.Between(0, 1) ? 1 : -1)

          cursors = this.input.keyboard.createCursorKeys()
          wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
          sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)

          scoreText = this.add
            .text(GAME_WIDTH / 2, 16, '0 - 0', {
              fontSize: '32px',
              color: '#fff',
            })
            .setOrigin(0.5, 0)

          this.physics.add.collider(ball, leftPaddle)
          this.physics.add.collider(ball, rightPaddle)
        },
        update() {
          if (wKey.isDown) {
            leftPaddle.setVelocityY(-PADDLE_SPEED)
          } else if (sKey.isDown) {
            leftPaddle.setVelocityY(PADDLE_SPEED)
          } else {
            leftPaddle.setVelocityY(0)
          }

          if (cursors.up?.isDown) {
            rightPaddle.setVelocityY(-PADDLE_SPEED)
          } else if (cursors.down?.isDown) {
            rightPaddle.setVelocityY(PADDLE_SPEED)
          } else {
            rightPaddle.setVelocityY(0)
          }

          if (ball.x < 0) {
            rightScore++
            resetBall(1)
          } else if (ball.x > GAME_WIDTH) {
            leftScore++
            resetBall(-1)
          }

          scoreText.setText(`${leftScore} - ${rightScore}`)
        },
      },
    })

    return () => {
      game.scene.getScenes(true).forEach((scene) => {
        scene.time.removeAllEvents()
        scene.input.keyboard.removeAllListeners()
      })
      game.destroy(true)
    }
  }, [])

  return <div ref={containerRef} />
}
