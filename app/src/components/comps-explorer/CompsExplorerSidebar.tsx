import { A } from "@solidjs/router";
import { For } from "solid-js";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import {
  DESIGN_SYSTEM_COLORS_KEY,
  DESIGN_SYSTEM_EFFECTS_KEY,
  DESIGN_SYSTEM_LAYOUT_KEY,
  DESIGN_SYSTEM_MOTION_KEY,
  DESIGN_SYSTEM_TYPOGRAPHY_KEY,
  ERROR_OVERLAY_COMPONENT_KEY,
  type ExplorerComponentLink,
  type RecipeMeta,
} from "./compsExplorer.shared";

type CompsExplorerSidebarProps = {
  recipeList: RecipeMeta[];
  simpleComponentLinks: ExplorerComponentLink[];
  docsOnlyComponentLinks: ExplorerComponentLink[];
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
      h="dvh"
      overflowY="auto"
      borderRightWidth="1px"
      borderColor="border"
      p="2"
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
              href={`/comps/${DESIGN_SYSTEM_COLORS_KEY}`}
              class={navLinkClass(
                props.selectedComponent === DESIGN_SYSTEM_COLORS_KEY,
              )}
            >
              Colors
            </A>
            <A
              href={`/comps/${DESIGN_SYSTEM_LAYOUT_KEY}`}
              class={navLinkClass(
                props.selectedComponent === DESIGN_SYSTEM_LAYOUT_KEY,
              )}
            >
              Layout
            </A>
            <A
              href={`/comps/${DESIGN_SYSTEM_TYPOGRAPHY_KEY}`}
              class={navLinkClass(
                props.selectedComponent === DESIGN_SYSTEM_TYPOGRAPHY_KEY,
              )}
            >
              Typography
            </A>
            <A
              href={`/comps/${DESIGN_SYSTEM_MOTION_KEY}`}
              class={navLinkClass(
                props.selectedComponent === DESIGN_SYSTEM_MOTION_KEY,
              )}
            >
              Motion
            </A>
            <A
              href={`/comps/${DESIGN_SYSTEM_EFFECTS_KEY}`}
              class={navLinkClass(
                props.selectedComponent === DESIGN_SYSTEM_EFFECTS_KEY,
              )}
            >
              Effects
            </A>
          </HStack>
        </VStack>

        <VStack alignItems="stretch" gap="1.5">
          <Box textStyle="2xs" color="fg.muted" fontWeight="semibold">
            SIMPLE WRAPPERS
          </Box>
          <HStack alignItems="flex-start" gap="1.5" flexWrap="wrap">
            <For each={props.simpleComponentLinks}>
              {(component) => (
                <A
                  href={`/comps/${component.key}`}
                  class={navLinkClass(props.selectedComponent === component.key)}
                >
                  {component.label}
                </A>
              )}
            </For>
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
                  href={`/comps/${recipe.key}`}
                  class={navLinkClass(props.selectedComponent === recipe.key)}
                >
                  {recipe.label}
                </A>
              )}
            </For>
            <For each={props.docsOnlyComponentLinks}>
              {(component) => (
                <A
                  href={`/comps/${component.key}`}
                  class={navLinkClass(props.selectedComponent === component.key)}
                >
                  {component.label}
                </A>
              )}
            </For>
            <A
              href={`/comps/${ERROR_OVERLAY_COMPONENT_KEY}`}
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
