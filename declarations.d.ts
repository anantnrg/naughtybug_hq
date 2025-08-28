declare module "*.svg" {
  import { ComponentProps } from "solid-js";
  const component: (props: ComponentProps<"svg">) => TSX.Element;
  export default component;
}
