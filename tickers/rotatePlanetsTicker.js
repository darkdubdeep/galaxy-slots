export const rotatePlanetsTicker = (app, bigPlanet, smallPlanet) => {
  app.ticker.add(() => {
    bigPlanet.sprite.rotation += 0.003;
    smallPlanet.sprite.rotation += 0.003;
  });
};
