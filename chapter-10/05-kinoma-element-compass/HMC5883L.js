var registers = {
  CRA: 0x00,
  CRB: 0x01,
  MODE: 0x02,
  READ: 0x03,
};

function int16 (high, low) {
  // https://github.com/rwaldron/johnny-five/blob/495e815e47d06e388f26edb884c10b315bee9346/lib/fn.js#L208
  var result = (high << 8) | low;
  return result >> 15 ? ((result ^ 0xFFFF) + 1) * -1 : result;
}

var toHeading = function (x, y) {
  /**
   *
   * Applications of Magnetoresistive Sensors in Navigation Systems
   * by Michael J. Caruso of Honeywell Inc.
   * http://www.ssec.honeywell.com/position-sensors/datasheets/sae.pdf
   *
   *
   * Azimuth (x=0, y<0)   = 90.0 (3)
   * Azimuth (x=0, y>0)   = 270.0
   * Azimuth (x<0)        = 180 - [arcTan(y/x)]*180/PI
   * Azimuth (x>0, y<0)   = - [arcTan(y/x)]*180/PI
   * Azimuth (x>0, y>0)   = 360 - [arcTan(y/x)]*180/PI
   *
   */
  /**
   *
   * http://bildr.org/2012/02/hmc5883l_arduino/
   * @type {[type]}
   * Copyright (C) 2011 Love Electronics (loveelectronics.co.uk)
   This program is free software: you can redistribute it and/or modify it under the terms of the version 3 GNU General Public License as published by the Free Software Foundation.
   This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
   You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
   */

  var radians = Math.atan2(y, x);

  if (radians < 0) {
    radians += 2 * Math.PI;
  }

  if (radians > 2 * Math.PI) {
    radians -= 2 * Math.PI;
  }

  return radians * (180 / Math.PI);
};


exports.pins = {
  compass: {type: 'I2C', address: 0x1E }
};

exports.configure = function () {
  this.compass.init();
  // Derived from Johnny-Five Compass class:
  // https://github.com/rwaldron/johnny-five/blob/495e815e47d06e388f26edb884c10b315bee9346/lib/compass.js#L43
  this.compass.writeByteDataSMB(registers.CRA, 0x70);
  this.compass.writeByteDataSMB(registers.CRB, 0x40);
  this.compass.writeByteDataSMB(registers.MODE, 0x00);
};

exports.close = function () {
  this.compass.close();
};

exports.read = function () {
  // Derived from Johnny-Five Compass class:
  // https://github.com/rwaldron/johnny-five/blob/495e815e47d06e388f26edb884c10b315bee9346/lib/compass.js#L60
  var bytes = this.compass.readBlockDataSMB(registers.READ, 6, 'Array');
  var data = {
    x: int16(bytes[0], bytes[1]),
    y: int16(bytes[4], bytes[5]),
    z: int16(bytes[2], bytes[3])
  };
  return toHeading(data.x, data.y);
};
