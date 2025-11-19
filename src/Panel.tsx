// src/Panel.tsx
import { JSX } from "solid-js";

interface PanelProps {
  title?: string;
  class?: string;
  children?: JSX.Element;
  title_center?: boolean;
}

export default function Panel(props: PanelProps) {
  return (
    <div
      class={`w-full border border-border bg-panels flex flex-col relative ${props.class ?? ""}`}
    >
      {props.title && (
        <div
          class={`w-full h-12 bg-header-bg border-b border-border flex items-center px-4 shrink-0 ${props.title_center ? "justify-center" : " "}`}
        >
          <span class="text-xl text-heading uppercase font-semibold tracking-wider">
            {props.title}
          </span>
        </div>
      )}
      {props.children}
    </div>
  );
}
