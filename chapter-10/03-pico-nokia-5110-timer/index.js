/* global B3, B5, B13, B14, B15, SPI1, setWatch, BTN */
var lcd;
var progress      = 0;
var frameDuration = 200; // ms
var timerSeconds  = 10;
var timerLength   = timerSeconds * 1000 / frameDuration;
var timerActive   = false;

function onInit () {
  // Set up SPI for LCD
  SPI1.setup({ sck: B3, mosi: B5 });
  lcd = require('PCD8544').connect(SPI1, B13, B14, B15);
}

function draw () {
  progress++;
  if (progress > timerLength) {
    clearInterval();
    timerActive = false;
  }
  var rightEdge = Math.floor((progress / timerLength) * 84) - 1;
  lcd.clear();
  lcd.drawRect(0, 19, 83, 27);
  lcd.fillRect(0, 19, rightEdge, 27);
  lcd.flip();
}

onInit();

setWatch (function (e) {
  if (!timerActive) {
    progress = 0;
    setInterval(draw, frameDuration);
    timerActive = true;
  }
}, BTN, { repeat: true });
