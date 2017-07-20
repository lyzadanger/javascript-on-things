const five = require('johnny-five');
const Tessel = require('tessel-io');

const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  const weatherSensor = new five.Multi({
    controller: 'BMP180'
  });
  weatherSensor.thermometer.on('change', function () {
    console.log(this.F);
  });
});
