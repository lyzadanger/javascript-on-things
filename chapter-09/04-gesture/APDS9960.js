// Datasheet: https://cdn.sparkfun.com/assets/learn_tutorials/3/2/1/Avago-APDS-9960-datasheet.pdf
const Emitter = require('events').EventEmitter;
const util    = require('util');

const I2C_ADDR = 0x39; // Sensor's hardwired I2C address (p.8)
const DEVICE_ID = 0xAB; // The device will report this ID (p.25)

const REGISTERS = { // Register addresses
  ENABLE   : 0x80, // Enable different sensors/features (p.20)
  WTIME    : 0x83, // Wait time config value (p.21)
  PPULSE   : 0x8E, // Proximity pulse count and length (p.23)
  CONFIG2  : 0x90, // Second configuration register (p.24), specifically for LED boost
  DEVICE_ID: 0x92, // Contains device ID (0xAB) (p.25)
  GPENTH   : 0xA0, // Entry proximity threshold for gestures (p.27)
  GEXTH    : 0xA1, // Exit proximity threshold for gestures (p.28)
  GCONF1   : 0xA2, // Gesture configuration 1: gesture detection masking (p.28)
  GCONF2   : 0xA3, // Gesture configuration 2: gain, LED drive, gesture wait time (p.29)
  GOFFSET_U: 0xA4, // Gesture offset (up) (p.30)
  GOFFSET_D: 0xA5, // Gesture offset (down) (p.30)
  GPULSE   : 0xA6, // Gesture Pulse count and length (p.31)
  GOFFSET_L: 0xA7, // Gesture offset (left) (p.30)
  GOFFSET_R: 0xA9, // Gesture offset (right) (p.31)
  GCONF4   : 0xAB, // Gesture configuration 4: interrupts, mode enable (p.32)
  GFLVL    : 0xAE, // Gesture FIFO level; reports # of datasets in FIFO (p.32)
  GSTATUS  : 0xAF, // Gesture status info, bit 0 indicates available valid data (p.33)
  GFIFO_U  : 0xFC, // First FIFO register for data (RAM)—read data from here (p.33)
};

const FLAGS = {
  GFIFOTH  : 0b10000000, // FIFO threshold            : trigger interrupt after 4 datasets in FIFO (GCONF1 <7:6> p.28)
  GGAIN    : 0b01000000, // Gesture gain control      : 4x (GCONF2 <6:5> p.29)
  GLDRIVE  : 0b00000000, // Gesture LED drive strength: 100mA (GCONF2 <4:3> p.29)
  GWTIME   : 0b00000001, // Gesture wait time         : 2.8ms (GCONF2 <2:0> p.29)
  GPLEN    : 0b11000000, // Gesture pulse length      : 32µs (GPULSE <7 :6> p.31)
  GPULSE   : 0b00001001, // Gesture pulse count       : 10 (9 + 1) (GPULSE <5:0> p.31)
  GVALID   : 0b00000001, // GSTATUS register value indicates valid data if 0th bit is 1
  PPLEN    : 0b10000000, // Proximity pulse length    : 16µs (PPULSE <7 :6> p.23)
  PPULSE   : 0b10001001, // Proximity pulse count     : 10 (9 + 1) (PPULSE <5:0> p.23)
  LED_BOOST: 0b00110000, // LED drive boost           : 300% (CONFIG2 <5:4> p.24),
  GIEN     : 0b00000010, // Gesture interrupt enable  : yes (GCONF4 <1> p.32)
  GMODE    : 0b00000001, // Gesture mode              : yes! (GCONF4 <0> p.32),
  ENABLE   : 0b01001101, // Enable features           : Gesture, Wait, Proximity, Power on (ENABLE, p.20)
};

const SETUP_DEFAULTS = { // During setup, (value) is written to each register (key)
  ENABLE   : 0x00, // Disable all things, effectively turning the chip off (p. 20)
  GPENTH   : 40, // Entry proximity threshold (this number is magic ATM)
  GEXTH    : 30, // Exit proximity threshold (this number is magic ATM)
  GCONF1   : FLAGS.GFIFOTH, // FIFO interrupt threshold
  GCONF2   : FLAGS.GGAIN | FLAGS.GLDRIVE | FLAGS.GWTIME, // Gesture gain, LED drive, wait time
  GOFFSET_U: 0x00, // no offset
  GOFFSET_D: 0x00, // no offset
  GOFFSET_L: 0x00, // no offset
  GOFFSET_R: 0x00, // no offset
  GPULSE   : FLAGS.GPLEN | FLAGS.GPULSE // pulse count and length,
};

const ENABLE_VALUES = { // During enable, each (value) is written to register (key)
  WTIME  : 0xFF, // Wait time between cycles in low-power mode: 2.78ms (p. 21)
  PPULSE : FLAGS.PPLEN | FLAGS.PPULSE, // Proximity pulse length and count
  CONFIG2: FLAGS.LED_BOOST,
  GCONF4 : FLAGS.GIEN | FLAGS.GMODE,
  ENABLE : FLAGS.ENABLE
};

// For processing read data
const GESTURE_THRESHOLD_OUT = 30;
const GESTURE_SENSITIVITY = 10;

module.exports = function (five) {
  return (function () {
    /**
     * @param {Object} opts Options: pin, address
     * pin denotes interrupt pin connection
     *
     * Sample initialization:
     * new APDS9960('A2');
     * new APDS9960({ pin: 'A2'});
     *
     */
    function APDS9960 (opts) {
      if (!(this instanceof APDS9960)) {
        return new APDS9960(opts);
      }
      five.Board.Component.call(this, opts = five.Board.Options(opts));
      this.interruptState = 1; // Interrupt is active LOW
      opts.address        = opts.address || I2C_ADDR;
      this.address        = opts.address;
      this.io.i2cConfig(opts); // Get I2C comms started for the device

      this.io.i2cReadOnce(this.address, REGISTERS.DEVICE_ID, 1, data => {
        if (data[0] !== DEVICE_ID) { // DEVICE_ID register should return 0xAB
          throw new Error('Unable to establish connection with APDS9960');
        }
      });
      this.resetGesture();
      this.setup(this.enable);
    }

    util.inherits(APDS9960, Emitter);

    APDS9960.prototype.resetGesture = function () {
      this.gestureData = {
        raw: [],
        deltas: {},
        movements: { // A gesture can have movements along more than one axis
          vertical  : false,
          horizontal: false,
          up        : false,
          down      : false,
          left      : false,
          right     : false
        },
        valid: false, // Was gesture decoding successful?
        direction: undefined
      };
    };

    APDS9960.prototype.setup = function (callback) {
      for (var rKey in SETUP_DEFAULTS) {
        this.io.i2cWrite(this.address,
          REGISTERS[rKey], [SETUP_DEFAULTS[rKey]]);
      }
      if (typeof callback === 'function') {
        callback.call(this);
      }
    };

    APDS9960.prototype.enable = function () {
      // Set up interrupt handling
      this.io.pinMode(this.pin, this.io.MODES.INPUT);
      // Interrupts from device are active LOW—when pin goes LOW we should act
      this.io.digitalRead(this.pin, data => {
        if (data !== this.interruptState && data === 0) {
          this.readGesture();
        }
        this.interruptState = data;
      });
      for (var rKey in ENABLE_VALUES) {
        this.io.i2cWrite(this.address,
          REGISTERS[rKey], [ENABLE_VALUES[rKey]]);
      }
    };

    APDS9960.prototype.readGesture = function () {
      // GSTATUS value determines whether valid data is available (p.33)
      this.io.i2cReadOnce(this.address, REGISTERS.GSTATUS, 1, status => {
        if (status & FLAGS.GVALID === FLAGS.GVALID) {
          // There should be valid data in the FIFO
          // GFLVL will report how many datasets are in the FIFO (p.32)
          this.io.i2cReadOnce(this.address, REGISTERS.GFLVL, 1, fifoLevel => {
            // Read the number of 4-byte samples indicated by sampleCount
            // And split them out into their directional components
            this.io.i2cReadOnce(this.address,
              REGISTERS.GFIFO_U, (fifoLevel * 4), rawData => {
                for (var i = 0; i < rawData.length; i += 4) {
                  this.gestureData.raw.push({
                    up   : rawData[i],
                    down : rawData[i + 1],
                    left : rawData[i + 2],
                    right: rawData[i + 3]
                  });
                }
                return this.readGesture(); // Keep reading data...
              });
          });
        } else { // No (more) data to gather about this gesture
          this.processGesture();
          this.decodeGesture();
          this.resetGesture();
        }
      });
    };

    APDS9960.prototype.processGesture = function () {
      const raw = this.gestureData.raw;
      const directionDelta = function (el1, el2, dir1, dir2) {
        var el2r = ((el2[dir1] - el2[dir2]) * 100) / (el2[dir1] + el2[dir2]);
        var el1r = ((el1[dir1] - el1[dir2]) * 100) / (el1[dir1] + el1[dir2]);
        return el2r - el1r;
      };
      const exceedsThreshold = raw.filter(sample => {
        return (sample.up > GESTURE_THRESHOLD_OUT &&
                sample.down > GESTURE_THRESHOLD_OUT &&
                sample.left > GESTURE_THRESHOLD_OUT &&
                sample.right > GESTURE_THRESHOLD_OUT);
      });
      if (!exceedsThreshold.length || raw.length < 4) {
        // If not enough data or none exceed threshold, nothing to do
        // This will result in gesture data being ignored and discarded
        return false;
      }

      const first = exceedsThreshold[0];
      const last = exceedsThreshold[exceedsThreshold.length - 1];
      const deltas = {
        upDown: directionDelta(first, last, 'up', 'down'),
        leftRight: directionDelta(first, last, 'left', 'right')
      };
      this.gestureData.deltas = deltas;
    };

    APDS9960.prototype.decodeGesture = function () {
      const deltas = this.gestureData.deltas;
      const verticalMotion = Math.abs(deltas.upDown);
      const horizontalMotion = Math.abs(deltas.leftRight);
      if (verticalMotion > GESTURE_SENSITIVITY) {
        this.gestureData.valid = true;
        this.gestureData.movements.vertical = true;
        this.gestureData.movements.up = (deltas.upDown >= 0);
        this.gestureData.movements.down = (deltas.upDown < 0);
      }
      if (horizontalMotion > GESTURE_SENSITIVITY) {
        this.gestureData.valid = true;
        this.gestureData.movements.horizontal = true;
        this.gestureData.movements.left = (deltas.leftRight >= 0);
        this.gestureData.movements.right = (deltas.leftRight < 0);
      }
      if (this.gestureData.valid) {
        if (verticalMotion > horizontalMotion) {
          this.gestureData.direction = (this.gestureData.movements.up) ?
            'up' : 'down';
        } else {
          this.gestureData.direction = (this.gestureData.movements.left) ?
          'left' : 'right';
        }
      }
      // Emit a directional event if there is a direction
      if (this.gestureData.direction) {
        this.emit(this.gestureData.direction, this.gestureData);
      }
      // Always emit a generic gesture event, even if decoding failed
      this.emit('gesture', this.gestureData);
    };

    return APDS9960;
  }());
};
