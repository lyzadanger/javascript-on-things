const fs = require('fs');

const sysfsPath = '/sys/class/gpio';
const pinLED = '4';
const blinkTotal = 10;
var blinkCount = 0;
var status = false;

fs.writeFileSync(`${sysfsPath}/export`, pinLED);
fs.writeFileSync(`${sysfsPath}/gpio${pinLED}/direction`, 'out');

var blinker = setInterval(() => {
  if (status) {
    fs.writeFileSync(`${sysfsPath}/gpio${pinLED}/value`, '0');
    blinkCount++;
    if (blinkCount >= blinkTotal) {
      console.log('All done blinking');
      fs.writeFileSync(`${sysfsPath}/unexport`, '4');
      clearInterval(blinker);
    }
  } else {
    fs.writeFileSync(`${sysfsPath}/gpio${pinLED}/value`, '1');
  }
  status = !status;
}, 1000);
