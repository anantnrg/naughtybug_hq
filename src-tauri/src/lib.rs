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
        "leg" => {
            // expect: leg <id> <action|x y z>
            if let Some(id_str) = parts.next() {
                if let Ok(id) = id_str.parse::<i64>() {
                    params.insert("id".to_string(), Value::Number(id.into()));
                }
            }

            if let Some(next) = parts.next() {
                // if it's one of the action keywords
                match next {
                    "up" | "dn" | "mf" | "bk" | "mid" => {
                        params.insert("action".to_string(), Value::String(next.to_string()));
                    }
                    // otherwise, try to parse as x y z floats
                    _ => {
                        let x = next.parse::<f64>().ok();
                        let y = parts.next().and_then(|s| s.parse::<f64>().ok());
                        let z = parts.next().and_then(|s| s.parse::<f64>().ok());
                        if let Some(xv) = x {
                            params.insert("x".to_string(), Value::Number(
                                serde_json::Number::from_f64(xv).unwrap()
                            ));
                        }
                        if let Some(yv) = y {
                            params.insert("y".to_string(), Value::Number(
                                serde_json::Number::from_f64(yv).unwrap()
                            ));
                        }
                        if let Some(zv) = z {
                            params.insert("z".to_string(), Value::Number(
                                serde_json::Number::from_f64(zv).unwrap()
                            ));
                        }
                    }
                }
            }

            Ok(SendPacket {
                cmd: "leg".to_string(),
                params,
            })
        }
        _ => {
            let _ = app.emit("ws_sent_invalid", &action);
            Err("Invalid action.".to_string())
        }
    }
}

#[tauri::command]
async fn send_command(app: AppHandle, cmd: String) -> Result<(), String> {
    let packet = parse_command(&cmd, app.clone())?;
    let json = serde_json::to_string(&packet).unwrap();
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
            let _ = app.emit("connected", true);
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to open port {}: {}", id, e);
            let _ = app.emit("connected", false);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn is_bt_connected(app: tauri::AppHandle) -> Result<bool, String> {
    let state = app.state::<AppState>();
    let guard = state.bt_conn.lock().unwrap();

    let connected = guard.is_some();
    let _ = app.emit("connected", &connected);
    Ok(connected)
}

#[tauri::command]
async fn disconnect_bt(app: tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let mut guard = state.bt_conn.lock().unwrap();

    if guard.is_some() {
        let _port = guard.take();
        let _ = app.emit("connected", false);
        Ok(())
    } else {
        Err("No Bluetooth connection to disconnect".into())
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
            connect_bt,
            is_bt_connected,
            disconnect_bt
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
    let port = serialport::new(port_name, 115200)
        .timeout(Duration::from_millis(2000))
        .open()?;
    Ok(port)
}
