import "./App.css";

// icons
import ConnectedIcon from "./assets/icons/connected.svg";
import ArrowUp from "./assets/icons/forward.svg";
import ArrowDown from "./assets/icons/backward.svg";
import ArrowLeft from "./assets/icons/left.svg";
import ArrowRight from "./assets/icons/right.svg";
import StopIcon from "./assets/icons/stop.svg";
import Compass from "./assets/compass.svg";

function App() {
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
            <div class="w-full h-full bg-panels border border-border flex flex-col relative items-center">
              <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
                <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                  Movement Control
                </span>
              </div>

              <div class="w-full h-full flex items-center justify-center">
                <div class="grid grid-cols-3 grid-rows-3 w-auto h-auto place-items-center gap-2">
                  <div></div>
                  <button class="control-btn w-24 h-20">
                    <ArrowUp class="w-8 h-8 text-text" />
                  </button>
                  <div></div>

                  <button class="control-btn w-20 h-24">
                    <ArrowLeft class="w-8 h-8 text-text" />
                  </button>

                  <button class="control-btn w-24 h-24">
                    <StopIcon class="w-10 h-10 text-text" />
                  </button>

                  <button class="control-btn w-20 h-24">
                    <ArrowRight class="w-8 h-8 text-text" />
                  </button>

                  <div></div>
                  <button class="control-btn w-24 h-20">
                    <ArrowDown class="w-8 h-8 text-text" />
                  </button>
                  <div></div>
                </div>
              </div>

              <div class="absolute z-10 pointer-events-none w-full h-full flex items-center justify-center pt-12">
                <Compass class="w-[464px] h-[464px]" />
              </div>
            </div>
          </div>
        </div>

        <div class="w-2/5 h-full flex flex-col gap-y-3">
          <div class="w-full h-1/2 bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                System Info
              </span>
            </div>
          </div>
          <div class="w-full h-1/2 bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wide">
                Terminal/Logs
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
