import "./App.css";

import ConnectedIcon from "./assets/icons/connected.svg";
import DisconnectedIcon from "./assets/icons/disconnected.svg";
import ArrowUp from "./assets/icons/forward.svg";
import ArrowDown from "./assets/icons/backward.svg";
import ArrowLeft from "./assets/icons/left.svg";
import ArrowRight from "./assets/icons/right.svg";
import StopIcon from "./assets/icons/stop.svg";
import TurnLeft from "./assets/icons/turn_left.svg";
import TurnRight from "./assets/icons/turn_right.svg";
import ChevronRightIcon from "./assets/icons/double_chevron_right.svg";
import ReturnIcon from "./assets/icons/return.svg";
import YawGauge from "./assets/yaw gauge.svg";

import Panel from "./Panel";
import { createSignal, onCleanup, createEffect, onMount, For } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function App() {
  // ------------------- Signals -------------------
  const [connected, setConnected] = createSignal(false);
  const [tab, setTab] = createSignal("programming");
  const [shiftPressed, setShiftPressed] = createSignal(false);
  const [logs, setLogs] = createSignal([
    { level: "INFO", text: "Not connected to NaughtyBug." },
  ]);

  // gait params (store individually)
  const [mode, setMode] = createSignal<"crawl" | "trot">("crawl");
  const [speed, setSpeed] = createSignal(0.01);
  const [height, setHeight] = createSignal(25);
  const [stepLength, setStepLength] = createSignal(80);

  let inputRef: HTMLInputElement | undefined;
  let logContainer: HTMLDivElement | undefined;
  let activeCmd: string | null = null;
  let queuedCmd: string | null = null;

  // ------------------- Backend Connection -------------------
  listen<boolean>("connected", (e) => setConnected(e.payload));

  const sendCommand = async (cmd: string) => {
    try {
      await invoke("send_command", { cmd });
      console.log("Sent:", cmd);
    } catch (err) {
      console.error("Error sending command:", err);
    }
  };

  // ------------------- Helpers -------------------
  const walk = (dir: "f" | "b" | "L" | "R") => {
    // build shorthand string with params
    let cmd = `move ${dir === "f" ? "forward" : dir === "b" ? "backward" : dir === "L" ? "left" : "right"}`;
    cmd += ` --mode ${mode()}`;
    cmd += ` --speed ${speed()}`;
    cmd += ` --height ${height()}`;
    cmd += ` --step_length ${stepLength()}`;
    sendCommand(cmd);
  };

  const turn = (dir: "l" | "r") => {
    let cmd = `turn ${dir === "l" ? "left" : "right"}`;
    cmd += ` --mode ${mode()}`;
    cmd += ` --speed ${speed()}`;
    cmd += ` --height ${height()}`;
    cmd += ` --step_length ${stepLength()}`;
    sendCommand(cmd);
  };

  const stop = () => {
    sendCommand("stop");
  };

  // ------------------- Keyboard Mapping -------------------
  const getCommandForKey = (e: KeyboardEvent): string | null => {
    const key = e.key.toLowerCase();
    if (key === "w") return "move forward";
    if (key === "s") return "move backward";
    if (key === "a") return e.shiftKey ? "turn left" : "move left";
    if (key === "d") return e.shiftKey ? "turn right" : "move right";
    return null;
  };

  const cmdToSelector: Record<string, string> = {
    "move forward": "#btn-up",
    "move backward": "#btn-down",
    "move left": "#btn-left",
    "move right": "#btn-right",
    "turn left": "#btn-left",
    "turn right": "#btn-right",
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
      return;
    const cmd = getCommandForKey(e);
    if (!cmd) return;

    setShiftPressed(e.shiftKey);
    document.querySelector(cmdToSelector[cmd])?.classList.add("active-key");

    if (!activeCmd) {
      activeCmd = cmd;
      if (cmd.startsWith("move")) {
        walk(
          cmd.includes("forward")
            ? "f"
            : cmd.includes("backward")
              ? "b"
              : cmd.includes("left")
                ? "L"
                : "R",
        );
      } else if (cmd.startsWith("turn")) {
        turn(cmd.includes("left") ? "l" : "r");
      }
    } else if (activeCmd !== cmd) {
      queuedCmd = cmd;
      console.log("Queued:", queuedCmd);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
      return;
    const cmd = getCommandForKey(e);
    if (!cmd) return;

    setShiftPressed(e.shiftKey);
    document.querySelector(cmdToSelector[cmd])?.classList.remove("active-key");

    if (cmd === activeCmd) {
      sendCommand("stop");
      activeCmd = null;

      if (queuedCmd) {
        activeCmd = queuedCmd;
        if (queuedCmd.startsWith("move")) {
          walk(
            queuedCmd.includes("forward")
              ? "f"
              : queuedCmd.includes("backward")
                ? "b"
                : queuedCmd.includes("left")
                  ? "L"
                  : "R",
          );
        } else if (queuedCmd.startsWith("turn")) {
          turn(queuedCmd.includes("left") ? "l" : "r");
        }
        queuedCmd = null;
      }
    } else if (cmd === queuedCmd) {
      queuedCmd = null;
    }
  };

  // ------------------- Input Box -------------------
  const handleInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputRef && inputRef.value.trim() !== "") {
      const cmd = inputRef.value.trim();
      sendCommand(cmd);
      setLogs((prev) => [...prev, { level: "CMD", text: cmd }]);
      inputRef.value = "";
    }
  };

  // ------------------- Lifecycle -------------------
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") setShiftPressed(true);
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") setShiftPressed(false);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  });

  createEffect(() => {
    logs();
    if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
  });

  // ------------------- WS Listeners -------------------
  interface WsPacket {
    type: string;
    action: string;
    params: Record<string, any>;
  }

  listen<WsPacket>("ws_info", (e) => {
    const { params } = e.payload;
    setLogs((prev) => [...prev, { level: "INFO", text: params.state }]);
  });

  listen<WsPacket>("ws_error", (e) => {
    const { params } = e.payload;
    setLogs((prev) => [...prev, { level: "ERROR", text: params.error }]);
  });

  onMount(() => {
    const btn_up = document.getElementById("btn-up");
  });

  return (
    <main class="bg-bg h-screen w-screen flex flex-col p-3 items-center justify-center gap-y-3 overflow-hidden">
      {/* HEADER */}
      <div class="w-full h-12 bg-header-bg border border-border flex items-center justify-between px-4">
        <span class="text-2xl text-heading uppercase font-semibold tracking-wider">
          AN-X8 MK III
        </span>
        <div class="flex gap-4 h-full w-auto px-5 items-center justify-center">
          <div
            class={`${tab() === "controls" ? "text-heading border-heading font-bold" : "text-text border-text"} text-xl tracking-wider uppercase border-b-2  py-2 px-4  hover:border-heading transition-all`}
            onClick={() => setTab("controls")}
          >
            CONTROLS
          </div>
          <div
            class={`${tab() === "programming" ? "text-heading border-heading font-bold" : "text-text border-text"} text-xl tracking-wider uppercase border-b-2  py-2 px-4 hover:border-heading transition-all`}
            onClick={() => setTab("programming")}
          >
            PROGRAMMING
          </div>
        </div>
        <div
          onClick={async () => {
            try {
              await invoke("connect");
            } catch (err) {
              console.error("Error sending command:", err);
            }
          }}
        >
          {connected() ? (
            <span class="text-lg text-heading uppercase flex gap-x-1 items-center justify-center">
              <ConnectedIcon class="w-5" />
              <span>Connected</span>
            </span>
          ) : (
            <span class="text-lg text-danger uppercase flex gap-x-1 items-center justify-center">
              <DisconnectedIcon class="w-5" />
              <span>Disconnected</span>
            </span>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      {tab() === "controls" ? (
        <div class="w-full h-full flex gap-x-3 overflow-hidden">
          {/* LEFT COLUMN */}
          <div class="w-3/5 h-full flex flex-col gap-y-3">
            <Panel
              title="Movement Control"
              class="flex flex-col items-center justify-between relative h-[60%]"
            >
              <div class="flex-1 w-full flex items-center justify-center relative">
                {/* D-PAD GRID */}
                <div class="grid grid-cols-3 grid-rows-3 place-items-center gap-3">
                  <div></div>
                  <button
                    id="btn-up"
                    class="control-btn w-24 h-20 flex items-center justify-center"
                    onMouseDown={() => walk("f")}
                    onMouseUp={() => stop()}
                  >
                    <ArrowUp class="w-8 h-8 text-text" />
                  </button>
                  <div></div>

                  <button
                    id="btn-left"
                    class="control-btn w-20 h-24 flex items-center justify-center"
                    onMouseDown={() => (shiftPressed() ? turn("l") : walk("L"))}
                    onMouseUp={() => stop()}
                  >
                    {shiftPressed() ? (
                      <TurnLeft class="w-8 h-8 text-primary transition-colors duration-200" />
                    ) : (
                      <ArrowLeft class="w-8 h-8 text-text transition-colors duration-200" />
                    )}
                  </button>

                  <button
                    class="control-btn w-24 h-24 flex items-center justify-center"
                    onClick={() => stop()}
                  >
                    <StopIcon class="w-10 h-10 text-text" />
                  </button>

                  <button
                    id="btn-right"
                    class="control-btn w-20 h-24 flex items-center justify-center"
                    onMouseDown={() => (shiftPressed() ? turn("r") : walk("R"))}
                    onMouseUp={() => stop()}
                  >
                    {shiftPressed() ? (
                      <TurnRight class="w-8 h-8 text-primary transition-colors duration-200" />
                    ) : (
                      <ArrowRight class="w-8 h-8 text-text transition-colors duration-200" />
                    )}
                  </button>

                  <div></div>
                  <button
                    id="btn-down"
                    class="control-btn w-24 h-20 flex items-center justify-center"
                    onMouseDown={() => walk("b")}
                    onMouseUp={() => stop()}
                  >
                    <ArrowDown class="w-8 h-8 text-text" />
                  </button>
                  <div></div>
                </div>

                {/* ACTION BUTTONS */}
                <div class="absolute inset-0 flex items-center justify-between pointer-events-none px-20">
                  <div class="flex flex-col gap-y-36 pointer-events-auto">
                    <button class="action-btn">Sit</button>
                    <button class="action-btn">Stand</button>
                  </div>
                  <div class="flex flex-col gap-y-36 pointer-events-auto">
                    <button class="action-btn">Wave</button>
                    <button class="action-btn">Dance</button>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="System Monitor"
              class="flex flex-col items-center justify-center h-[40%]"
            >
              <div class="w-full h-full flex items-center justify-evenly">
                {/* PITCH */}
                <div class="dial text-center flex flex-col items-center">
                  <div class="w-36 h-36 bg-header-bg border border-border rounded-full overflow-hidden relative">
                    {/* artificial horizon */}
                    <div
                      class="absolute inset-0 transition-transform duration-300"
                      style={{
                        transform: "rotate(10deg)", // or whatever your live pitch/roll value is
                      }}
                    >
                      {/* UPPER HALF — “SKY” */}
                      <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#0a0e1a] via-[#0d1840] to-[#142950] shadow-inner" />

                      {/* LOWER HALF — “GROUND” */}
                      <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#1a0b0b] via-[#2b0f0f] to-[#3b1414]" />

                      {/* HORIZON LINE */}
                      <div class="absolute top-1/2 left-0 w-full h-[2px] bg-primary animate-pulse shadow-[0_0_12px_#ff2f2f]" />
                    </div>
                    {/* degree display */}
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white text-2xl font-bold">+10°</span>
                    </div>
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,#000_100%)] opacity-40 pointer-events-none"></div>
                    <div class="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_3px)] pointer-events-none" />
                  </div>
                  <span class="mt-2 text-muted text-sm uppercase tracking-widest">
                    Pitch
                  </span>
                </div>

                {/* ROLL */}
                <div class="dial text-center flex flex-col items-center">
                  <div class="w-36 h-36 bg-header-bg border border-border rounded-full overflow-hidden relative">
                    {/* artificial horizon */}
                    <div
                      class="absolute inset-0 transition-transform duration-300"
                      style={{
                        transform: "rotate(-20deg)", // or whatever your live pitch/roll value is
                      }}
                    >
                      {/* UPPER HALF — “SKY” */}
                      <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#0a0e1a] via-[#0d1840] to-[#142950] shadow-inner" />

                      {/* LOWER HALF — “GROUND” */}
                      <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#1a0b0b] via-[#2b0f0f] to-[#3b1414]" />

                      {/* HORIZON LINE */}
                      <div class="absolute top-1/2 left-0 w-full h-[2px] bg-primary animate-pulse shadow-[0_0_12px_#ff2f2f]" />
                    </div>
                    {/* degree display */}
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white text-2xl font-bold">-20°</span>
                    </div>
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,#000_100%)] opacity-40 pointer-events-none"></div>
                    <div class="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_3px)] pointer-events-none" />
                  </div>
                  <span class="mt-2 text-muted text-sm uppercase tracking-widest">
                    Roll
                  </span>
                </div>

                {/* YAW (compass dial) */}
                <div class="dial text-center flex flex-col items-center">
                  <div class="w-[146px] h-[146px] bg-header-bg border border-border rounded-full overflow-hidden relative">
                    {/* Rotating compass ring */}
                    <YawGauge class="rotate-[0deg] transition-all" />

                    {/* Fixed direction pointer */}
                    <div class="absolute top-[2px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-primary" />

                    {/* Current degree text */}
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white text-2xl font-bold">120°</span>
                    </div>

                    {/* Vignette & scanline overlays (same as pitch/roll) */}
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,#000_100%)] opacity-40 pointer-events-none z-20"></div>
                    <div class="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_3px)] pointer-events-none" />
                  </div>

                  {/* Label */}
                  <span class="mt-2 text-muted text-sm uppercase tracking-widest">
                    Yaw
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN */}
          <div class="w-2/5 h-full flex flex-col gap-y-3 overflow-hidden">
            <Panel
              title="Configuration"
              class="h-1/2 flex flex-col justify-between"
            >
              {/* GRID FOR 6 SLIDERS */}
              <div class="grid grid-cols-2 gap-x-6 gap-y-6 flex-1 px-4 pt-4">
                {[
                  {
                    id: "SETLS",
                    label: "Set Leg Move Speed",
                    signal: "legSpeed",
                  },
                  {
                    id: "SETBS",
                    label: "Set Body Move Speed",
                    signal: "bodySpeed",
                  },
                  {
                    id: "SETAZP",
                    label: "Set Absolute Z Position",
                    signal: "absZ",
                  },
                  {
                    id: "SETDZP",
                    label: "Set Default Z Position",
                    signal: "defZ",
                  },
                  {
                    id: "SETDXP",
                    label: "Set Default X Position",
                    signal: "defX",
                  },
                  {
                    id: "SETSYP",
                    label: "Set Step Y Position",
                    signal: "stepY",
                  },
                ].map((item) => (
                  <div class="flex flex-col gap-y-1">
                    <div class="flex items-center justify-between text-xs uppercase text-muted tracking-widest">
                      <span>{item.label}</span>
                      <span
                        id={`val-${item.signal}`}
                        class="text-primary font-semibold"
                      >
                        0.0
                      </span>
                    </div>
                    <input
                      id={`slider-${item.signal}`}
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value="0"
                      class="w-full appearance-none h-2 rounded-lg
                           bg-header-bg border border-border cursor-pointer
                           accent-primary
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                           [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:from-primary/80 [&::-webkit-slider-runnable-track]:to-header-bg"
                      onInput={(e) => {
                        const val = e.currentTarget.value;
                        document.getElementById(
                          `val-${item.signal}`,
                        ).textContent = val;
                        const percent = (parseFloat(val) / 100) * 100;
                        e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary) ${percent}%, var(--color-header-bg) ${percent}%)`;
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* BLUETOOTH + SET BUTTON ROW */}
              <div class="flex items-center justify-between mt-4 px-4 pb-4">
                {/* Toggle */}
                <div class="flex items-center gap-x-3">
                  <span class="text-xs uppercase text-muted tracking-widest">
                    Bluetooth
                  </span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      class="sr-only peer"
                      id="bt-toggle"
                    />
                    <div
                      class="w-12 h-6 bg-header-bg border border-border peer-focus:outline-none
                           rounded-full peer peer-checked:bg-primary transition-colors duration-200"
                    ></div>
                    <span
                      class="absolute left-[4px] top-[3px] w-[18px] h-[18px] bg-muted rounded-full
                           transition-all duration-200 peer-checked:translate-x-6 peer-checked:bg-bg"
                    ></span>
                  </label>
                </div>

                {/* Set Button */}
                <button
                  class="bg-header-bg border border-border text-text uppercase tracking-widest text-sm px-6 py-2
                       hover:bg-primary hover:text-bg transition-colors duration-200 font-semibold"
                  onClick={async () => {
                    const commands = [
                      `SETLS ${document.getElementById("val-legSpeed")?.textContent}`,
                      `SETBS ${document.getElementById("val-bodySpeed")?.textContent}`,
                      `SETAZP ${document.getElementById("val-absZ")?.textContent}`,
                      `SETDZP ${document.getElementById("val-defZ")?.textContent}`,
                      `SETDXP ${document.getElementById("val-defX")?.textContent}`,
                      `SETSYP ${document.getElementById("val-stepY")?.textContent}`,
                      document.getElementById("bt-toggle")?.checked
                        ? "ENABLE_BT"
                        : "DISABLE_BT",
                    ];
                    for (const cmd of commands) {
                      try {
                        await invoke("send_command", { cmd });
                        console.log("Sent:", cmd);
                      } catch (err) {
                        console.error("Error sending:", err);
                      }
                    }
                  }}
                >
                  Set
                </button>
              </div>
            </Panel>

            <Panel
              title="Command Uplink"
              class="h-1/2 flex flex-col overflow-hidden"
            >
              <div
                ref={logContainer}
                class="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-1 font-martian text-sm font-light flex flex-col"
              >
                {logs().map((log) => (
                  <span
                    class={
                      log.level === "CMD"
                        ? "text-primary"
                        : log.level === "ERROR"
                          ? "text-danger"
                          : "text-text"
                    }
                  >
                    [{log.level}] {log.text}
                  </span>
                ))}
              </div>
              <div class="w-full h-16 flex items-center justify-center p-2 shrink-0">
                <div class="flex w-full h-full bg-header-bg text-text border border-border">
                  <div class="flex items-center pl-2">
                    <ChevronRightIcon class="w-5 h-5 text-text" />
                  </div>
                  <input
                    type="text"
                    class="flex-1 h-full bg-header-bg text-text pr-3 pl-2 outline-0 caret-w-[3px] caret-text animate-caret-blink"
                    placeholder="ENTER A COMMAND"
                    spellcheck={false}
                    ref={inputRef}
                    onKeyDown={handleInputKeyDown}
                  />
                  <div class="flex items-center pr-2">
                    <ReturnIcon class="w-5 h-5 text-text" />
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div class="w-full h-full flex flex-col gap-3 overflow-hidden">
          <div class="w-full h-1/2 flex shrink-0 gap-3">
            <For each={["fl", "fr", "bl", "br"]}>
              {(item) => (
                <Panel
                  title={
                    {
                      fl: "Front-Left",
                      fr: "Front-Right",
                      bl: "Back-Left",
                      br: "Back-Right",
                    }[item]
                  }
                  title_center={true}
                >
                  <div class="flex flex-col items-center gap-3 w-full h-full p-2">
                    <div class="flex flex-col items-center gap-3 w-full h-full p-2">
                      {/* 2x2 GRID */}
                      <div class="grid grid-cols-2 gap-2 w-full">
                        <button class="control-btn w-full h-14 flex items-center justify-center">
                          Up
                        </button>
                        <button class="control-btn w-full h-14 flex items-center justify-center">
                          Forward
                        </button>

                        <button class="control-btn w-full h-14 flex items-center justify-center">
                          Down
                        </button>
                        <button class="control-btn w-full h-14 flex items-center justify-center">
                          Back
                        </button>
                      </div>

                      {/* XYZ INPUTS */}
                      <div class="flex gap-2 w-full">
                        <input
                          class="input w-full h-10 text-center outline-0 active:border-heading"
                          placeholder="X"
                        />
                        <input
                          class="input w-full h-10 text-center outline-0"
                          placeholder="Y"
                        />
                        <input
                          class="input w-full h-10 text-center outline-0"
                          placeholder="Z"
                        />
                      </div>

                      {/* ACTION BUTTONS */}
                      <div class="flex gap-3 w-full h-14">
                        <button class="action-btn w-full h-full text-xs">
                          Mid
                        </button>
                        <button class="action-btn w-full h-full text-xs">
                          Go XYZ
                        </button>
                      </div>
                    </div>
                  </div>
                </Panel>
              )}
            </For>
          </div>
          <div class="w-full h-full flex gap-3">
            <Panel title="Editor"></Panel>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
