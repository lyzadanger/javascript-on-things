/* global I2C1, B6, B7 */
I2C1.setup({ scl: B6, sda: B7});
var bmp = require('BMP085').connect(I2C1);
setInterval(function () {
  bmp.getPressure(function (readings) {
    console.log('Pressure: ' + readings.pressure + ' Pa');
    console.log('Temperature: ' + readings.temperature + ' C');
  });
}, 1000);
