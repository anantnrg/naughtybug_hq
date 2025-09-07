import "./App.css";

import ConnectedIcon from "./assets/icons/connected.svg";
import DisconnectedIcon from "./assets/icons/disconnected.svg";
import ArrowUp from "./assets/icons/forward.svg";
import ArrowDown from "./assets/icons/backward.svg";
import ArrowLeft from "./assets/icons/left.svg";
import ArrowRight from "./assets/icons/right.svg";
import StopIcon from "./assets/icons/stop.svg";
import Compass from "./assets/compass.svg";
import TurnLeft from "./assets/icons/turn_left.svg";
import TurnRight from "./assets/icons/turn_right.svg";
import ChevronRightIcon from "./assets/icons/double_chevron_right.svg";
import ReturnIcon from "./assets/icons/return.svg";

import Panel from "./Panel";
import { createSignal, onCleanup, createEffect } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function App() {
  const [connected, setConnected] = createSignal(false);

  listen<boolean>("connected", (e) => {
    setConnected(e.payload);
  });

  const sendCommand = async (cmd: string) => {
    try {
      await invoke("send_command", { cmd });
      console.log("Sent:", cmd);
    } catch (err) {
      console.error("Error sending command:", err);
    }
  };

  const [shiftPressed, setShiftPressed] = createSignal(false);

  let activeCmd: string | null = null;
  let queuedCmd: string | null = null;

  const getCommandForKey = (e: KeyboardEvent): string | null => {
    const key = e.key.toLowerCase();
    if (key === "w") return "move forward";
    if (key === "s") return "move backward";
    if (key === "a") return e.shiftKey ? "turn left" : "move left";
    if (key === "d") return e.shiftKey ? "turn right" : "move right";
    return null;
  };

  let inputRef: HTMLInputElement | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return;
    }

    const cmd = getCommandForKey(e);
    if (!cmd) return;

    if (e.shiftKey) setShiftPressed(true);

    if (!activeCmd) {
      activeCmd = cmd;
      sendCommand(cmd);
    } else if (activeCmd !== cmd) {
      queuedCmd = cmd;
      console.log("Queued:", queuedCmd);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return;
    }

    const cmd = getCommandForKey(e);
    if (!cmd) return;

    if (!e.shiftKey) setShiftPressed(false);

    if (cmd === activeCmd) {
      sendCommand("stop");
      activeCmd = null;

      if (queuedCmd) {
        activeCmd = queuedCmd;
        sendCommand(activeCmd);
        queuedCmd = null;
      }
    } else if (cmd === queuedCmd) {
      queuedCmd = null;
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputRef && inputRef.value.trim() !== "") {
      const cmd = inputRef.value.trim();
      sendCommand(cmd);
      setLogs((prev) => [...prev, { level: "CMD", text: cmd }]);
      inputRef.value = "";
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  onCleanup(() => {
    3;
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  });

  const [logs, setLogs] = createSignal([
    { level: "INFO", text: "Moving forward" },
    { level: "ERROR", text: "Servo 5 not responding" },
    { level: "INFO", text: "Pitch: 3.2°, Roll: -1.5°" },
    { level: "CMD", text: "set gait trot" },
  ]);

  let logContainer: HTMLDivElement | undefined;

  createEffect(() => {
    logs();
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  });

  listen("ws_info", (e) => {
    const { params } = e.payload;
    setLogs((prev) => [...prev, { level: "INFO", text: params.state }]);
  });

  listen("ws_error", (e) => {
    const { params } = e.payload;
    setLogs((prev) => [...prev, { level: "ERROR", text: params.error }]);
  });

  return (
    <main class="bg-bg h-screen w-screen flex flex-col p-3 items-center justify-center gap-y-3 overflow-hidden">
      <div class="w-full h-12 bg-header-bg border border-border flex items-center justify-between px-4">
        <span class="text-2xl text-heading uppercase font-semibold tracking-wider">
          NaughtyBug Core-x
        </span>
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

      <div class="w-full h-full flex gap-x-3 overflow-hidden">
        <div class="w-3/5 h-full flex flex-col gap-y-3">
          <div class="w-full h-full flex gap-x-3 overflow-hidden">
            <Panel
              title="Movement Control"
              class="flex items-center justify-center"
            >
              <div class="w-full h-full flex items-center justify-center">
                <div class="grid grid-cols-3 grid-rows-3 w-auto h-auto place-items-center gap-2">
                  <div></div>
                  <button
                    class="control-btn w-24 h-20 focus:outline-none"
                    onMouseDown={() => sendCommand("move forward")}
                    onMouseUp={() => sendCommand("stop")}
                    onMouseLeave={() => sendCommand("stop")}
                  >
                    <ArrowUp class="w-8 h-8 text-text" />
                  </button>
                  <div></div>

                  <button
                    class="control-btn w-20 h-24 focus:outline-none"
                    onMouseDown={() =>
                      shiftPressed()
                        ? sendCommand("turn left")
                        : sendCommand("move left")
                    }
                    onMouseUp={() => sendCommand("stop")}
                    onMouseLeave={() => sendCommand("stop")}
                  >
                    {shiftPressed() ? (
                      <TurnLeft class="w-7 h-7 text-text" />
                    ) : (
                      <ArrowLeft class="w-8 h-8 text-text" />
                    )}
                  </button>

                  <button
                    class="control-btn w-24 h-24 focus:outline-none"
                    onClick={() => sendCommand("stop")}
                  >
                    <StopIcon class="w-10 h-10 text-text" />
                  </button>

                  <button
                    class="control-btn w-20 h-24 focus:outline-none"
                    onMouseDown={() =>
                      shiftPressed()
                        ? sendCommand("turn right")
                        : sendCommand("move right")
                    }
                    onMouseUp={() => sendCommand("stop")}
                    onMouseLeave={() => sendCommand("stop")}
                  >
                    {shiftPressed() ? (
                      <TurnRight class="w-7 h-7 text-text" />
                    ) : (
                      <ArrowRight class="w-8 h-8 text-text" />
                    )}
                  </button>

                  <div></div>
                  <button
                    class="control-btn w-24 h-20 focus:outline-none"
                    onMouseDown={() => sendCommand("move backward")}
                    onMouseUp={() => sendCommand("stop")}
                    onMouseLeave={() => sendCommand("stop")}
                  >
                    <ArrowDown class="w-8 h-8 text-text" />
                  </button>
                  <div></div>
                </div>
              </div>

              <div class="absolute z-10 pointer-events-none w-full h-full flex items-center justify-center pt-12">
                <Compass class="w-[464px] h-[464px]" />
              </div>
            </Panel>
          </div>
        </div>

        <div class="w-2/5 h-full flex flex-col gap-y-3 overflow-hidden">
          <Panel title="System Info" class="h-1/2">
            {/* Add any children here */}
          </Panel>
          <Panel
            title="Terminal/Logs"
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
    </main>
  );
}

export default App;
