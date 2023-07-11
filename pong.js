document.addEventListener('DOMContentLoaded', () => {
    const pong = document.getElementById('pong');
    const ball = document.getElementById('ball');
    const leftPaddle = document.getElementById('leftPaddle');
    const rightPaddle = document.getElementById('rightPaddle');

    let ballX = 0;
    let ballY = 0;
    let ballSpeedX = 2;
    let ballSpeedY = 2;
    let paddleSpeed = 5;

    const update = () => {
        // Move the ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Check collision with paddles
        const leftPaddleRect = leftPaddle.getBoundingClientRect();
        const rightPaddleRect = rightPaddle.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();

        if (ballRect.intersects(leftPaddleRect) || ballRect.intersects(rightPaddleRect)) {
            ballSpeedX *= -1;
        }

        // Check collision with walls
        if (ballY < 0 || ballY + ball.offsetHeight > pong.offsetHeight) {
            ballSpeedY *= -1;
        }

        // Update ball position
        ball.style.left = ballX + 'px';
        ball.style.top = ballY + 'px';
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowUp' && rightPaddle.offsetTop >= paddleSpeed) {
            rightPaddle.style.top = (rightPaddle.offsetTop - paddleSpeed) + 'px';
        }
        if (e.key === 'ArrowDown' && rightPaddle.offsetTop + rightPaddle.offsetHeight + paddleSpeed <= pong.offsetHeight) {
            rightPaddle.style.top = (rightPaddle.offsetTop + paddleSpeed) + 'px';
        }
        if (e.key === 'w' && leftPaddle.offsetTop >= paddleSpeed) {
            leftPaddle.style.top = (leftPaddle.offsetTop - paddleSpeed) + 'px';
        }
        if (e.key === 's' && leftPaddle.offsetTop + leftPaddle.offsetHeight + paddleSpeed <= pong.offsetHeight) {
            leftPaddle.style.top = (leftPaddle.offsetTop + paddleSpeed) + 'px';
        }
    };

    setInterval(update, 1000 / 60);
    document.addEventListener('keydown', onKeyDown);
});
