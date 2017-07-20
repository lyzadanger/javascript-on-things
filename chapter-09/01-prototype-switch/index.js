const five = require('johnny-five');
const Tessel = require('tessel-io');

const board = new five.Board({ io: new Tessel() });

const switchPins = {
  on: 'A0',
  off: 'A1'
};
const pressDuration = 500;

board.on('ready', () => {

  const pressButton = function (pin) {
    board.digitalWrite(pin, 1);
    setTimeout(() => {
      board.digitalWrite(pin, 0);
    }, pressDuration);
  };
  const turnOn = function () {
    pressButton(switchPins.on);
  };
  const turnOff = function () {
    pressButton(switchPins.off);
  };

  board.pinMode(switchPins.on, five.Pin.OUTPUT);
  board.pinMode(switchPins.off, five.Pin.OUTPUT);

  board.repl.inject({
    turnOn: turnOn,
    turnOff: turnOff
  });
});
