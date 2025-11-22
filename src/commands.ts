import { invoke } from "@tauri-apps/api/core";

const sendCommand = async (obj: Record<string, any>) => {
  try {
    await invoke("send_json", { payload: obj });
    console.log("Sent:", obj);
  } catch (err) {
    console.error("Error sending JSON:", err);
  }
};

// Stop
export async function stop() {
  return sendCommand({ cmd: "stop" });
}

// Walk
export async function walk(
  dir: "f" | "b" | "L" | "R" | "l" | "r",
  options: {
    mode?: "crawl" | "trot";
    steps?: number;
    speed?: number;
    height?: number;
    step_length?: number;
  } = {},
) {
  const cmd: any = {
    cmd: "walk",
    dir,
    mode: options.mode ?? "crawl",
    steps: options.steps ?? 10,
    step_length: options.step_length ?? 80,
  };

  if (options.speed !== undefined) cmd.speed = options.speed;
  if (options.height !== undefined) cmd.height = options.height;

  return sendCommand(cmd);
}

let continuousInterval: number | null = null;

export function startContinuousWalk(
  dir: "f" | "b" | "L" | "R" | "l" | "r",
  options: {
    mode?: "crawl" | "trot";
    speed?: number;
    height?: number;
    step_length?: number;
    steps?: number;
  } = {},
) {
  if (continuousInterval) return; // already running

  continuousInterval = window.setInterval(() => {
    walk(dir, options);
  }, 300); // 0.3s
}

export function stopContinuousWalk() {
  if (continuousInterval) {
    clearInterval(continuousInterval);
    continuousInterval = null;
  }
  stop();
}

// Turn radius
export async function setRadius(val: number) {
  return sendCommand({ cmd: "radius", val });
}

// Leg action
export async function legAction(
  id: 0 | 1 | 2 | 3,
  action: "up" | "dn" | "mf" | "bk" | "mid",
) {
  return sendCommand({ cmd: "leg", id, action });
}

// Leg XYZ
export async function legXYZ(
  id: 0 | 1 | 2 | 3,
  x: number,
  y: number,
  z: number,
) {
  return sendCommand({ cmd: "leg", id, x, y, z });
}

// Custom JSON
export async function sendCustom(obj: Record<string, any>) {
  return sendCommand(obj);
}
