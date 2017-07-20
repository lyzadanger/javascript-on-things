const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const sensor = new five.Sensor({
    pin: 'A0'
  });
  sensor.on('data', () => {
    console.log(sensor.value);
  });
});
