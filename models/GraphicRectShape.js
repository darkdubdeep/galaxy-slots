export default class {
  constructor(color, drawX, drawY, width, height, positionX, positionY) {
    this.graphic = new PIXI.Graphics();
    this.color = color;
    this.drawX = drawX;
    this.drawY = drawY;
    this.width = width;
    this.height = height;
    this.positionX = positionX;
    this.positionY = positionY;
    this.initialize();
  }
  initialize() {
    this.graphic.beginFill(this.color);
    this.graphic.drawRect(this.drawX, this.drawY, this.width, this.height);
    this.graphic.x = this.positionX;
    this.graphic.y = this.positionY;
  }
}
