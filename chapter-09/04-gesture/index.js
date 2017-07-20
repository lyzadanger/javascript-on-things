const five = require('johnny-five');
const Tessel = require('tessel-io');
const Gesture = require('./APDS9960')(five);

const board = new five.Board({ io: new Tessel() });

board.on('ready', () => {
  const gesture = new Gesture({ pin: 'A2'});
  gesture.on('left', () => console.log('left'));
  gesture.on('right', () => console.log('right'));
  gesture.on('up', () => console.log('up'));
  gesture.on('down', () => console.log('down'));
});
