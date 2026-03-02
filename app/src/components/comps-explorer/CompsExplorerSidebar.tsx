import { A } from "@solidjs/router";
import { For } from "solid-js";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import {
  DESIGN_SYSTEM_COLORS_KEY,
  DESIGN_SYSTEM_SIZES_KEY,
  ERROR_OVERLAY_COMPONENT_KEY,
  type RecipeMeta,
} from "./compsExplorer.shared";

type CompsExplorerSidebarProps = {
  recipeList: RecipeMeta[];
  selectedComponent: string;
};

const navLinkClass = (isSelected: boolean, selectedColor = "blue") =>
  css({
    textDecoration: "none",
    px: "2",
    py: "0.75",
    borderRadius: "l1",
    borderWidth: "1px",
    borderColor: isSelected ? `${selectedColor}.7` : "border",
    bg: isSelected ? `${selectedColor}.subtle.bg` : "transparent",
    color: isSelected ? `${selectedColor}.subtle.fg` : "fg.default",
    textStyle: "2xs",
    fontWeight: "medium",
    lineHeight: "tight",
    whiteSpace: "nowrap",
  });

export const CompsExplorerSidebar = (props: CompsExplorerSidebarProps) => {
  return (
    <Box
      as="aside"
      w="300px"
      minW="300px"
      maxW="300px"
      borderRightWidth="1px"
      borderColor="border"
      p="2"
      position="sticky"
      top="0"
      alignSelf="start"
      minH="dvh"
      bg="bg.default"
      zIndex="10"
    >
      <VStack alignItems="stretch" gap="2">
        <A href="/" class={css({ textDecoration: "none" })}>
          <Button variant="outline" size="sm" width="full">
            Back Home
          </Button>
        </A>

        <VStack alignItems="stretch" gap="1.5">
          <Box textStyle="2xs" color="fg.muted" fontWeight="semibold">
            DESIGN SYSTEM
          </Box>
          <HStack alignItems="flex-start" gap="1.5" flexWrap="wrap">
            <A
              href={`/comps?component=${DESIGN_SYSTEM_COLORS_KEY}`}
              class={navLinkClass(
                props.selectedComponent === DESIGN_SYSTEM_COLORS_KEY,
              )}
            >
              Colors
            </A>
            <A
              href={`/comps?component=${DESIGN_SYSTEM_SIZES_KEY}`}
              class={navLinkClass(
                props.selectedComponent === DESIGN_SYSTEM_SIZES_KEY,
              )}
            >
              Sizes
            </A>
          </HStack>
        </VStack>

        <VStack alignItems="stretch" gap="1.5">
          <Box textStyle="2xs" color="fg.muted" fontWeight="semibold">
            COMPONENTS
          </Box>
          <HStack alignItems="flex-start" gap="1.5" flexWrap="wrap">
            <For each={props.recipeList}>
              {(recipe) => (
                <A
                  href={`/comps?component=${recipe.key}`}
                  class={navLinkClass(props.selectedComponent === recipe.key)}
                >
                  {recipe.label}
                </A>
              )}
            </For>
            <A
              href={`/comps?component=${ERROR_OVERLAY_COMPONENT_KEY}`}
              class={navLinkClass(
                props.selectedComponent === ERROR_OVERLAY_COMPONENT_KEY,
                "red",
              )}
            >
              Error Overlay
            </A>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};
