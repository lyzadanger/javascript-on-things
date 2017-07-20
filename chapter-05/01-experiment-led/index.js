const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const led1 = new five.Led(2);
  const led2 = new five.Led(3);

  board.repl.inject({
    led1: led1,
    led2: led2
  });
});
