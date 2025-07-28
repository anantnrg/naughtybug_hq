import "./App.css";
import connectedIcon from "./assets/icons/connected.svg";

function App() {
  return (
    <main className="bg-bg h-screen w-screen flex flex-col p-3 items-center justify-center gap-y-3">
      <div className="w-full h-12 bg-panels border border-border flex items-center justify-between px-4">
        <span className="text-2xl text-heading uppercase font-semibold tracking-wider">
          NaughtyBug Core-x
        </span>
        <span className="text-lg text-heading uppercase flex gap-x-2 items-center justify-center">
          <img
            src={connectedIcon}
            className="w-7 text-heading"
            alt="connected"
          />
          Connected
        </span>
      </div>
      <div className="w-full h-full flex gap-x-3">
        <div className="w-2/3 h-full flex flex-col gap-y-3">
          <div className="w-full h-1/2 flex gap-x-3">
            <div className="w-1/2 h-full bg-panels border border-border"></div>
            <div className="w-1/2 h-full bg-panels border border-border"></div>
          </div>
          <div className="w-full h-1/2 flex gap-x-3 bg-panels border border-border"></div>
        </div>
        <div className="w-1/3 h-full flex flex-col gap-y-3">
          <div className="w-full h-1/2 bg-panels border border-border"></div>
          <div className="w-full h-1/2 bg-panels border border-border"></div>
        </div>
      </div>
    </main>
  );
}

export default App;
