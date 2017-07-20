const five  = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const pulsingLED = new five.Led(3);
  const options = {
    easing    : 'inOutSine',
    metronomic: true,
    loop      : true,
    keyFrames : [0, 255],
    duration  : 1000
  };
  const animation = new five.Animation(pulsingLED);
  animation.enqueue(options);
});
