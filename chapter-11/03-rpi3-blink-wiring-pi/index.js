const wpi = require('wiring-pi');
const ledPin = 7;
const blinkTotal = 10;
var blinkCount = 0;
var status = false;

wpi.setup('wpi');
wpi.pinMode(ledPin, wpi.OUTPUT);

var blinker = setInterval(() => {
  wpi.digitalWrite(ledPin, status);
  if (!status) {
    blinkCount++;
    if (blinkCount >= blinkTotal) {
      console.log('All done blinking!');
      clearInterval(blinker);
    }
  }
  status = +!status;
}, 1000);
