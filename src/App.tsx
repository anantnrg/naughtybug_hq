import "./App.css";
import connectedIcon from "./assets/icons/connected.svg";

function App() {
  return (
    <main class="bg-bg h-screen w-screen flex flex-col p-3 items-center justify-center gap-y-3">
      <div class="w-full h-12 bg-panels border border-border flex items-center justify-between px-4">
        <span class="text-2xl text-heading uppercase font-semibold tracking-wider">
          NaughtyBug Core-x
        </span>
        <span class="text-lg text-heading uppercase flex gap-x-1 items-center justify-center">
          <img src={connectedIcon} class="w-5" /> Connected
        </span>
      </div>
      <div class="w-full h-full flex gap-x-3">
        <div class="w-2/3 h-full flex flex-col gap-y-3">
          <div class="w-full h-1/2 flex gap-x-3">
            <div class="w-1/2 h-full bg-panels border border-border"></div>
            <div class="w-1/2 h-full bg-panels border border-border"></div>
          </div>
          <div class="w-full h-1/2 flex gap-x-3 bg-panels border border-border"></div>
        </div>
        <div class="w-1/3 h-full flex flex-col gap-y-3">
          <div class="w-full h-1/2 bg-panels border border-border"></div>
          <div class="w-full h-1/2 bg-panels border border-border"></div>
        </div>
      </div>
    </main>
  );
}

export default App;
