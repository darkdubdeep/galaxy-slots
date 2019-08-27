export default class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.container = new PIXI.Container();
    this.initialize();
  }
  initialize() {
    this.container.position.x = this.x;
    this.container.position.y = this.y;
  }
}
