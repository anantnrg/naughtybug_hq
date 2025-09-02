import "./App.css";

import ConnectedIcon from "./assets/icons/connected.svg";
import ArrowUp from "./assets/icons/forward.svg";
import ArrowDown from "./assets/icons/backward.svg";
import ArrowLeft from "./assets/icons/left.svg";
import ArrowRight from "./assets/icons/right.svg";
import StopIcon from "./assets/icons/stop.svg";
import Compass from "./assets/compass.svg";
import TurnLeft from "./assets/icons/turn_left.svg";
import TurnRight from "./assets/icons/turn_right.svg";

import Panel from "./Panel";
import { createSignal, onCleanup } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

function App() {
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
    if (key === "w") return "MOVE_FWD";
    if (key === "s") return "MOVE_BWD";
    if (key === "a") return e.shiftKey ? "TURN_LEFT" : "MOVE_LEFT";
    if (key === "d") return e.shiftKey ? "TURN_RIGHT" : "MOVE_RIGHT";
    return null;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
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
    const cmd = getCommandForKey(e);
    if (!cmd) return;

    if (!e.shiftKey) setShiftPressed(false);

    if (cmd === activeCmd) {
      sendCommand("STOP");
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

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  });

  return (
    <main class="bg-bg h-screen w-screen flex flex-col p-3 items-center justify-center gap-y-3">
      <div class="w-full h-12 bg-header-bg border border-border flex items-center justify-between px-4">
        <span class="text-2xl text-heading uppercase font-semibold tracking-wider">
          NaughtyBug Core-x
        </span>
        <span class="text-lg text-heading uppercase flex gap-x-1 items-center justify-center">
          <ConnectedIcon class="w-5" />
          <span>Connected</span>
        </span>
      </div>

      <div class="w-full h-full flex gap-x-3">
        <div class="w-3/5 h-full flex flex-col gap-y-3">
          <div class="w-full h-full flex gap-x-3">
            <Panel
              title="Movement Control"
              class="flex items-center justify-center"
            >
              <div class="w-full h-full flex items-center justify-center">
                <div class="grid grid-cols-3 grid-rows-3 w-auto h-auto place-items-center gap-2">
                  <div></div>
                  <button
                    class="control-btn w-24 h-20 focus:outline-none"
                    onMouseDown={() => sendCommand("MOVE_FWD")}
                    onMouseUp={() => sendCommand("STOP")}
                    onMouseLeave={() => sendCommand("STOP")}
                  >
                    <ArrowUp class="w-8 h-8 text-text" />
                  </button>
                  <div></div>

                  <button
                    class="control-btn w-20 h-24 focus:outline-none"
                    onMouseDown={() =>
                      shiftPressed()
                        ? sendCommand("TURN_LEFT")
                        : sendCommand("MOVE_LEFT")
                    }
                    onMouseUp={() => sendCommand("STOP")}
                    onMouseLeave={() => sendCommand("STOP")}
                  >
                    {shiftPressed() ? (
                      <TurnLeft class="w-7 h-7 text-text" />
                    ) : (
                      <ArrowLeft class="w-8 h-8 text-text" />
                    )}
                  </button>

                  <button
                    class="control-btn w-24 h-24 focus:outline-none"
                    onClick={() => sendCommand("STOP")}
                  >
                    <StopIcon class="w-10 h-10 text-text" />
                  </button>

                  <button
                    class="control-btn w-20 h-24 focus:outline-none"
                    onMouseDown={() =>
                      shiftPressed()
                        ? sendCommand("TURN_RIGHT")
                        : sendCommand("MOVE_RIGHT")
                    }
                    onMouseUp={() => sendCommand("STOP")}
                    onMouseLeave={() => sendCommand("STOP")}
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
                    onMouseDown={() => sendCommand("MOVE_BWD")}
                    onMouseUp={() => sendCommand("STOP")}
                    onMouseLeave={() => sendCommand("STOP")}
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

        <div class="w-2/5 h-full flex flex-col gap-y-3">
          <Panel title="System Info" class="h-1/2">
            {/* Add any children here */}
          </Panel>
          <Panel title="Terminal/Logs" class="h-1/2 flex flex-col">
            <div class="h-full w-full flex flex-col overflow-y-scroll px-2" />
            <div class="w-full h-18 flex items-center justify-center p-2">
              <input
                type="text"
                class="w-full h-full bg-header-bg text-text px-3 border border-border outline-0"
                placeholder="ENTER A COMMAND"
                spellcheck={false}
              />
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}

export default App;
