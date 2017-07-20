const five = require('johnny-five');
const Tessel = require('tessel-io');
const board = new five.Board({ io: new Tessel() });

board.on('ready', () => {
  board.i2cConfig({ address: 0x39 });
  board.i2cReadOnce(0x39, 0x92, 1, data => {
    if (data[0] !== 0xAB) { // DEVICE_ID register should return 0xAB
      throw new Error('Unable to establish connection with APDS9960');
    } else {
      console.log('Connected to APDS-9960!');
    }
  });
});
