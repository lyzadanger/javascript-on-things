const five     = require('johnny-five');
const BeagleBone = require('beaglebone-io');
const express  = require('express');
const SocketIO = require('socket.io');

const path = require('path');
const http = require('http');
const os   = require('os');

const app    = new express();
const server = new http.Server(app);
const socket = new SocketIO(server);
app.use(express.static(path.join(__dirname, '/app')));

const board = new five.Board({ io: new BeagleBone() });

board.on('ready', () => {
  const weatherSensor = new five.Multi({
    controller: 'BMP180',
    freq: 5000
  });

  socket.on('connection', client => {
    weatherSensor.on('change', () => {
      client.emit('weather', {
        temperature: weatherSensor.thermometer.F,
        pressure: (weatherSensor.barometer.pressure * 10)
      });
    });
  });

  server.listen(3000, () => {
    console.log(`http://${os.networkInterfaces().eth0[0].address}:4000`);
  });
});
