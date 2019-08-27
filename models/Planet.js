export default class {
  constructor(planetTexture, width, height, x, y, anchorX, anchorY) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.sprite = new PIXI.Sprite(planetTexture);
    this.initialize();
  }
  initialize() {
    this.sprite.width = this.width;
    this.sprite.height = this.height;
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;
    this.sprite.anchor.x = this.anchorX;
    this.sprite.anchor.y = this.anchorY;
  }
}
