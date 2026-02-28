import { Menu, useMenuItemContext } from "@ark-ui/solid/menu";
import { CheckIcon, ChevronDownIcon } from "lucide-solid";
import type { ComponentProps } from "solid-js";
import { Show } from "solid-js";
import { createStyleContext, type HTMLStyledProps } from "styled-system/jsx";
import { menu } from "styled-system/recipes";
import { Button as DemoButton } from "./button";

const { withRootProvider, withContext } = createStyleContext(menu);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider(Menu.Root, {
  defaultProps: () => ({ unmountOnExit: true, lazyMount: true }),
});
export const RootProvider = withRootProvider(Menu.Root, {
  defaultProps: () => ({ unmountOnExit: true, lazyMount: true }),
});
export const Arrow = withContext(Menu.Arrow, "arrow");
export const ArrowTip = withContext(Menu.ArrowTip, "arrowTip");
export const CheckboxItem = withContext(Menu.CheckboxItem, "item");
export const Content = withContext(Menu.Content, "content");
export const ContextTrigger = withContext(
  Menu.ContextTrigger,
  "contextTrigger",
);
export const Indicator = withContext(Menu.Indicator, "indicator", {
  defaultProps: () => ({ children: <ChevronDownIcon /> }),
});
export const Item = withContext(Menu.Item, "item");
export const ItemGroup = withContext(Menu.ItemGroup, "itemGroup");
export const ItemGroupLabel = withContext(
  Menu.ItemGroupLabel,
  "itemGroupLabel",
);
export const ItemText = withContext(Menu.ItemText, "itemText");
export const Positioner = withContext(Menu.Positioner, "positioner");
export const RadioItem = withContext(Menu.RadioItem, "item");
export const RadioItemGroup = withContext(Menu.RadioItemGroup, "itemGroup");
export const Separator = withContext(Menu.Separator, "separator");
export const Trigger = withContext(Menu.Trigger, "trigger");
export const TriggerItem = withContext(Menu.TriggerItem, "item");

export {
  MenuContext as Context,
  type MenuSelectionDetails as SelectionDetails,
} from "@ark-ui/solid/menu";

const StyledItemIndicator = withContext(Menu.ItemIndicator, "itemIndicator");

export const ItemIndicator = (props: HTMLStyledProps<"div">) => {
  const item = useMenuItemContext();

  return (
    <Show when={item().checked} fallback={<svg aria-hidden="true" />}>
      <StyledItemIndicator {...props}>
        <CheckIcon />
      </StyledItemIndicator>
    </Show>
  );
};

export interface MenuDemoProps {
  variantProps?: Record<string, string>;
}

export const MenuDemo = (props: MenuDemoProps) => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const size = () =>
    sizes.find((value) => value === props.variantProps?.size) ?? "md";

  return (
    <Root
      {...(props.variantProps ?? {})}
      positioning={{ placement: "bottom-start" }}
      size={size()}
    >
      <Trigger
        asChild={(props) => {
          if (size() === "xs") {
            return (
              <DemoButton {...props()} size="xs">
                Open Menu
              </DemoButton>
            );
          }
          if (size() === "sm") {
            return (
              <DemoButton {...props()} size="sm">
                Open Menu
              </DemoButton>
            );
          }
          if (size() === "md") {
            return (
              <DemoButton {...props()} size="md">
                Open Menu
              </DemoButton>
            );
          }
          if (size() === "lg") {
            return (
              <DemoButton {...props()} size="lg">
                Open Menu
              </DemoButton>
            );
          }
          return (
            <DemoButton {...props()} size="xl">
              Open Menu
            </DemoButton>
          );
        }}
      />
      <Positioner>
        <Content>
          <Item value="new">
            <ItemText>New File</ItemText>
          </Item>
          <Item value="open">
            <ItemText>Open</ItemText>
          </Item>
        </Content>
      </Positioner>
    </Root>
  );
};
