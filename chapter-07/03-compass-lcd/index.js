const five           = require('johnny-five');

const DECLINATION    = -14.28;
const UPDATE_FREQ_MS = 1000;
var lastDisplay      = null;

const board          = new five.Board();

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
  displayLine1 = 'HEADING: ';
  displayLine2 = Math.round(readings.heading) + ':circle:';
  return [displayLine1, displayLine2];
}

board.on('ready', () => {
  const compass        = new five.Compass({ controller: 'HMC5883L' });
  const lcd            = new five.LCD({ controller: 'JHD1313M1' });

  lcd.useChar('circle');

  function update () {
    var display = formatDisplay({
      heading: correctForDeclination(compass.heading, DECLINATION),
    });
    if (!lastDisplay || (lastDisplay.join('') != display.join(''))) {
      lcd.clear();
      lcd.cursor(0, 0).print(display[0]);
      lcd.cursor(1, 0).print(display[1]);
      lastDisplay = display;
    }
  }

  board.loop(UPDATE_FREQ_MS, update);
});
