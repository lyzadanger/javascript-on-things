var five = require('johnny-five');
var board = new five.Board();

board.on('ready', () => {
  var pushButton = new five.Button(2);
  pushButton.on('down', () => {
    console.log('I have been pressed!');
  });
});
