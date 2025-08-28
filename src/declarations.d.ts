/// <reference types="solid-js" />

declare module "*.svg" {
  import type { Component, JSX } from "solid-js";
  const content: Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
  export default content;
}
