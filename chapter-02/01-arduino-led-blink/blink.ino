void setup() {
  pinMode(13, OUTPUT); <1>
}
void loop() {
  digitalWrite(13, HIGH); <2>
  delay(500); <3>
  digitalWrite(13, LOW); <4>
  delay(500);
}
