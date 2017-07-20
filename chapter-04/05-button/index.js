const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const pushButton = new five.Button(2);
  pushButton.on('down', () => {
    console.log('I have been pressed!');
  });
});
