import { Collapsible } from "@ark-ui/solid/collapsible";
import type { ComponentProps } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { collapsible } from "styled-system/recipes";
import { Button as DemoButton } from "./button";
import { Box as DemoBox } from "styled-system/jsx";

const { withProvider, withContext } = createStyleContext(collapsible);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(Collapsible.Root, "root");
export const RootProvider = withProvider(Collapsible.RootProvider, "root");
export const Content = withContext(Collapsible.Content, "content");
export const Indicator = withContext(Collapsible.Indicator, "indicator");
export const Trigger = withContext(Collapsible.Trigger, "trigger");

export { CollapsibleContext as Context } from "@ark-ui/solid/collapsible";

export interface CollapsibleDemoProps {
  variantProps?: Record<string, string>;
}

export const CollapsibleDemo = (props: CollapsibleDemoProps) => {
  return (
    <Root {...(props.variantProps ?? {})} open width="full" maxW="96">
      <Trigger
        asChild={(props) => (
          <DemoButton {...props()}>Toggle Details</DemoButton>
        )}
      />
      <Content>
        <DemoBox p="3">Collapsible content preview</DemoBox>
      </Content>
    </Root>
  );
};
