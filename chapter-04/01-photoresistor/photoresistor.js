var five = require('johnny-five');
var board = new five.Board();

board.on('ready', () => {
  var sensor = new five.Sensor({
    pin: 'A0'
  });
  sensor.on('data', () => {
    console.log(sensor.value);
  });
});
