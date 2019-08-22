const app = new PIXI.Application({
    backgroundColor: 0x4f4f4f,
    width: window.screen.width,
    height: window.screen.height
});
document.body.appendChild(app.view);

app.loader
    .add([
        'img/sym1.png',
        'img/sym2.png',
        'img/sym3.png',
        'img/sym4.png',
        'img/sym5.png'
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

    // Build the reels
    let reels = [];
    const reelContainer = new PIXI.Container();
    const rc = new PIXI.Container();
    rc.x = REEL_WIDTH;
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
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
    reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);
    const top = new PIXI.Graphics();
    top.beginFill(0x4f4f4f);
    top.drawRect(0, 0, app.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0x4f4f4f);
    bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

    // Add play text
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    });

    const playText = new PIXI.Text('Spin the wheels!', style);
    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y =
        app.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);

    let balanceText;
    const balanceTextCreator = () => {
        balanceText = new PIXI.Text(`Balance: ${money} $`, style);
        balanceText.x = Math.round((bottom.width - balanceText.width) / 2);
        balanceText.y =
            app.screen.height -
            margin +
            Math.round(margin - balanceText.height * 2);
        bottom.addChild(balanceText);
    };

    let betText = new PIXI.Text('Bet: 1 $', style);
    betText.x = Math.round((bottom.width - betText.width) / 2);
    betText.y =
        app.screen.height - margin + Math.round(margin - betText.height * 3);
    bottom.addChild(betText);

    balanceTextCreator();

    // Add header text
    const headerText = new PIXI.Text('GALAXY SLOTS', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    app.stage.addChild(top);
    app.stage.addChild(bottom);

    // Set the interactivity.
    bottom.interactive = true;
    bottom.buttonMode = true;
    bottom.addListener('pointerdown', () => {
        startPlay();
    });

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
        bottom.removeChild(balanceText);

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
            console.log('small nongp');
            console.log(money);
        } else {
            console.log('сосни хуйца');
        }
        bottom.removeChild(balanceText);

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
