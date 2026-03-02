import { Combobox, useComboboxItemContext } from "@ark-ui/solid/combobox";
import { useListCollection } from "@ark-ui/solid/collection";
import { ark } from "@ark-ui/solid/factory";
import { useFilter } from "@ark-ui/solid/locale";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-solid";
import { For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import {
  Box,
  HStack,
  VStack,
  createStyleContext,
  type HTMLStyledProps,
} from "styled-system/jsx";
import { type ComboboxVariantProps, combobox } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(combobox);

export type RootProps = HTMLStyledProps<"div"> & ComboboxVariantProps;

export const Root = withProvider(Combobox.Root, "root", {
  defaultProps: () => ({ positioning: { sameWidth: false } }),
}) as Combobox.RootComponent<RootProps>;

export const RootProvider = withProvider(
  Combobox.RootProvider,
  "root",
) as Combobox.RootProviderComponent<RootProps>;

export const ClearTrigger = withContext(Combobox.ClearTrigger, "clearTrigger", {
  defaultProps: () => ({ children: <XIcon /> }),
});
export const Content = withContext(Combobox.Content, "content");
export const Control = withContext(Combobox.Control, "control");
export const Empty = withContext(Combobox.Empty, "empty");
export const IndicatorGroup = withContext(ark.div, "indicatorGroup");
export const Input = withContext(Combobox.Input, "input");
export const Item = withContext(Combobox.Item, "item");
export const ItemGroup = withContext(Combobox.ItemGroup, "itemGroup");
export const ItemGroupLabel = withContext(
  Combobox.ItemGroupLabel,
  "itemGroupLabel",
);
export const ItemText = withContext(Combobox.ItemText, "itemText");
export const Label = withContext(Combobox.Label, "label");
export const List = withContext(Combobox.List, "list");
export const Positioner = withContext(Combobox.Positioner, "positioner");
export const Trigger = withContext(Combobox.Trigger, "trigger", {
  defaultProps: () => ({ children: <ChevronsUpDownIcon /> }),
});

export { ComboboxContext as Context } from "@ark-ui/solid/combobox";

const StyledItemIndicator = withContext(
  Combobox.ItemIndicator,
  "itemIndicator",
);

export const ItemIndicator = (props: HTMLStyledProps<"div">) => {
  const item = useComboboxItemContext();

  return (
    <Show when={item().selected} fallback={<svg aria-hidden="true" />}>
      <StyledItemIndicator {...props}>
        <CheckIcon />
      </StyledItemIndicator>
    </Show>
  );
};

export interface ComboboxDemoProps {
  variantProps?: Record<string, string>;
}

export const ComboboxDemo = (props: ComboboxDemoProps) => {
  const filterFn = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: frameworkItems,
    filter: filterFn().contains,
  });

  return (
    <HStack alignItems="start" gap="6" flexWrap="wrap" width="full" maxW="6xl">
      <VStack as="section" alignItems="start" gap="2" minW="72" flex="1">
        <Box as="h3" fontWeight="semibold">
          Searchable
        </Box>
        <Box textStyle="xs" color="fg.muted">
          Type to filter options, clear input, and select an item from results.
        </Box>
        <Root
          {...(props.variantProps ?? {})}
          collection={collection()}
          onInputValueChange={(event) => filter(event.inputValue)}
          style={{ width: "18rem" }}
        >
          <Label>Framework</Label>
          <Control>
            <Input placeholder="Type to search" />
            <IndicatorGroup>
              <ClearTrigger />
              <Trigger />
            </IndicatorGroup>
          </Control>
          <Portal>
            <Positioner>
              <Content>
                <Empty>No items found</Empty>
                <For each={collection().items}>
                  {(item) => (
                    <Item item={item}>
                      <ItemText>{item.label}</ItemText>
                      <ItemIndicator />
                    </Item>
                  )}
                </For>
              </Content>
            </Positioner>
          </Portal>
        </Root>
      </VStack>

      <VStack as="section" alignItems="start" gap="2" minW="72" flex="1">
        <Box as="h3" fontWeight="semibold">
          Grouped Items
        </Box>
        <Box textStyle="xs" color="fg.muted">
          Demonstrates grouped options with section labels.
        </Box>
        <Root
          {...(props.variantProps ?? {})}
          collection={collection()}
          onInputValueChange={(event) => filter(event.inputValue)}
          style={{ width: "18rem" }}
        >
          <Label>Framework</Label>
          <Control>
            <Input placeholder="Browse frameworks" />
            <IndicatorGroup>
              <ClearTrigger />
              <Trigger />
            </IndicatorGroup>
          </Control>
          <Portal>
            <Positioner>
              <Content>
                <Empty>No items found</Empty>
                <ItemGroup>
                  <ItemGroupLabel>Popular</ItemGroupLabel>
                  <For each={collection().items.slice(0, 4)}>
                    {(item) => (
                      <Item item={item}>
                        <ItemText>{item.label}</ItemText>
                        <ItemIndicator />
                      </Item>
                    )}
                  </For>
                </ItemGroup>
                <ItemGroup>
                  <ItemGroupLabel>Others</ItemGroupLabel>
                  <For each={collection().items.slice(4)}>
                    {(item) => (
                      <Item item={item}>
                        <ItemText>{item.label}</ItemText>
                        <ItemIndicator />
                      </Item>
                    )}
                  </For>
                </ItemGroup>
              </Content>
            </Positioner>
          </Portal>
        </Root>
      </VStack>
    </HStack>
  );
};

const frameworkItems = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Preact", value: "preact" },
  { label: "Qwik", value: "qwik" },
  { label: "Lit", value: "lit" },
  { label: "Alpine.js", value: "alpinejs" },
  { label: "Ember", value: "ember" },
  { label: "Next.js", value: "nextjs" },
];
