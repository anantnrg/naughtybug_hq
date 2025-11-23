use serde_json::{Map, Value};
use serialport::{available_ports, DataBits, Parity, SerialPort, SerialPortType, StopBits};
use std::time::Duration;
use tauri::{AppHandle, Emitter};

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
    let packet = parse_command(&cmd, app)?;
    let json = serde_json::to_string_pretty(&packet).unwrap();
    println!("{}", json);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ports = list_ports();
    if ports.is_empty() {
        println!("No serial ports found.");
    } else {
        println!("Available ports:");
        for p in ports {
            println!("  {}", p);
        }
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_command])
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn list_ports() -> Vec<String> {
    match available_ports() {
        Ok(ports) => ports
            .into_iter()
            .map(|p| match p.port_type {
                SerialPortType::UsbPort(info) => {
                    format!(
                        "{} (USB VID:{:04x} PID:{:#?})",
                        p.port_name, info.vid, info.product
                    )
                }
                SerialPortType::BluetoothPort => {
                    format!("{} (Bluetooth)", p.port_name)
                }
                SerialPortType::PciPort => {
                    format!("{} (PCI)", p.port_name)
                }
                SerialPortType::Unknown => {
                    format!("{} (Unknown)", p.port_name)
                }
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
