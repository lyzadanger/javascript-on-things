module.exports = function (five) {
  return (function () {
    function RemoteSwitch (opts) {
      if (!(this instanceof RemoteSwitch)) {
        return new RemoteSwitch(opts);
      }
      five.Board.Component.call(this, opts = five.Board.Options(opts));

      this.pins     = opts.pins;
      this.duration = opts.duration || 500;
      this.isOn     = undefined;
      this.isActive = false;
      this.queue    = [];

      this.io.pinMode(this.pins.on, this.io.MODES.OUTPUT);
      this.io.pinMode(this.pins.off, this.io.MODES.OUTPUT);
    }

    RemoteSwitch.prototype.toggle = function (turnOn, callback) {
      if (this.isActive) {
        this.queue.push([turnOn, callback]);
        return;
      }
      this.isActive = true;
      if (typeof turnOn === 'undefined') {
        turnOn = !this.isOn;
      }
      const pin = (turnOn) ? this.pins.on : this.pins.off;
      this.io.digitalWrite(pin, 1);
      setTimeout(() => {
        this.io.digitalWrite(pin, 0);
        this.isActive = false;
        this.isOn = !!turnOn;
        if (typeof callback === 'function') {
          callback();
        }
        if (this.queue.length) {
          this.toggle.apply(this, this.queue.shift());
        }
      }, this.duration);
    };

    RemoteSwitch.prototype.on = function (callback) {
      this.toggle(true, callback);
    };
    RemoteSwitch.prototype.off = function (callback) {
      this.toggle(false, callback);
    };
    return RemoteSwitch;
  }());
};
