const request = require('request');
const five    = require('johnny-five');

const API_KEY = 'YOUR API KEY HERE';
const LAT     = '43.3463760';
const LONG    = '-72.6395340';
const API_URL = 'https://api.darksky.net/forecast';

const board   = new five.Board();

board.on('ready', () => {
  console.log('Powered by Dark Sky: https://darksky.net/poweredby/');
  const rgb        = new five.Led.RGB({ pins: [3, 5, 6] });
  const requestURL = `${API_URL}/${API_KEY}/${LAT},${LONG}`;

  request(requestURL, function (error, response, body) {
    if (error) {
      console.error(error);
    } else if (response.statusCode === 200) {
      const forecast   = JSON.parse(body);
      const daily      = forecast.daily.data;
      const willBeDamp = daily[1].precipProbability > 0.2;
      const tempDelta  = daily[1].temperatureMax - daily[0].temperatureMax;
      console.log(forecast);

      if (tempDelta > 4) {
        rgb.color('#ff0000'); // warmer
      } else if (tempDelta < -4) {
        rgb.color('#ffffff'); // colder
      } else {
        rgb.color('#00ff00'); // about the same
      }
      if (willBeDamp) { rgb.strobe(1000); }
    }
  });
});
