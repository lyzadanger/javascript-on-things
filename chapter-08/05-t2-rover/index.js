const five     = require('johnny-five');
const Tessel   = require('tessel-io');
const board    = new five.Board({
  io: new Tessel()
});
const keypress = require('keypress');
const Rover    = require('./Rover');

board.on('ready', function () {
  const motors = new five.Motors([
    { pins: { dir: 'A4', pwm: 'A5' }, invertPWM: true },
    { pins: { dir: 'B4', pwm: 'B5' }, invertPWM: true }
  ]);
  const rover = new Rover(motors);

  keypress(process.stdin);
  process.stdin.setEncoding('utf8');

  process.stdin.on('keypress', function (ch, key) {

    if (!key) { return; }

    switch (key.name) {
      case 'q':
        rover.stop();
        console.log('Bye-bye!');
        process.exit();
        break;
      case 'up':
        rover.forward();
        break;
      case 'down':
        rover.backward();
        break;
      case 'left':
        rover.left();
        break;
      case 'right':
        rover.right();
        break;
      case 'space':
        rover.stop();
        break;
      default:
        return;
    }
  });
});
