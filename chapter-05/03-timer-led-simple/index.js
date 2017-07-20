const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const pulsingLED = new five.Led(3);
  const timerLength = 10000;
  setTimeout(() => {
    pulsingLED.pulse();
  }, timerLength);
});
