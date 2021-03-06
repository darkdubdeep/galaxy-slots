//constants
import { SYMBOL_SIZE, MAIN_COLOR } from './constants/constants.js';
// textures
import slotTextures from './textures/slotTextures.js';
import {
  bigPlanetTexture,
  smallPlanetTexture
} from './textures/plantetsTextures.js';
//models
import SymbolsWrapper from './models/SymbolsWrapper.js';
import Planet from './models/Planet.js';
import GraphicRectShape from './models/GraphicRectShape.js';
//tickers
import tweeningTicker from './tickers/tweeningTicker.js';
import symbolsPositionTicker from './tickers/symbolsPositionTicker.js';
import rotatePlanetsTicker from './tickers/rotatePlanetsTicker.js';

// helpers
import symbolsBuilder from './helpers/symbolsBuilder.js';

const app = new PIXI.Application({
  backgroundColor: MAIN_COLOR,
  width: window.innerWidth,
  height: window.innerHeight
});
document.body.appendChild(app.view);

app.loader
  .add([
    'assets/img/sym1.png',
    'assets/img/sym2.png',
    'assets/img/sym3.png',
    'assets/img/sym4.png',
    'assets/img/sym5.png',
    'assets/img/big-planet.png',
    'assets/img/small-planet.png'
  ])
  .load(onAssetsLoaded);

let globalParams = {
  pressedCount: 0
};

function onAssetsLoaded() {
  // build rotating planets
  const bigPlanet = new Planet(
    bigPlanetTexture,
    350,
    350,
    app.screen.width / 4.3,
    app.screen.height / 7,
    0.5,
    0.5
  );
  const smallPlanet = new Planet(
    smallPlanetTexture,
    150,
    150,
    app.screen.width / 4.9,
    app.screen.height / 7,
    1.9,
    1.9
  );

  // Rotate planets
  rotatePlanetsTicker(app, bigPlanet, smallPlanet);

  // Build the reel and symbols
  const reelContainer = new PIXI.Container();
  reelContainer.y = 300;

  const symbolsWrapper = new SymbolsWrapper((app.screen.width - 150) / 2, -125);
  const symbolsContainer = symbolsWrapper.container;

  reelContainer.addChild(
    symbolsContainer,
    bigPlanet.sprite,
    smallPlanet.sprite
  );

  const reel = {
    container: symbolsContainer,
    symbols: [],
    position: 0,
    previousPosition: 0,
    blur: new PIXI.filters.BlurFilter()
  };

  reel.blur.blurX = 0;
  reel.blur.blurY = 0;
  symbolsContainer.filters = [reel.blur];

  // Build the symbols
  symbolsBuilder(SYMBOL_SIZE, slotTextures, reel, symbolsContainer);

  app.stage.addChild(reelContainer);

  // Build top subcontainer
  const topSubContainer = new GraphicRectShape(
    MAIN_COLOR,
    0,
    0,
    140,
    symbolsContainer.height / 4.2,
    (app.screen.width - 140) / 2,
    -300
  );

  // main text subcontainer
  const mainTextContainer = new GraphicRectShape(
    MAIN_COLOR,
    0,
    0,
    250,
    150,
    (app.screen.width + 500) / 2,
    0
  );

  const mainTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontStyle: 'italic',
    fontSize: 36,
    fontWeight: 'bold',
    fill: ['#ffbffc', '#f5d5f3'], // gradient
    wordWrapWidth: 440
  });

  // initialize balance text
  let money = 100;
  let balanceText;

  const balanceTextCreator = () => {
    balanceText = new PIXI.Text(`BALANCE: ${money} $`, mainTextStyle);
    mainTextContainer.graphic.addChild(balanceText);
  };

  balanceTextCreator();

  // initialize bet text text
  let betText = new PIXI.Text('BET: 1 $', mainTextStyle);
  betText.y = 100;

  mainTextContainer.graphic.addChild(betText);

  reelContainer.addChild(mainTextContainer.graphic);

  // initialize bottom subcontainer
  const bottomSubContainer = new GraphicRectShape(
    MAIN_COLOR,
    0,
    0,
    140,
    app.screen.height / 3,
    (app.screen.width - 140) / 2,
    325
  );

  const playButton = new PIXI.Graphics();
  playButton.lineStyle(2, 0xff00ff, 1);
  playButton.beginFill(0x650a5a, 0.25);
  playButton.drawRoundedRect(0, 20, 100, 100, 16);
  playButton.endFill();
  playButton.x = (bottomSubContainer.graphic.width - playButton.width) / 2;
  playButton.interactive = true;
  playButton.buttonMode = true;

  const playButtonTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontStyle: 'italic',
    fontSize: 15,
    fontWeight: 'bold',
    fill: ['#ffbffc', '#f5d5f3'], // gradient
    wordWrapWidth: 440
  });

  let playButtonText = new PIXI.Text('PLAY', playButtonTextStyle);
  playButtonText.x = 30;
  playButtonText.y = 60;
  playButton.addChild(playButtonText);

  // Set the button interactivity.

  playButton.addListener('pointerdown', () => {
    var sound = new Howl({
      src: ['assets/sounds/button-sound.mp3']
    });
    sound.play();
    startPlay();
    playButton.scale.set(1.1, 1.1);
    playButton.x -= 5;
    setTimeout(() => {
      playButton.x += 5;
      playButton.scale.set(1.0, 1.0);
    }, 100);
  });

  bottomSubContainer.graphic.addChild(playButton);

  reelContainer.addChild(topSubContainer.graphic);
  reelContainer.addChild(bottomSubContainer.graphic);

  // Function to start playing.
  function startPlay() {
    globalParams.pressedCount += 1;

    if (globalParams.pressedCount > 1 || money < 1) {
      return;
    }
    money--;
    mainTextContainer.graphic.removeChild(balanceText);

    balanceTextCreator();
    const r = reel;
    const time = 3000;
    const target = r.position + 10;
    tweenTo(r, 'position', target, time, backout(0.5), null, reelComplete);
  }

  // Reel done handler.
  function reelComplete() {
    globalParams.pressedCount = 0;
    let combination = reel.symbols;

    // detect win combinatiop
    if (
      combination[1]._texture.textureCacheIds[0] ===
        combination[2]._texture.textureCacheIds[0] &&
      combination[2]._texture.textureCacheIds[0] ===
        combination[3]._texture.textureCacheIds[0]
    ) {
      money += 3;
      var sound = new Howl({
        src: ['assets/sounds/big-win.mp3']
      });

      sound.play();
    } else if (
      combination[1]._texture.textureCacheIds[0] ===
        combination[2]._texture.textureCacheIds[0] ||
      combination[2]._texture.textureCacheIds[0] ===
        combination[3]._texture.textureCacheIds[0]
    ) {
      money += 2;
      var sound = new Howl({
        src: ['assets/sounds/small-win.mp3']
      });

      sound.play();
    } else {
      var sound = new Howl({
        src: ['assets/sounds/stop-spinning-sound.mp3']
      });
      sound.play();
    }
    mainTextContainer.graphic.removeChild(balanceText);

    balanceTextCreator();
  }

  // Listen for positioan animate update.
  symbolsPositionTicker(app, reel, slotTextures, SYMBOL_SIZE);
}

// Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
const tweening = [];

function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
  const tween = {
    object,
    property,
    propertyBeginValue: object[property],
    target,
    easing,
    time,
    change: onchange,
    complete: oncomplete,
    start: Date.now()
  };

  tweening.push(tween);
  return tween;
}

/// Listen for animate update.
tweeningTicker(app, tweening, globalParams, lerp);

// Basic lerp funtion.
function lerp(a1, a2, t) {
  return a1 * (1 - t) + a2 * t;
}

// Backout function from tweenjs.
function backout(amount) {
  return t => --t * t * ((amount + 1) * t + amount) + 1;
}
// bacjground sound
var mainTheme = new Howl({
  src: ['assets/sounds/main-theme.mp3']
});
mainTheme.play();
