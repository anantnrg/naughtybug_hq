import "./App.css";
import connectedIcon from "./assets/icons/connected.svg";

function App() {
  return (
    <main class="bg-bg h-screen w-screen flex flex-col p-3 items-center justify-center gap-y-3">
      <div class="w-full h-12 bg-header-bg border border-border flex items-center justify-between px-4">
        <span class="text-2xl text-heading uppercase font-semibold tracking-wider">
          NaughtyBug Core-x
        </span>
        <span class="text-lg text-heading uppercase flex gap-x-1 items-center justify-center">
          <img src={connectedIcon} class="w-5" /> Connected
        </span>
      </div>
      <div class="w-full h-full flex gap-x-3">
        <div class="w-4/5 h-full flex flex-col gap-y-3">
          <div class="w-full h-[55%] flex gap-x-3">
            <div class="w-1/2 h-full bg-panels border border-border">
              <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
                <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                  System Info
                </span>
              </div>
            </div>
            <div class="w-1/2 h-full bg-panels border border-border flex flex-col">
              <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
                <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                  Movement Control
                </span>
              </div>
              <div class="grid grid-cols-3 grid-rows-3  w-full h-full place-items-center px-20 py-10">
                <div></div>
                <button class="control-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="12"
                      stroke-dashoffset="12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8l-7 7M12 8l7 7"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="12;0"
                      />
                    </path>
                  </svg>
                </button>
                <div></div>

                <button class="control-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="12"
                      stroke-dashoffset="12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12l7 -7M8 12l7 7"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="12;0"
                      />
                    </path>
                  </svg>
                </button>
                <button class="control-btn ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="64"
                      stroke-dashoffset="64"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.6s"
                        values="64;0"
                      />
                    </path>
                  </svg>
                </button>
                <button class="control-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m9 5l7 7l-7 7"
                    />
                  </svg>
                </button>

                <div></div>
                <button class="control-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    class="text-text"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-dasharray="12"
                      stroke-dashoffset="12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 16l-7 -7M12 16l7 -7"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="12;0"
                      />
                    </path>
                  </svg>
                </button>
                <div></div>
              </div>
            </div>
          </div>
          <div class="w-full h-[45%] flex gap-x-3 bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                Terminal/Logs
              </span>
            </div>
          </div>
        </div>
        <div class="w-1/3 h-full flex flex-col gap-y-3">
          <div class="w-full h-[55%] bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wider">
                Radar
              </span>
            </div>
          </div>
          <div class="w-full h-[45%] bg-panels border border-border">
            <div class="w-full h-12 bg-header-bg border-b border-border flex items-center px-4">
              <span class="text-xl text-heading uppercase font-semibold tracking-wide">
                Additional Controls
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
