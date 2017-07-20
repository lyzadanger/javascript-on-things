const five  = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const nightlight = new five.Led(3);
  const ldr        = new five.Light({ pin : 'A0', freq: 500 });
  var dimmest = 1024,
    brightest = 0;
  ldr.on('change', () => {
    if (ldr.value < dimmest)   { dimmest   = ldr.value; }
    if (ldr.value > brightest) { brightest = ldr.value; }

    const relativeValue = five.Fn.scale(ldr.value, dimmest, brightest, 0, 511);
    if (relativeValue <= 255) {
      nightlight.brightness((relativeValue >> 1) ^ 255);
    } else {
      nightlight.off();
    }
  });
});
