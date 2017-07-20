const five           = require('johnny-five');
const board          = new five.Board();

const DECLINATION    = -14.28;
const UPDATE_FREQ_MS = 1000;
const SHAKE_THRESHOLD = 1.15;

var altDisplay     = false;
var lastJiggleTime = null;
var lastDisplay    = null;

function correctForDeclination (heading, declination) {
  var corrected = heading + declination;
  corrected += 360;
  while (corrected >= 360) {
    corrected -= 360;
  }
  return corrected;
}

function formatDisplay (readings, altDisplay) {
  var displayLine1, displayLine2;
  if (altDisplay) {
    displayLine1 = 'HEADING: ';
    displayLine2 = Math.round(readings.heading) + ':circle:';
  } else {
    displayLine1 = 'TEMP/PRESSURE:';
    displayLine2 = readings.temperature.toFixed(1) + ':circle:F';
    // Convert kPa to mb
    displayLine2 += ' / ' + Math.round(10 * readings.pressure) + 'mb';
  }
  return [displayLine1, displayLine2];
}

board.on('ready', () => {
  const compass        = new five.Compass({ controller: 'HMC5883L' });
  const lcd            = new five.LCD({ controller: 'JHD1313M1' });
  const multi          = new five.Multi({ controller: 'BMP180' });
  const accel          = new five.Accelerometer({ controller: 'ADXL345' });

  lcd.useChar('circle');

  function update () {
    var display = formatDisplay({
      temperature: multi.thermometer.F,
      heading    : correctForDeclination(compass.heading, DECLINATION),
      pressure   : multi.barometer.pressure
    }, altDisplay);
    if (!lastDisplay || (lastDisplay.join('') != display.join(''))) {
      lcd.clear();
      lcd.cursor(0, 0).print(display[0]);
      lcd.cursor(1, 0).print(display[1]);
      lastDisplay = display;
    }
  }

  board.loop(UPDATE_FREQ_MS, update);

  accel.on('acceleration', () => {
    if (accel.acceleration > SHAKE_THRESHOLD) {
      var jiggleTime = Date.now();
      if (!lastJiggleTime || jiggleTime > (lastJiggleTime + 1000)) {
        altDisplay     = !altDisplay;
        lastJiggleTime = Date.now();
        update();
      }
    }
  });
});
