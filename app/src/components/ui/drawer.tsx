import { Dialog } from "@ark-ui/solid/dialog";
import { ark } from "@ark-ui/solid/factory";
import type { ComponentProps } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { drawer } from "styled-system/recipes";
import { Button as DemoButton } from "./button";

const { withRootProvider, withContext } = createStyleContext(drawer);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider(Dialog.Root, {
  defaultProps: () => ({ unmountOnExit: true, lazyMount: true }),
});
export const RootProvider = withRootProvider(Dialog.Root, {
  defaultProps: () => ({ unmountOnExit: true, lazyMount: true }),
});
export const Backdrop = withContext(Dialog.Backdrop, "backdrop");
export const Positioner = withContext(Dialog.Positioner, "positioner");
export const CloseTrigger = withContext(Dialog.CloseTrigger, "closeTrigger");
export const Content = withContext(Dialog.Content, "content");
export const Description = withContext(Dialog.Description, "description");
export const Title = withContext(Dialog.Title, "title");
export const Trigger = withContext(Dialog.Trigger, "trigger");

export const Body = withContext(ark.div, "body");
export const Header = withContext(ark.div, "header");
export const Footer = withContext(ark.div, "footer");

export { DialogContext as Context } from "@ark-ui/solid/dialog";

export interface DrawerDemoProps {
  variantProps?: Record<string, string>;
}

export const DrawerDemo = (props: DrawerDemoProps) => {
  return (
    <Root {...(props.variantProps ?? {})}>
      <Trigger
        asChild={(props) => <DemoButton {...props()}>Open Drawer</DemoButton>}
      />
      <Positioner>
        <Backdrop />
        <Content>
          <Header>
            <Title>Drawer Title</Title>
          </Header>
          <Body>
            <Description>Drawer body content.</Description>
          </Body>
        </Content>
      </Positioner>
    </Root>
  );
};
