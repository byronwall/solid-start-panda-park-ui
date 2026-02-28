import { HoverCard } from "@ark-ui/solid/hover-card";
import type { ComponentProps } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { hoverCard } from "styled-system/recipes";
import { Link as DemoLink } from "./link";
import { Text as DemoText } from "./text";

const { withRootProvider, withContext } = createStyleContext(hoverCard);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider(HoverCard.Root);
export const RootProvider = withRootProvider(HoverCard.RootProvider);
export const Arrow = withContext(HoverCard.Arrow, "arrow");
export const ArrowTip = withContext(HoverCard.ArrowTip, "arrowTip");
export const Content = withContext(HoverCard.Content, "content");
export const Positioner = withContext(HoverCard.Positioner, "positioner");
export const Trigger = withContext(HoverCard.Trigger, "trigger");

export { HoverCardContext as Context } from "@ark-ui/solid/hover-card";

export interface HoverCardDemoProps {
  variantProps?: Record<string, string>;
}

export const HoverCardDemo = (props: HoverCardDemoProps) => {
  return (
    <Root {...(props.variantProps ?? {})}>
      <Trigger
        asChild={(props) => <DemoLink {...props()}>Hover Card Target</DemoLink>}
      />
      <Positioner>
        <Content>
          <DemoText>Hover card preview content</DemoText>
        </Content>
      </Positioner>
    </Root>
  );
};
