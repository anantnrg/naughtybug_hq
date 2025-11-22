use serde_json::{Map, Value};
use tauri::{AppHandle, Emitter};

#[derive(Debug, serde::Serialize)]
struct SendPacket {
    cmd: String,
    #[serde(flatten)]
    params: Value,
}

fn parse_command(input: &str, app: AppHandle) -> Result<SendPacket, String> {
    let mut parts = input.trim().split_whitespace();
    let action = parts.next().ok_or("empty command")?.to_lowercase();
    let mut params = Map::new();

    match action.as_str() {
        "move" => {
            // map directions to short codes
            if let Some(dir) = parts.next() {
                let dir_code = match dir.to_lowercase().as_str() {
                    "forward" => "f",
                    "backward" => "b",
                    "left" => "L",
                    "right" => "R",
                    _ => dir,
                };
                params.insert("dir".into(), Value::String(dir_code.to_string()));
            }
            // parse flags like --steps 10 --speed 0.01
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
            params.insert("mode".into(), Value::String("crawl".into())); // default
            params.insert("steps".into(), Value::Number(10.into())); // default
            params.insert("step_length".into(), Value::Number(80.into())); // default
            return Ok(SendPacket {
                cmd: "walk".into(),
                params: Value::Object(params),
            });
        }
        "turn" => {
            if let Some(dir) = parts.next() {
                let dir_code = match dir.to_lowercase().as_str() {
                    "left" => "l",
                    "right" => "r",
                    _ => dir,
                };
                params.insert("dir".into(), Value::String(dir_code.to_string()));
            }
            params.insert("mode".into(), Value::String("crawl".into()));
            params.insert("steps".into(), Value::Number(10.into()));
            params.insert("step_length".into(), Value::Number(80.into()));
            return Ok(SendPacket {
                cmd: "walk".into(),
                params: Value::Object(params),
            });
        }
        "stop" => {
            return Ok(SendPacket {
                cmd: "stop".into(),
                params: Value::Object(Map::new()),
            });
        }
        "sit" | "stand" | "dance" | "wave" => {
            return Ok(SendPacket {
                cmd: action,
                params: Value::Object(Map::new()),
            });
        }
        _ => {
            let _ = app.emit("ws_sent_invalid", &action);
            return Err("Invalid action.".to_string());
        }
    }
}
