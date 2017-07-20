var five = require('johnny-five');
var board = new five.Board();

board.on('ready', () => {
  var sensor = new five.Sensor({
    pin: 'A0'
  });
  sensor.threshold = 5;
  sensor.on('change', () => {
    console.log(sensor.value);
  });
});
