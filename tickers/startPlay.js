// Function to start playing.
export default function startPlay(
  pressedCount,
  money,
  mainTextContainer,
  balanceText,
  reel,
  reelComplete,
  tweenTo,
  balanceTextCreator,
  backout
) {
  pressedCount += 1;

  if (pressedCount > 1 || money < 1) {
    return;
  }
  money--;
  mainTextContainer.removeChild(balanceText);

  balanceTextCreator(money);
  const r = reel;
  const time = 3000;
  const target = r.position + 10;
  tweenTo(r, 'position', target, time, backout(0.5), null, reelComplete);
}
