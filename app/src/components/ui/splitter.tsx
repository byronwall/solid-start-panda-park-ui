import { Splitter } from "@ark-ui/solid/splitter";
import type { ComponentProps } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { splitter } from "styled-system/recipes";
import { Box as DemoBox } from "styled-system/jsx";

const { withProvider, withContext } = createStyleContext(splitter);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(Splitter.Root, "root");
export const RootProvider = withProvider(Splitter.RootProvider, "root");
export const Panel = withContext(Splitter.Panel, "panel");
export const ResizeTrigger = withContext(
  Splitter.ResizeTrigger,
  "resizeTrigger",
);

export { SplitterContext as Context } from "@ark-ui/solid/splitter";

export interface SplitterDemoProps {
  variantProps?: Record<string, string>;
}

export const SplitterDemo = (props: SplitterDemoProps) => {
  return (
    <Root
      {...(props.variantProps ?? {})}
      panels={[{ id: "a" }, { id: "b" }]}
      orientation="horizontal"
      height="24"
      width="full"
      maxW="96"
    >
      <Panel id="a">
        <DemoBox p="3">Left</DemoBox>
      </Panel>
      <ResizeTrigger id="a:b" />
      <Panel id="b">
        <DemoBox p="3">Right</DemoBox>
      </Panel>
    </Root>
  );
};
