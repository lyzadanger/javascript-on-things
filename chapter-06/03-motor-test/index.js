const five = require('johnny-five');
const board = new five.Board();

board.on('ready', function () {
  const motors = new five.Motors([
    { pins: { dir: 12, pwm: 11 }, invertPWM: true },
    { pins: { dir: 4, pwm: 5}, invertPWM: true }
  ]);

  board.repl.inject({
    motors: motors
  });
});
