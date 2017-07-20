const five  = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const servo = new five.Servo({ pin: 6 });
  board.repl.inject({
    servo: servo
  });
});
