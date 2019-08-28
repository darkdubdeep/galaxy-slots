import { SYMBOL_SIZE, MAIN_COLOR } from './constants/constants.js';

import slotTextures from './textures/slotTextures.js';
import {
  bigPlanetTexture,
  smallPlanetTexture
} from './textures/plantetsTextures.js';

import SymbolsWrapper from './models/SymbolsWrapper.js';
import Planet from './models/Planet.js';
import GraphicRectShape from './models/GraphicRectShape.js';

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

// initialize button press count indication
let pressedCount = 0;

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
  app.ticker.add(() => {
    bigPlanet.sprite.rotation += 0.003;
    smallPlanet.sprite.rotation += 0.003;
  });

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
  for (let i = 0; i < 5; i++) {
    const symbol = new PIXI.Sprite(
      slotTextures[Math.floor(Math.random() * slotTextures.length)]
    );
    // Scale the symbol to fit symbol area.
    symbol.y = i * SYMBOL_SIZE;
    symbol.scale.x = symbol.scale.y = Math.min(
      SYMBOL_SIZE / symbol.width,
      SYMBOL_SIZE / symbol.height
    );
    symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
    reel.symbols.push(symbol);
    symbolsContainer.addChild(symbol);
  }

  app.stage.addChild(reelContainer);

  // Build top & bottom decoration covers
  const topSubContainer = new GraphicRectShape(
    MAIN_COLOR,
    0,
    0,
    140,
    symbolsContainer.height / 4.2,
    (app.screen.width - 140) / 2,
    -300
  );

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

  // main text
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

  // initialize balance inidication
  let money = 100;
  let balanceText;
  const balanceTextCreator = () => {
    balanceText = new PIXI.Text(`BALANCE: ${money} $`, mainTextStyle);
    mainTextContainer.graphic.addChild(balanceText);
  };

  balanceTextCreator();

  let betText = new PIXI.Text('BET: 1 $', mainTextStyle);
  betText.y = 100;

  mainTextContainer.graphic.addChild(betText);
  reelContainer.addChild(mainTextContainer.graphic);

  // Function to start playing.
  function startPlay() {
    pressedCount += 1;

    if (pressedCount > 1 || money < 1) {
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
    pressedCount = 0;
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

  // Listen for animate update.
  app.ticker.add(delta => {
    // Update the slots.

    const r = reel;
    // Update blur filter y amount based on speed.
    // This would be better if calculated with time in mind also. Now blur depends on frame rate.
    r.blur.blurY = (r.position - r.previousPosition) * 10;
    r.previousPosition = r.position;

    // Update symbol positions on reel.
    for (let j = 0; j < r.symbols.length; j++) {
      const s = r.symbols[j];
      const prevy = s.y;
      s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
      if (s.y < 0 && prevy > SYMBOL_SIZE) {
        // Detect going over and swap a texture.
        // This should in proper product be determined from some logical reel.
        s.texture =
          slotTextures[Math.floor(Math.random() * slotTextures.length)];
        s.scale.x = s.scale.y = Math.min(
          SYMBOL_SIZE / s.texture.width,
          SYMBOL_SIZE / s.texture.height
        );
        s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
      }
    }
  });
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

// Listen for animate update.
app.ticker.add(delta => {
  const now = Date.now();
  const remove = [];
  for (let i = 0; i < tweening.length; i++) {
    const t = tweening[i];
    let phase;
    if (pressedCount > 1) {
      phase = 10;
    } else {
      phase = Math.min(1, (now - t.start) / t.time);
    }

    t.object[t.property] = lerp(
      t.propertyBeginValue,
      t.target,
      t.easing(phase)
    );
    if (t.change) t.change(t);
    if (phase === 1 || pressedCount > 1) {
      // speed
      t.object[t.property] = t.target;
      if (t.complete) t.complete(t);
      remove.push(t);
    }
  }
  for (let i = 0; i < remove.length; i++) {
    tweening.splice(tweening.indexOf(remove[i]), 1);
  }
});

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
