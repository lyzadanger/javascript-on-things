/* global trace */
import Pins from 'pins';
import { WebSocketServer } from 'websocket';

var formatMsg = heading => JSON.stringify({ heading: heading.toFixed(2) });
var main = {
  onLaunch () {
    Pins.configure({
      compass: {
        require: 'HMC5883L',
        pins: {
          compass: { sda: 13, clock: 14 },
          ground: { pin: 12, type: 'Ground' },
          power: { pin: 11, type: 'Power' }
        }
      },
    }, success => {
      if (success) {
        const clients = new Set();
        const wss = new WebSocketServer(80);
        let lastResult = 0;

        wss.onStart = client => {
          clients.add(client);
          client.send(formatMsg(lastResult));
          client.onclose = () => clients.remove(client);
        };

        Pins.repeat('/compass/read', 500, result => {
          if (Math.abs(result - lastResult) >= 0.5) {
            clients.forEach(recipient => {
              recipient.send(formatMsg(result));
            });
          }
          lastResult = result;
        });
      } else {
        trace('Failed to configure\n');
      }
    });
  }
};

export default main;
