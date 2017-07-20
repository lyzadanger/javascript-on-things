const five  = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const motor = new five.Motor({ pin: 6 });
  board.repl.inject({
    motor: motor
  });
});
