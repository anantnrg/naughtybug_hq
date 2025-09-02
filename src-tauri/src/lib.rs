use lazy_static::lazy_static;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use futures_util::sink::SinkExt;
use std::sync::Arc;
use tokio_tungstenite::tungstenite::protocol::Message;
use tauri::{AppHandle, Emitter};

lazy_static! {
    static ref WS_CONNECTION: Arc<Mutex<Option<WebSocketStream<MaybeTlsStream<TcpStream>>>>> =
        Arc::new(Mutex::new(None));
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_command])
        .invoke_handler(tauri::generate_handler![connect])
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
        *ws_opt = Some(ws_stream);
        app.emit("connected", true).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
async fn send_command(cmd: String) -> Result<(), String> {
    let mut ws_opt = WS_CONNECTION.lock().await;

    if let Some(ws) = ws_opt.as_mut() {
        ws.send(Message::Text(cmd.into()))
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
