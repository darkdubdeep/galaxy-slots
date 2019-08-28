export const positionTicker = (app, reel, slotTextures, SYMBOL_SIZE) => {
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
};
