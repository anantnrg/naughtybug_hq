use lazy_static::lazy_static;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio_tungstenite::tungstenite::protocol::Message;
use tauri::{AppHandle, Emitter};
use futures_util::stream::SplitSink;

type WsWrite = SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>;

lazy_static! {
    static ref WS_CONNECTION: Arc<Mutex<Option<WsWrite>>> =
        Arc::new(Mutex::new(None));
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
        write
            .send(Message::Text(cmd.into()))
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
