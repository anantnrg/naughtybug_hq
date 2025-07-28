import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  return (
    <main class="container">
      <h1>Welcome to Tauri + Solid</h1>
    </main>
  );
}

export default App;
