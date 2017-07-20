const five = require('johnny-five');
const board = new five.Board();

const DEFAULT_TIMER = 60000;
const UPPER_LIMIT   = 99 * 60000;
const LOWER_LIMIT   = 1000;

board.on('ready', () => {
  const downButton = new five.Button(2);
  const upButton   = new five.Button(3);
  const goButton   = new five.Button(4);
  const lcd        = new five.LCD([7, 8, 9, 10, 11, 12]);
  const alertLED   = new five.Led(6);
  var remaining, timer, timeString, lastTimeString, timestamp, lastTimestamp;

  function init () {
    remaining      = DEFAULT_TIMER;
    lastTimeString = '00:00';
    timeString     = '';
    showRemaining();
  }

  function showRemaining () {
    var minutes, seconds, minPad, secPad;
    minutes    = Math.floor(remaining / 60000);
    seconds    = Math.floor((remaining % 60000) / 1000);
    minPad     = (minutes < 10) ? '0' : '';
    secPad     = (seconds < 10) ? '0' : '';
    timeString = `${minPad}${minutes}:${secPad}${seconds}`;
    if (timeString != lastTimeString) {
      lcd.cursor(0, 0).print(timeString);
    }
  }

  function adjustTime (delta) {
    remaining += delta;
    if (remaining < LOWER_LIMIT) {
      remaining = LOWER_LIMIT;
    } else if (remaining > UPPER_LIMIT) {
      remaining = UPPER_LIMIT;
    }
    showRemaining();
  }

  function start () {
    alertLED.stop().off();
    lcd.clear();
    timestamp = Date.now();
    timer     = setInterval(tick, 250);
    tick();
  }

  function pause () {
    timer = clearInterval(timer);
    lcd.cursor(0, 9).print('PAUSED');
  }

  function tick () {
    lastTimestamp = timestamp;
    timestamp     = Date.now();
    remaining -= (timestamp - lastTimestamp);
    if (remaining <= 0) {
      timer = clearInterval(timer);
      chime();
      init();
    }
    showRemaining();
  }

  function chime () {
    alertLED.pulse();
    lcd.cursor(0, 9).print('DONE!');
  }

  downButton.on('press', () => { // remove a second
    adjustTime(-1000);
  });
  upButton.on('press', () => { // add a second
    adjustTime(1000);
  });
  goButton.on('press', () => {
    if (!timer) {
      start();
    } else {
      pause();
    }
  });
  init();
});
