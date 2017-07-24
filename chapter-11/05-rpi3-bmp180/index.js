const five = require('johnny-five');
const Raspi = require('raspi-io');

const board = new five.Board({
  io: new Raspi()
});

board.on('ready', () => {
  const bmp180 = new five.Multi({
    controller: 'BMP180'
  });
  bmp180.on('change', () => {
    var temperature = bmp180.thermometer.fahrenheit.toFixed(2);
    var pressure    = bmp180.barometer.pressure.toFixed(2);
    console.log(`${temperature}°F | ${pressure}kPa`);
  });
});
