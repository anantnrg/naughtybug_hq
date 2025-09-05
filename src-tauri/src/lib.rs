use lazy_static::lazy_static;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use futures_util::{SinkExt, StreamExt, stream::SplitSink};
use std::sync::Arc;
use tokio_tungstenite::tungstenite::protocol::Message;
use tauri::{AppHandle, Emitter};
use serde::Serialize;
use serde_json::Value;

type WsWrite = SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>;

lazy_static! {
    static ref WS_CONNECTION: Arc<Mutex<Option<WsWrite>>> =
        Arc::new(Mutex::new(None));
}

#[derive(Debug, Serialize)]
struct SendPacket {
    r#type: &'static str,
    action: String,
    params: Value,
}

fn parse_command(input: &str) -> Result<SendPacket, String> {
    let mut parts = input.trim().split_whitespace();
    let action = parts.next().ok_or("empty command")?.to_lowercase();
    let mut params = serde_json::Map::new();

    match action.as_str() {
        "move" => {
            if let Some(dir) = parts.next() {
                params.insert("direction".into(), Value::String(dir.to_lowercase()));
            }
            let mut iter = parts.peekable();
            while let Some(token) = iter.next() {
                if token.starts_with("--") {
                    let key = token.trim_start_matches("--");
                    if let Some(val) = iter.peek() {
                        params.insert(key.to_string(), Value::String(val.to_string()));
                        iter.next();
                    }
                }
            }
        }
        "turn" => {
            if let Some(dir) = parts.next() {
                params.insert("direction".into(), Value::String(dir.to_lowercase()));
            }
            let mut iter = parts.peekable();
            while let Some(token) = iter.next() {
                if token.starts_with("--") {
                    let key = token.trim_start_matches("--");
                    if let Some(val) = iter.peek() {
                        params.insert(key.to_string(), Value::String(val.to_string()));
                        iter.next();
                    }
                }
            }
        }
        "stop" | "dance" | "sit" | "stand" | "wave" => {}
        _ => return Err(format!("unknown command: {action}")),
    }

    Ok(SendPacket {
        r#type: "cmd",
        action,
        params: Value::Object(params),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_command, connect])
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn connect(app: AppHandle) -> Result<(), String> {
    let mut ws_opt = WS_CONNECTION.lock().await;

    if ws_opt.is_none() {
        let (ws_stream, _) = connect_async("ws://127.0.0.1:9001")
            .await
            .map_err(|e| e.to_string())?;

        let (write, mut read) = ws_stream.split();
        *ws_opt = Some(write);

        let app_handle = app.clone();
        tokio::spawn(async move {
            while let Some(msg) = read.next().await {
                match msg {
                    Ok(m) => {
                        let _ = app_handle.emit("ws_message", m.to_string());
                    }
                    Err(e) => {
                        eprintln!("WS read error: {e}");
                        break;
                    }
                }
            }
            let _ = app_handle.emit("connected", false);
        });

        app.emit("connected", true).map_err(|e| e.to_string())?;
    } else {
        app.emit("connected", true).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
async fn send_command(cmd: String) -> Result<(), String> {
    let mut ws_opt = WS_CONNECTION.lock().await;

        if let Some(write) = ws_opt.as_mut() {
            let packet = parse_command(&cmd)?;
            let json = serde_json::to_string(&packet).map_err(|e| e.to_string())?;
            write.send(Message::Text(json.into())).await.map_err(|e| e.to_string())?;
        }


    Ok(())
}
