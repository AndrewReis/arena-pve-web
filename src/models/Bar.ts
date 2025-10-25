import 'phaser';

type HudBarProps = {
  x: number;
  y: number;
  value: number;
};

export class HealthBar {
  private bar;
  private value: number;
  private x: number;
  private y: number;
  private p: number;

  constructor(scene: Phaser.Scene, { x, y, value }: HudBarProps) {
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.value = value;
    this.x = x;
    this.y = y;
    this.p = 192 / 100;
    scene.add.existing(this.bar);
  }

  public draw() {
    this.bar.clear();

    //  BG
    this.bar.fillStyle(0x009c40);
    this.bar.fillRect(this.x, this.y, 192, 12);

    //  Health

    this.bar.fillStyle(0xffffff);
    this.bar.fillRect(this.x + 2, this.y + 2, 192, 10);

    if (this.value < 30) {
      this.bar.fillStyle(0xff0000);
    }
    else {
      this.bar.fillStyle(0x009c40);
    }

    var d = Math.floor(this.p * this.value);

    this.bar.fillRect(this.x + 2, this.y + 2, d, 10);
  }

  update() {
    this.draw();
  }
}

export class StaminaBar {
  private bar;
  private value: number;
  private x: number;
  private y: number;
  private p: number;

  constructor(scene: Phaser.Scene, { x, y, value }: HudBarProps) {
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.value = value;
    this.x = x;
    this.y = y;
    this.p = 128 / 100;
    scene.add.existing(this.bar);
  }

  public draw() {
    this.bar.clear();

    //  BG
    this.bar.fillStyle(0x0000ff);
    this.bar.fillRect(this.x, this.y, 128, 10);

    //  Health

    this.bar.fillStyle(0xffffff);
    this.bar.fillRect(this.x + 2, this.y + 2, 128, 6);

    if (this.value < 30) {
      this.bar.fillStyle(0xff0000);
    }
    else {
      this.bar.fillStyle(0x1e90ff);
    }

    var d = Math.floor(this.p * this.value);

    this.bar.fillRect(this.x + 2, this.y + 2, d, 6);
  }

  update() {
    this.draw();
  }
}