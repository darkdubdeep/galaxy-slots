import { consoler } from './modules/textures.js';

consoler();

const app = new PIXI.Application({
    backgroundColor: 0x2a2f36,
    width: window.innerWidth,
    height: window.innerHeight
});
document.body.appendChild(app.view);

app.loader
    .add([
        'img/sym1.png',
        'img/sym2.png',
        'img/sym3.png',
        'img/sym4.png',
        'img/sym5.png',
        'img/big-planet.png',
        'img/small-planet.png'
    ])
    .load(onAssetsLoaded);

const REEL_WIDTH = 160;
const SYMBOL_SIZE = 150;

let pressedCount = 0;
let money = 100;
// onAssetsLoaded handler builds the example.
function onAssetsLoaded() {
    // Create different slot symbols.
    const slotTextures = [
        PIXI.Texture.from('img/sym1.png'),
        PIXI.Texture.from('img/sym2.png'),
        PIXI.Texture.from('img/sym3.png'),
        PIXI.Texture.from('img/sym4.png'),
        PIXI.Texture.from('img/sym5.png')
    ];

    const bigPlanetTexture = PIXI.Texture.from('img/big-planet.png');
    const bigPlanetSprite = new PIXI.Sprite(bigPlanetTexture);
    bigPlanetSprite.width = 350;
    bigPlanetSprite.height = 350;
    bigPlanetSprite.x = app.screen.width / 4.3;
    bigPlanetSprite.y = app.screen.height / 7;
    bigPlanetSprite.anchor.x = 0.5;
    bigPlanetSprite.anchor.y = 0.5;
    app.ticker.add(() => {
        bigPlanetSprite.rotation += 0.003;
    });

    const smallPlanetTexture = PIXI.Texture.from('img/small-planet.png');
    const smallPlanetSprite = new PIXI.Sprite(smallPlanetTexture);
    smallPlanetSprite.width = 150;
    smallPlanetSprite.height = 150;
    smallPlanetSprite.x = app.screen.width / 4.9;
    smallPlanetSprite.y = app.screen.height / 7;
    smallPlanetSprite.anchor.x = 1.9;
    smallPlanetSprite.anchor.y = 1.9;
    app.ticker.add(() => {
        smallPlanetSprite.rotation += 0.003;
    });

    // Build the reels
    let reels = [];
    const reelContainer = new PIXI.Container();

    const rc = new PIXI.Container();
    rc.x = (app.screen.width - 150) / 2;
    rc.y = -125;

    reelContainer.addChild(bigPlanetSprite);
    reelContainer.addChild(smallPlanetSprite);
    reelContainer.addChild(rc);

    const reel = {
        container: rc,
        symbols: [],
        position: 0,
        previousPosition: 0,
        blur: new PIXI.filters.BlurFilter()
    };
    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    rc.filters = [reel.blur];

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
        rc.addChild(symbol);
    }

    reels.push(reel);

    app.stage.addChild(reelContainer);
    // Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 2) / 2;
    console.log(SYMBOL_SIZE);
    reelContainer.y = 300;
    // reelContainer.x = Math.round(app.screen.width / 5);
    const top = new PIXI.Graphics();
    top.beginFill(0x2a2f36);
    top.drawRect(0, 0, 140, rc.height / 4.2);
    top.x = (app.screen.width - 140) / 2;
    top.y = -300;
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0x2a2f36);
    let bottomHeight = window.innerHeight - rc.height + rc.height / 4;
    console.log('bottomHeight');
    console.log(rc.height);
    console.log(rc.y);
    bottom.drawRect(0, 0, 140, app.screen.height / 3);
    bottom.x = (app.screen.width - 140) / 2;
    console.log(reelContainer.height);

    bottom.y = 325;

    // Add play text
    const mainTextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontStyle: 'italic',
        fontSize: 36,
        fontWeight: 'bold',
        fill: ['#ffbffc', '#f5d5f3'], // gradient
        wordWrapWidth: 440
    });

    const mainTextContainer = new PIXI.Graphics();
    mainTextContainer.beginFill(0x2a2f36);
    mainTextContainer.drawRect(0, 0, 250, 150);
    mainTextContainer.x = (app.screen.width + 500) / 2;
    reelContainer.addChild(mainTextContainer);
    let balanceText;
    const balanceTextCreator = () => {
        balanceText = new PIXI.Text(`BALANCE: ${money} $`, mainTextStyle);
        mainTextContainer.addChild(balanceText);
    };

    let betText = new PIXI.Text('BET: 1 $', mainTextStyle);
    betText.y = 100;

    mainTextContainer.addChild(betText);

    balanceTextCreator();

    reelContainer.addChild(top);
    reelContainer.addChild(bottom);

    const playButton = new PIXI.Graphics();
    playButton.lineStyle(2, 0xff00ff, 1);
    playButton.beginFill(0x650a5a, 0.25);
    playButton.drawRoundedRect(0, 20, 100, 100, 16);
    playButton.endFill();
    playButton.x = (bottom.width - playButton.width) / 2;
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
    bottom.addChild(playButton);
    // Set the interactivity.

    playButton.addListener('pointerdown', () => {
        var sound = new Howl({
            src: ['sounds/button-sound.mp3']
        });
        sound.play();

        // var sound2 = new Howl({
        //     src: ['sounds/spinning-sound.mp3']
        // });
        // sound2.play();

        startPlay();
        playButton.scale.set(1.1, 1.1);
        playButton.x -= 5;
        setTimeout(() => {
            playButton.x += 5;
            playButton.scale.set(1.0, 1.0);
        }, 100);
    });

    // decoration

    let running = false;

    // Function to start playing.
    function startPlay() {
        // if (running) {
        //     return;
        // }
        running = true;
        pressedCount += 1;
        console.log(money);
        if (pressedCount > 1) {
            return;
        }
        money--;
        mainTextContainer.removeChild(balanceText);

        balanceTextCreator();
        const r = reels[0];
        const time = 3000;
        const extra = Math.floor(Math.random() * 3);
        const target = r.position + 10;
        tweenTo(r, 'position', target, time, backout(0.5), null, reelsComplete);
    }

    // Reels done handler.
    function reelsComplete() {
        running = false;
        pressedCount = 0;
        let combination = reels[0].symbols;
        console.log(combination);
        if (
            combination[1]._texture.textureCacheIds[0] ===
                combination[2]._texture.textureCacheIds[0] &&
            combination[2]._texture.textureCacheIds[0] ===
                combination[3]._texture.textureCacheIds[0]
        ) {
            money += 3;
            var sound = new Howl({
                src: ['sounds/big-win.mp3']
            });

            sound.play();
        } else if (
            combination[1]._texture.textureCacheIds[0] ===
                combination[2]._texture.textureCacheIds[0] ||
            combination[2]._texture.textureCacheIds[0] ===
                combination[3]._texture.textureCacheIds[0]
        ) {
            money += 2;
            money += 3;
            var sound = new Howl({
                src: ['sounds/small-win.mp3']
            });

            sound.play();
        } else {
            var sound = new Howl({
                src: ['sounds/stop-spinning-sound.mp3']
            });
            sound.play();
        }
        mainTextContainer.removeChild(balanceText);

        balanceTextCreator();
    }

    // Listen for animate update.
    app.ticker.add(delta => {
        // Update the slots.

        const r = reels[0];
        // Update blur filter y amount based on speed.
        // This would be better if calculated with time in mind also. Now blur depends on frame rate.
        r.blur.blurY = (r.position - r.previousPosition) * 10;
        r.previousPosition = r.position;

        // Update symbol positions on reel.
        for (let j = 0; j < r.symbols.length; j++) {
            const s = r.symbols[j];
            const prevy = s.y;
            s.y =
                ((r.position + j) % r.symbols.length) * SYMBOL_SIZE -
                SYMBOL_SIZE;
            if (s.y < 0 && prevy > SYMBOL_SIZE) {
                // Detect going over and swap a texture.
                // This should in proper product be determined from some logical reel.
                s.texture =
                    slotTextures[
                        Math.floor(Math.random() * slotTextures.length)
                    ];
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
const combination = [];

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
            combination.push(t);
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
// https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
function backout(amount) {
    return t => --t * t * ((amount + 1) * t + amount) + 1;
}

var sound = new Howl({
    src: ['sounds/main-theme.mp3']
});
sound.play();
