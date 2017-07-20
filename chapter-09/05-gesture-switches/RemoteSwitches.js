const util    = require('util');

module.exports = function (five, RemoteSwitch) {
  return (function () {
    function RemoteSwitches (numsOrObjects) {
      if (!(this instanceof RemoteSwitches)) {
        return new RemoteSwitches(numsOrObjects);
      }
      Object.defineProperty(this, 'type', {
        value: RemoteSwitch
      });
      five.Collection.call(this, numsOrObjects);
      this.isActive = false;
      this.queue = [];
    }

    util.inherits(RemoteSwitches, five.Collection);
    five.Collection.installMethodForwarding(
      RemoteSwitches.prototype, RemoteSwitch.prototype
    );

    const write = function (whichSwitch, turnOn) {
      if (this.isActive) {
        this.queue.push([whichSwitch, turnOn]);
        return;
      }
      this.isActive = true;
      whichSwitch.toggle.call(whichSwitch, turnOn, () => {
        this.isActive = false;
        if (this.queue.length) {
          write.apply(this, this.queue.shift());
        }
      });
    };

    RemoteSwitches.prototype.toggle = function (idx, turnOn) {
      if (typeof idx !== 'undefined' && this[idx]) {
        write.call(this, this[idx], turnOn);
      } else {
        this.each(whichSwitch => write.call(this, whichSwitch, turnOn));
      }
    };

    RemoteSwitches.prototype.on = function (idx) { this.toggle(idx, true); };
    RemoteSwitches.prototype.off = function (idx) { this.toggle(idx, false); };
    return RemoteSwitches;
  }());
};
