#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>

const char* ssid = "ESPsoftAP_01";
const char* password = "pass-to-soft-AP";

WebSocketsServer webSocket = WebSocketsServer(81);  // websocket port

void setup() {
  Serial.begin(115200);
  Serial.println();

  // Start soft-AP
  boolean result = WiFi.softAP(ssid, password);
  if (result) {
    Serial.println("Soft-AP ready!");
  } else {
    Serial.println("Soft-AP failed!");
  }

  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started on port 81");
}

void loop() {
  webSocket.loop();  // handle websocket events
}

// Handle websocket events
void webSocketEvent(uint8_t client_num, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("Client %u disconnected\n", client_num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(client_num);
        Serial.printf("Client %u connected from %d.%d.%d.%d\n", client_num, ip[0], ip[1], ip[2], ip[3]);
        webSocket.sendTXT(client_num, "Ahoy! You connected to the ESP8266 WebSocket!");
      }
      break;
    case WStype_TEXT:
      Serial.printf("Received from client %u: %s\n", client_num, payload);
      // Echo it back
      webSocket.sendTXT(client_num, payload);
      break;
  }
}
