import PowerUp from "./PowerUp.js";

export default class PowerUpController {
    POWER_UP_INTERVAL_MIN = 3000;
    POWER_UP_INTERVAL_MAX = 7000;

    nextPowerUpInterval = null;
    powerUps = [];

    constructor(ctx, width, height, speed, scaleRatio) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.scaleRatio = scaleRatio;

        this.setNextPowerUpTime();
        this.createPowerUp();
    }

    setNextPowerUpTime() {
        this.nextPowerUpInterval = Math.random() * (this.POWER_UP_INTERVAL_MAX - this.POWER_UP_INTERVAL_MIN) + this.POWER_UP_INTERVAL_MIN;
    }

    createPowerUp() {
        const x = this.canvas.width;
        const y = Math.random() * (this.canvas.height - this.height * 2) + this.height;
        const powerUp = new PowerUp(
            this.ctx,
            x,
            y,
            this.width,
            this.height,
            this.speed,
            this.scaleRatio
        );

        this.powerUps.push(powerUp);
    }

    update(gameSpeed, frameTimeDelta, gameOver) {
        if (this.nextPowerUpInterval <= 0 && !gameOver) {
            this.createPowerUp();
            this.setNextPowerUpTime();
        }

        this.nextPowerUpInterval -= frameTimeDelta;

        this.powerUps.forEach((powerUp) => {
            powerUp.update(this.speed, gameSpeed, frameTimeDelta, gameOver);
        });

        this.powerUps = this.powerUps.filter((powerUp) => powerUp.x > -powerUp.width);
    }

    draw() {
        this.powerUps.forEach((powerUp) => powerUp.draw());
    }

    collideWith(sprite) {
        return this.powerUps.some((powerUp) => powerUp.collideWith(sprite));
    }

    reset() {
        this.powerUps = [];
        this.setNextPowerUpTime();
    }
}
