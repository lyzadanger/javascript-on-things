const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const sensor = new five.Sensor({
    pin: 'A0'
  });
  sensor.threshold = 5;
  sensor.on('change', () => {
    console.log(sensor.value);
  });
});
