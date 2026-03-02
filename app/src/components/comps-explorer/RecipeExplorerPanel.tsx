import { For, Show, createMemo } from "solid-js";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";
import { Code } from "~/components/ui/code";
import { DEMO_COMPONENTS } from "~/components/ui/demos";
import { Button } from "~/components/ui/button";
import {
  resolveCombo,
  type AxisLayout,
  type AxisSelection,
  type Combo,
  type GridMode,
  type RecipeMeta,
} from "./compsExplorer.shared";

type RecipeExplorerPanelProps = {
  recipe: RecipeMeta;
  selectedVariants: Combo;
  modeByRecipe: GridMode | undefined;
  axisLayoutByRecipe: AxisLayout | undefined;
  axisSelectionByRecipe: AxisSelection | undefined;
  onSelectVariant: (axis: string, option: string) => void;
  onSetMode: (mode: GridMode) => void;
  onSetAxisOne: (axis: string) => void;
  onSetAxisX: (axis: string) => void;
  onSetAxisY: (axis: string) => void;
  onSetAxisLayout: (layout: AxisLayout) => void;
};

const renderRecipeDemo = (recipeKey: string, variantProps: Combo) => {
  const Demo = DEMO_COMPONENTS[recipeKey];

  if (Demo) {
    return <Demo variantProps={variantProps} />;
  }

  return (
    <Box textStyle="sm" color="fg.muted">
      No template yet for <Code>{recipeKey}</Code>.
    </Box>
  );
};

export const RecipeExplorerPanel = (props: RecipeExplorerPanelProps) => {
  const variantEntries = createMemo(() =>
    Object.entries(props.recipe.variantMap),
  );
  const useVariantGrid = createMemo(() => props.recipe.key !== "dialog");
  const axes = createMemo(() => variantEntries().map(([axis]) => axis));
  const gridAxes = createMemo(() =>
    axes().filter((axis) => (props.recipe.variantMap[axis]?.length ?? 0) > 1),
  );

  const selectedCombo = createMemo(() =>
    resolveCombo(props.recipe, props.selectedVariants),
  );

  const mode = createMemo<GridMode>(() => {
    if (!useVariantGrid()) return "single";
    const stored = props.modeByRecipe;
    if (stored === "single") return "single";
    if (stored === "grid1d" && gridAxes().length > 0) return "grid1d";
    if (stored === "grid2d" && gridAxes().length > 1) return "grid2d";
    if (gridAxes().length > 1) return "grid2d";
    if (gridAxes().length > 0) return "grid1d";
    return "single";
  });

  const axisSelection = createMemo(() => props.axisSelectionByRecipe ?? {});
  const axisLayout = createMemo<AxisLayout>(
    () => props.axisLayoutByRecipe ?? "horizontal",
  );

  const axis1 = createMemo(() => {
    const selected = axisSelection().one;
    if (selected && gridAxes().includes(selected)) return selected;
    return gridAxes()[0] ?? "";
  });

  const axisX = createMemo(() => {
    const selected = axisSelection().x;
    if (selected && gridAxes().includes(selected)) return selected;
    return gridAxes()[0] ?? "";
  });

  const axisY = createMemo(() => {
    const selected = axisSelection().y;
    if (selected && gridAxes().includes(selected) && selected !== axisX()) {
      return selected;
    }

    const fallback = gridAxes().find((axis) => axis !== axisX());
    return fallback ?? axisX();
  });

  const renderCell = (combo: Combo) => (
    <Box
      p="2"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box width="fit-content">{renderRecipeDemo(props.recipe.key, combo)}</Box>
    </Box>
  );

  return (
    <Box id={`recipe-${props.recipe.key}`}>
      <VStack alignItems="stretch" gap="4">
        <HStack justifyContent="space-between" alignItems="center">
          <Box textStyle={{ base: "xl", md: "2xl" }} fontWeight="semibold">
            {props.recipe.label}
          </Box>
          <Show when={props.recipe.key === "toast"}>
            <Box textStyle="xs" color="fg.muted">
              Click button to verify toast behavior.
            </Box>
          </Show>
        </HStack>

        <Show when={variantEntries().length > 0 && useVariantGrid()}>
          <VStack
            alignItems="stretch"
            gap="1.5"
            borderWidth="1px"
            borderColor="border"
            borderRadius="l2"
            p="2.5"
            bg="bg.subtle"
          >
            <HStack alignItems="start" gap="2" flexWrap="wrap">
              <For each={variantEntries()}>
                {([axis, options]) => (
                  <HStack
                    alignItems="center"
                    gap="1.5"
                    p="1.5"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="l2"
                    bg="bg.default"
                    flexWrap="wrap"
                  >
                    <Box textStyle="xs" color="fg.muted" whiteSpace="nowrap">
                      {axis}
                    </Box>
                    <HStack gap="1" flexWrap="wrap">
                      <For each={options}>
                        {(option) => (
                          <Button
                            size="xs"
                            variant={
                              selectedCombo()[axis] === option
                                ? "solid"
                                : "outline"
                            }
                            onClick={() => props.onSelectVariant(axis, option)}
                          >
                            {option}
                          </Button>
                        )}
                      </For>
                    </HStack>
                  </HStack>
                )}
              </For>

              <HStack
                alignItems="center"
                gap="1.5"
                p="1.5"
                borderWidth="1px"
                borderColor="border"
                borderRadius="l2"
                bg="bg.default"
                flexWrap="wrap"
              >
                <Box textStyle="xs" color="fg.muted" whiteSpace="nowrap">
                  mode
                </Box>
                <HStack gap="1" flexWrap="wrap">
                  <Button
                    size="xs"
                    variant={mode() === "single" ? "solid" : "outline"}
                    onClick={() => props.onSetMode("single")}
                  >
                    Single
                  </Button>
                  <Button
                    size="xs"
                    variant={mode() === "grid1d" ? "solid" : "outline"}
                    disabled={gridAxes().length === 0}
                    onClick={() => props.onSetMode("grid1d")}
                  >
                    1D
                  </Button>
                  <Button
                    size="xs"
                    variant={mode() === "grid2d" ? "solid" : "outline"}
                    disabled={gridAxes().length < 2}
                    onClick={() => props.onSetMode("grid2d")}
                  >
                    2D
                  </Button>
                </HStack>
              </HStack>

              <Show when={mode() === "grid1d" && gridAxes().length > 0}>
                <HStack
                  alignItems="center"
                  gap="1.5"
                  p="1.5"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l2"
                  bg="bg.default"
                  flexWrap="wrap"
                >
                  <Box textStyle="xs" color="fg.muted" whiteSpace="nowrap">
                    1d axis
                  </Box>
                  <HStack gap="1" flexWrap="wrap">
                    <For each={gridAxes()}>
                      {(axis) => (
                        <Button
                          size="xs"
                          variant={axis1() === axis ? "solid" : "outline"}
                          onClick={() => props.onSetAxisOne(axis)}
                        >
                          {axis}
                        </Button>
                      )}
                    </For>
                  </HStack>
                </HStack>
                <HStack
                  alignItems="center"
                  gap="1.5"
                  p="1.5"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l2"
                  bg="bg.default"
                  flexWrap="wrap"
                >
                  <Box textStyle="xs" color="fg.muted" whiteSpace="nowrap">
                    1d layout
                  </Box>
                  <HStack gap="1" flexWrap="wrap">
                    <Button
                      size="xs"
                      variant={
                        axisLayout() === "horizontal" ? "solid" : "outline"
                      }
                      onClick={() => props.onSetAxisLayout("horizontal")}
                    >
                      Horizontal
                    </Button>
                    <Button
                      size="xs"
                      variant={
                        axisLayout() === "vertical" ? "solid" : "outline"
                      }
                      onClick={() => props.onSetAxisLayout("vertical")}
                    >
                      Vertical
                    </Button>
                  </HStack>
                </HStack>
              </Show>

              <Show when={mode() === "grid2d" && gridAxes().length > 1}>
                <HStack
                  alignItems="center"
                  gap="1.5"
                  p="1.5"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l2"
                  bg="bg.default"
                  flexWrap="wrap"
                >
                  <Box textStyle="xs" color="fg.muted" whiteSpace="nowrap">
                    2d axes
                  </Box>
                  <HStack gap="1" alignItems="center" flexWrap="wrap">
                    <Box textStyle="xs" color="fg.muted">
                      x
                    </Box>
                    <HStack gap="1" flexWrap="wrap">
                      <For each={gridAxes()}>
                        {(axis) => (
                          <Button
                            size="xs"
                            variant={axisX() === axis ? "solid" : "outline"}
                            onClick={() => props.onSetAxisX(axis)}
                          >
                            {axis}
                          </Button>
                        )}
                      </For>
                    </HStack>
                  </HStack>
                  <HStack gap="1" alignItems="center" flexWrap="wrap">
                    <Box textStyle="xs" color="fg.muted">
                      y
                    </Box>
                    <HStack gap="1" flexWrap="wrap">
                      <For each={gridAxes().filter((axis) => axis !== axisX())}>
                        {(axis) => (
                          <Button
                            size="xs"
                            variant={axisY() === axis ? "solid" : "outline"}
                            onClick={() => props.onSetAxisY(axis)}
                          >
                            {axis}
                          </Button>
                        )}
                      </For>
                    </HStack>
                  </HStack>
                </HStack>
              </Show>
            </HStack>
          </VStack>
        </Show>

        <Show when={variantEntries().length === 0 || !useVariantGrid()}>
          <Box textStyle="sm" color="fg.muted">
            <Show
              when={useVariantGrid()}
              fallback={
                <>
                  Variants are configured within the example itself for this
                  component.
                </>
              }
            >
              No recipe variants. Showing static template.
            </Show>
          </Box>
        </Show>

        <Show when={mode() === "single"}>{renderCell(selectedCombo())}</Show>

        <Show when={useVariantGrid() && mode() === "grid1d" && axis1()}>
          <Show
            when={axisLayout() === "horizontal"}
            fallback={
              <VStack alignItems="stretch" gap="3">
                <For each={props.recipe.variantMap[axis1()] ?? []}>
                  {(option) => {
                    const combo = { ...selectedCombo(), [axis1()]: option };

                    return (
                      <VStack alignItems="stretch" gap="1.5">
                        <Box textStyle="xs" color="fg.muted">
                          {axis1()}: {option}
                        </Box>
                        {renderCell(combo)}
                      </VStack>
                    );
                  }}
                </For>
              </VStack>
            }
          >
            <Box overflowX="auto">
              <HStack alignItems="stretch" gap="2.5" flexWrap="nowrap">
                <For each={props.recipe.variantMap[axis1()] ?? []}>
                  {(option) => {
                    const combo = { ...selectedCombo(), [axis1()]: option };

                    return (
                      <VStack alignItems="stretch" gap="1.5">
                        <Box textStyle="xs" color="fg.muted">
                          {axis1()}: {option}
                        </Box>
                        {renderCell(combo)}
                      </VStack>
                    );
                  }}
                </For>
              </HStack>
            </Box>
          </Show>
        </Show>

        <Show
          when={useVariantGrid() && mode() === "grid2d" && axisX() && axisY()}
        >
          <Box overflowX="auto">
            <table
              class={css({
                width: "fit-content",
                borderCollapse: "collapse",
              })}
            >
              <thead>
                <tr>
                  <th
                    class={css({
                      p: "1",
                      borderBottomWidth: "1px",
                      borderColor: "border",
                      textAlign: "left",
                      textStyle: "xs",
                      color: "fg.muted",
                      fontWeight: "medium",
                      whiteSpace: "nowrap",
                    })}
                  >
                    {axisY()} \\ {axisX()}
                  </th>
                  <For each={props.recipe.variantMap[axisX()] ?? []}>
                    {(xOption) => (
                      <th
                        class={css({
                          p: "1",
                          borderBottomWidth: "1px",
                          borderColor: "border",
                          textAlign: "left",
                          textStyle: "xs",
                          fontWeight: "medium",
                          color: "fg.muted",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {xOption}
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody>
                <For each={props.recipe.variantMap[axisY()] ?? []}>
                  {(yOption) => (
                    <tr>
                      <th
                        class={css({
                          p: "1",
                          borderBottomWidth: "1px",
                          borderColor: "border",
                          textAlign: "left",
                          textStyle: "xs",
                          fontWeight: "medium",
                          color: "fg.muted",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {yOption}
                      </th>
                      <For each={props.recipe.variantMap[axisX()] ?? []}>
                        {(xOption) => {
                          const combo = {
                            ...selectedCombo(),
                            [axisY()]: yOption,
                            [axisX()]: xOption,
                          };

                          return (
                            <td
                              class={css({
                                p: "0.5 0.75rem",
                                borderBottomWidth: "1px",
                                borderColor: "border",
                                verticalAlign: "top",
                              })}
                            >
                              {renderCell(combo)}
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Box>
        </Show>
      </VStack>
    </Box>
  );
};
