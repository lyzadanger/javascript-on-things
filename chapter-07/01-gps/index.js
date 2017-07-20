const five = require('johnny-five');
const board = new five.Board();

board.on('ready', function () {
  const gps = new five.GPS([11, 10]);

  board.repl.inject({
    gps: gps
  });
});
