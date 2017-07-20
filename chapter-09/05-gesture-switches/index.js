const five = require('johnny-five');
const Tessel = require('tessel-io');
const Gesture = require('./APDS9960')(five);
const RemoteSwitch = require('./RemoteSwitch')(five);
const RemoteSwitches = require('./RemoteSwitches')(five, RemoteSwitch);

const board = new five.Board({ io: new Tessel() });

board.on('ready', () => {
  const gesture = new Gesture({ pin: 'A2'});
  const switches = new RemoteSwitches([
    new RemoteSwitch({ pins : { on: 'A3', off: 'A4' } }),
    new RemoteSwitch({ pins: { on: 'A5', off: 'A6' } }),
    new RemoteSwitch({ pins: { on: 'A7', off: 'B0' } })
  ]);
  gesture.on('up', () => switches.on());
  gesture.on('down', () => switches.off());
  gesture.on('right', () => switches.on(1));
  gesture.on('left', () => switches.off(1));
});
