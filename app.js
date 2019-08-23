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
        'img/planets.png'
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

    const asteroidTexture = PIXI.Texture.from('img/planets.png');
    const asteroidSprite = new PIXI.Sprite(asteroidTexture);
    asteroidSprite.x = 350;
    asteroidSprite.y = 150;
    asteroidSprite.anchor.x = 0.5;
    asteroidSprite.anchor.y = 0.5;
    app.ticker.add(() => {
        asteroidSprite.rotation += 0.01;
    });
    // Build the reels
    let reels = [];
    const reelContainer = new PIXI.Container();

    const rc = new PIXI.Container();
    rc.x = (app.screen.width - 150) / 2;
    rc.y = -125;

    // const reelSubContainer = new PIXI.Container();
    // reelSubContainer.width = 150;
    // reelSubContainer.x = (app.screen.width - 150) / 2;

    // const subContainerBackground = new PIXI.Graphics();
    // subContainerBackground.beginFill(0x0c0a29);
    // subContainerBackground.drawRect(0, -140, 150, 500);
    // reelSubContainer.addChild(subContainerBackground);

    reelContainer.addChild(asteroidSprite);
    // reelContainer.addChild(reelSubContainer);
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
        startPlay();
        playButton.scale.set(1.1, 1.1);
        playButton.x -= 5;
        setTimeout(() => {
            playButton.x += 5;
            playButton.scale.set(1.0, 1.0);
        }, 100);
    });

    // decoration

    function createGradTexture() {
        // adjust it if somehow you need better quality for very very big images
        const quality = 256;
        const canvas = document.createElement('canvas');
        canvas.width = quality;
        canvas.height = 1;

        const ctx = canvas.getContext('2d');

        // use canvas2d API to create gradient
        const grd = ctx.createLinearGradient(0, 0, quality, 0);
        grd.addColorStop(0, '#2d3645');
        grd.addColorStop(0.5, '#45536b');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, quality, 1);

        return PIXI.Texture.from(canvas);
    }

    const gradTexture = createGradTexture();

    // const sprite = new PIXI.Sprite(gradTexture);
    // sprite.position.set(380, 350);
    // sprite.rotation = Math.PI / 8;
    // sprite.width = 300;
    // sprite.height = 300;
    // app.stage.addChild(sprite);

    // sprite.anchor.x = 0.5;
    // sprite.anchor.y = 0.5;
    // app.ticker.add(() => {
    //     sprite.rotation += 0.01;
    // });

    // // ARC ////
    // const arc = new PIXI.Graphics();

    // arc.lineStyle(5, 0xaa00bb, 1);
    // arc.beginFill(gradient('#9ff', '#033'), 1);
    // arc.drawCircle(400, 250, 100);

    // function gradient(from, to) {
    //     const c = document.createElement('canvas');
    //     const ctx = c.getContext('2d');
    //     const grd = ctx.createLinearGradient(0, 0, 100, 100);
    //     grd.addColorStop(0, from);
    //     grd.addColorStop(1, to);
    //     ctx.fillStyle = grd;
    //     ctx.fillRect(0, 0, 100, 100);
    //     return new PIXI.Texture.from(c);
    // }

    // app.stage.addChild(arc);

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
            console.log('BINGOOOOOOOOOO');
            money += 3;
            console.log(money);
        } else if (
            combination[1]._texture.textureCacheIds[0] ===
                combination[2]._texture.textureCacheIds[0] ||
            combination[2]._texture.textureCacheIds[0] ===
                combination[3]._texture.textureCacheIds[0]
        ) {
            money += 2;
        } else {
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
