use serde_json::{Map, Value};
use serialport::{available_ports, SerialPort, SerialPortType};
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::{AppHandle, Emitter, Manager};

struct AppState {
    pub bt_conn: Arc<Mutex<Option<Box<dyn SerialPort>>>>,
}

#[derive(Debug, serde::Serialize)]
struct SendPacket {
    cmd: String,
    #[serde(flatten)]
    params: Map<String, Value>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct PortInfo {
    pub id: String,
    pub display: String,
}

fn parse_command(input: &str, app: AppHandle) -> Result<SendPacket, String> {
    let mut parts = input.trim().split_whitespace();
    let action = parts.next().ok_or("empty command")?.to_lowercase();
    let mut params = Map::new();

    match action.as_str() {
        "move" => {
            if let Some(dir) = parts.next() {
                let dir_code = match dir.to_lowercase().as_str() {
                    "forward" => "f",
                    "backward" => "b",
                    "left" => "L",
                    "right" => "R",
                    _ => dir,
                };
                params.insert("dir".to_string(), Value::String(dir_code.to_string()));
            }
            // parse flags like --steps 10 --speed 0.01 --height 25 --step_length 100
            let mut iter = parts.peekable();
            while let Some(token) = iter.next() {
                if token.starts_with("--") {
                    let key = token.trim_start_matches("--");
                    if let Some(val) = iter.peek() {
                        // try to parse numbers
                        if let Ok(n) = val.parse::<i64>() {
                            params.insert(key.to_string(), Value::Number(n.into()));
                        } else if let Ok(f) = val.parse::<f64>() {
                            params.insert(
                                key.to_string(),
                                Value::Number(serde_json::Number::from_f64(f).unwrap()),
                            );
                        } else {
                            params.insert(key.to_string(), Value::String(val.to_string()));
                        }
                        iter.next();
                    }
                }
            }
            // defaults if not provided
            params
                .entry("mode".to_string())
                .or_insert(Value::String("crawl".to_string()));
            params
                .entry("steps".to_string())
                .or_insert(Value::Number(10.into()));
            params
                .entry("step_length".to_string())
                .or_insert(Value::Number(80.into()));

            Ok(SendPacket {
                cmd: "walk".to_string(),
                params,
            })
        }
        "turn" => {
            if let Some(dir) = parts.next() {
                let dir_code = match dir.to_lowercase().as_str() {
                    "left" => "l",
                    "right" => "r",
                    _ => dir,
                };
                params.insert("dir".to_string(), Value::String(dir_code.to_string()));
            }
            params
                .entry("mode".to_string())
                .or_insert(Value::String("crawl".to_string()));
            params
                .entry("steps".to_string())
                .or_insert(Value::Number(10.into()));
            params
                .entry("step_length".to_string())
                .or_insert(Value::Number(80.into()));

            Ok(SendPacket {
                cmd: "walk".to_string(),
                params,
            })
        }
        "stop" => Ok(SendPacket {
            cmd: "stop".to_string(),
            params,
        }),
        "sit" | "stand" | "dance" | "wave" => Ok(SendPacket {
            cmd: action,
            params,
        }),
        _ => {
            let _ = app.emit("ws_sent_invalid", &action);
            Err("Invalid action.".to_string())
        }
    }
}

#[tauri::command]
async fn send_command(app: AppHandle, cmd: String) -> Result<(), String> {
    let packet = parse_command(&cmd, app.clone())?;
    let json = serde_json::to_string_pretty(&packet).unwrap();
    println!("{}", json);

    let state = app.state::<AppState>();
    let mut guard = state.bt_conn.lock().unwrap();

    if let Some(port) = guard.as_mut() {
        port.write_all(format!("{}\n", json).as_bytes())
            .map_err(|e| format!("Write failed: {}", e))?;
        Ok(())
    } else {
        Err("No Bluetooth connection established".into())
    }
}

#[tauri::command]
async fn scan_ports(_: AppHandle) -> Result<Vec<PortInfo>, ()> {
    Ok(list_ports())
}

#[tauri::command]
async fn connect_bt(app: AppHandle, id: String) -> Result<(), String> {
    println!("Attempting to connect to port: {}", id);

    match connect(&id) {
        Ok(serial_port) => {
            println!("Successfully opened port {}", id);
            let state = app.state::<AppState>();
            let mut guard = state.bt_conn.lock().unwrap();
            *guard = Some(serial_port);
            // optional: emit an event to frontend
            let _ = app.emit("bt_connected", &id);
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to open port {}: {}", id, e);
            let _ = app.emit("bt_connect_failed", &id);
            Err(e.to_string())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState {
                bt_conn: Arc::new(Mutex::new(None)),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            send_command,
            scan_ports,
            connect_bt
        ])
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn list_ports() -> Vec<PortInfo> {
    match available_ports() {
        Ok(ports) => ports
            .into_iter()
            .map(|p| match p.port_type {
                SerialPortType::UsbPort(info) => PortInfo {
                    id: p.port_name.clone(),
                    display: format!(
                        "{} (USB VID:{:04x} PID:{:#?})",
                        p.port_name, info.vid, info.product
                    ),
                },
                SerialPortType::BluetoothPort => PortInfo {
                    id: p.port_name.clone(),
                    display: format!("{} (Bluetooth)", p.port_name),
                },
                SerialPortType::PciPort => PortInfo {
                    id: p.port_name.clone(),
                    display: format!("{} (PCI)", p.port_name),
                },
                SerialPortType::Unknown => PortInfo {
                    id: p.port_name.clone(),
                    display: format!("{} (Unknown)", p.port_name),
                },
            })
            .collect(),
        Err(e) => {
            eprintln!("Error listing ports: {:?}", e);
            vec![]
        }
    }
}

pub fn connect(port_name: &str) -> Result<Box<dyn SerialPort>, Box<dyn std::error::Error>> {
    let port = serialport::new(port_name, 9600)
        .timeout(Duration::from_millis(2000))
        .open()?;
    Ok(port)
}
