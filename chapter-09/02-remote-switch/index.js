const five = require('johnny-five');
const Tessel = require('tessel-io');
const RemoteSwitch = require('./RemoteSwitch')(five);

const board = new five.Board({ io: new Tessel() });

board.on('ready', () => {
  const switch1 = new RemoteSwitch({
    pins : { on: 'A0', off: 'A1' }
  });
  const switch2 = new RemoteSwitch({
    pins: { on: 'A2', off: 'A3' }
  });
  const switch3 = new RemoteSwitch({
    pins: { on: 'A4', off: 'A5' }
  });
  board.repl.inject({
    switch1: switch1,
    switch2: switch2,
    switch3: switch3
  });
});
