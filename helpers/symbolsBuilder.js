const symbolsBuilder = (SYMBOL_SIZE, slotTextures, reel, symbolsContainer) => {
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
};
export default symbolsBuilder;
