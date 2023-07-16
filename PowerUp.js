export default class PowerUp {
    constructor(ctx, x, y, width, height, speed, scaleRatio) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.scaleRatio = scaleRatio;

        // Load the image for the power-up
        this.image = new Image();
        this.image.src = 'images/moonsun_final.png';
    }

    update(speed, gameSpeed, frameTimeDelta, gameOver) {
        if (!gameOver) {
            this.x -= this.speed * gameSpeed * frameTimeDelta;
        }
    }

    draw() {
        // Draw the power-up image
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    collideWith(sprite) {
        const distX = Math.abs(this.x - sprite.x - sprite.width / 2);
        const distY = Math.abs(this.y - sprite.y - sprite.height / 2);

        if (distX > sprite.width / 2 + this.width / 2) { return false; }
        if (distY > sprite.height / 2 + this.height / 2) { return false; }

        if (distX <= sprite.width / 2) { return true; }
        if (distY <= sprite.height / 2) { return true; }

        const dx = distX - sprite.width / 2;
        const dy = distY - sprite.height / 2;

        return dx * dx + dy * dy <= (this.width / 2) * (this.width / 2);
    }
}
