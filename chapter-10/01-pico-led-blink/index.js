/* global LED1, LED2, digitalWrite */
var ledStatus = false;
function toggleLED () {
  if (!ledStatus) {
    digitalWrite(LED1, 1);
    digitalWrite(LED2, 0);
  } else {
    digitalWrite(LED1, 0);
    digitalWrite(LED2, 1);
  }
  ledStatus = !ledStatus;
  setTimeout(toggleLED, 500);
}

toggleLED();
