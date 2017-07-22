/* global SPI1, B3, B5, B6, B7, B13, B14, B15, I2C1 */
var altitude = 300; // Local altitude in meters
var lcd;

function onInit () {
  clearInterval();
  I2C1.setup({ scl: B6, sda: B7});
  var bmp180 = require('BMP085').connect(I2C1);
  SPI1.setup({ sck: B3, mosi: B5 });
  lcd = require('PCD8544').connect(SPI1, B13, B14, B15, function () {
    setInterval(function () {
      bmp180.getPressure(function (readings) {
        draw(readings.temperature,
             bmp180.getSeaLevel(readings.pressure, altitude));
      });
    }, 1000);
  });
}

onInit();

function draw (temperature, pressure) {
  lcd.clear();
  var tempString = (temperature * (9 / 5) + 32).toFixed(1);
  var pressString = (pressure / 100).toFixed(1);

  lcd.drawLine(0, (lcd.getHeight() / 2), lcd.getWidth(), (lcd.getHeight() / 2));

  lcd.setFontVector(18);
  var tempWidth  = lcd.stringWidth(tempString);
  var pressWidth = lcd.stringWidth(pressString);
  var xTemp      = ((lcd.getWidth() - tempWidth) / 2);

  lcd.drawString(tempString, xTemp, 2);
  lcd.drawCircle(xTemp + tempWidth + 4, 5, 2);
  lcd.drawString(pressString, 0, (lcd.getHeight() / 2 + 2));

  lcd.setFontVector(8);
  lcd.drawString('F', xTemp + tempWidth + 2, 12);
  lcd.drawString('m', pressWidth + 3, (lcd.getHeight() / 2 + 12));
  lcd.drawString('b', pressWidth + 12, (lcd.getHeight() / 2 + 12));
  lcd.flip();
}
