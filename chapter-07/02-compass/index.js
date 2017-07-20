const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const compass = new five.Compass({ controller: 'HMC5883L' });
  compass.on('change', () => {
    console.log(compass.bearing);
  });
});
