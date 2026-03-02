import { A, useLocation } from "@solidjs/router";
import { For, Show, createMemo, createSignal } from "solid-js";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";
import { DesignSystemOverview } from "./DesignSystemOverview";
import { ErrorOverlayPlayground } from "./ErrorOverlayPlayground";
import { Button } from "~/components/ui/button";
import { Code } from "~/components/ui/code";
import { DEMO_COMPONENTS } from "~/components/ui/demos";
import { recipes } from "~/theme/recipes";

type Combo = Record<string, string>;
type GridMode = "single" | "grid1d" | "grid2d";
type AxisLayout = "horizontal" | "vertical";
type RecipeLike = {
  variants?: Record<string, Record<string, unknown>>;
  defaultVariants?: Record<string, string>;
};

type RecipeMeta = {
  key: string;
  label: string;
  variantMap: Record<string, string[]>;
  defaultVariants: Record<string, string>;
};

const ERROR_OVERLAY_COMPONENT_KEY = "error-overlay";
const DESIGN_SYSTEM_COLORS_KEY = "design-system-colors";
const DESIGN_SYSTEM_SIZES_KEY = "design-system-sizes";

const friendlyName = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

const getVariantMap = (recipe: RecipeLike): Record<string, string[]> => {
  const variants = recipe.variants ?? {};

  return Object.fromEntries(
    Object.entries(variants)
      .map(([axis, options]) => [axis, Object.keys(options)])
      .filter(([, options]) => options.length > 0),
  );
};

const resolveCombo = (recipe: RecipeMeta, selected: Combo): Combo => {
  const next: Combo = {};

  for (const [axis, options] of Object.entries(recipe.variantMap)) {
    const selectedValue = selected[axis];
    const defaultValue = recipe.defaultVariants[axis];

    if (selectedValue && options.includes(selectedValue)) {
      next[axis] = selectedValue;
      continue;
    }

    if (defaultValue && options.includes(defaultValue)) {
      next[axis] = defaultValue;
      continue;
    }

    if (options[0]) {
      next[axis] = options[0];
    }
  }

  return next;
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

export const CompsExplorer = () => {
  const location = useLocation();
  const [selectedVariantsByRecipe, setSelectedVariantsByRecipe] = createSignal<
    Record<string, Combo>
  >({});
  const [modeByRecipe, setModeByRecipe] = createSignal<
    Record<string, GridMode>
  >({});
  const [axisLayoutByRecipe, setAxisLayoutByRecipe] = createSignal<
    Record<string, AxisLayout>
  >({});
  const [axesByRecipe, setAxesByRecipe] = createSignal<
    Record<string, { one?: string; x?: string; y?: string }>
  >({});

  const recipeList = createMemo<RecipeMeta[]>(() =>
    Object.entries(recipes)
      .map(([key, recipe]) => {
        const typedRecipe = recipe as RecipeLike;
        return {
          key,
          label: friendlyName(key),
          variantMap: getVariantMap(typedRecipe),
          defaultVariants: typedRecipe.defaultVariants ?? {},
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label)),
  );

  const selectedComponent = createMemo(() => {
    const fromQuery = location.query.component;
    if (typeof fromQuery === "string") return fromQuery;
    return DESIGN_SYSTEM_COLORS_KEY;
  });

  const selectedRecipe = createMemo(() => {
    const key = selectedComponent();
    if (recipeList().some((recipe) => recipe.key === key)) return key;
    return recipeList()[0]?.key ?? "";
  });

  const visibleRecipes = createMemo(() => {
    const selected = selectedRecipe();
    const filtered = recipeList().filter((recipe) => recipe.key === selected);
    return filtered.length > 0 ? filtered : recipeList().slice(0, 1);
  });

  return (
    <Box minH="dvh" bg="bg.default" color="fg.default">
      <HStack alignItems="flex-start" gap="0" minH="dvh">
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
                  class={css({
                    textDecoration: "none",
                    px: "2",
                    py: "0.75",
                    borderRadius: "l1",
                    borderWidth: "1px",
                    borderColor:
                      selectedComponent() === DESIGN_SYSTEM_COLORS_KEY
                        ? "blue.7"
                        : "border",
                    bg:
                      selectedComponent() === DESIGN_SYSTEM_COLORS_KEY
                        ? "blue.subtle.bg"
                        : "transparent",
                    color:
                      selectedComponent() === DESIGN_SYSTEM_COLORS_KEY
                        ? "blue.subtle.fg"
                        : "fg.default",
                    textStyle: "2xs",
                    fontWeight: "medium",
                    lineHeight: "tight",
                    whiteSpace: "nowrap",
                  })}
                >
                  Colors
                </A>
                <A
                  href={`/comps?component=${DESIGN_SYSTEM_SIZES_KEY}`}
                  class={css({
                    textDecoration: "none",
                    px: "2",
                    py: "0.75",
                    borderRadius: "l1",
                    borderWidth: "1px",
                    borderColor:
                      selectedComponent() === DESIGN_SYSTEM_SIZES_KEY
                        ? "blue.7"
                        : "border",
                    bg:
                      selectedComponent() === DESIGN_SYSTEM_SIZES_KEY
                        ? "blue.subtle.bg"
                        : "transparent",
                    color:
                      selectedComponent() === DESIGN_SYSTEM_SIZES_KEY
                        ? "blue.subtle.fg"
                        : "fg.default",
                    textStyle: "2xs",
                    fontWeight: "medium",
                    lineHeight: "tight",
                    whiteSpace: "nowrap",
                  })}
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
                <For each={recipeList()}>
                  {(recipe) => (
                    <A
                      href={`/comps?component=${recipe.key}`}
                      class={css({
                        textDecoration: "none",
                        px: "2",
                        py: "0.75",
                        borderRadius: "l1",
                        borderWidth: "1px",
                        borderColor:
                          selectedComponent() === recipe.key
                            ? "blue.7"
                            : "border",
                        bg:
                          selectedComponent() === recipe.key
                            ? "blue.subtle.bg"
                            : "transparent",
                        color:
                          selectedComponent() === recipe.key
                            ? "blue.subtle.fg"
                            : "fg.default",
                        textStyle: "2xs",
                        fontWeight: "medium",
                        lineHeight: "tight",
                        whiteSpace: "nowrap",
                      })}
                    >
                      {recipe.label}
                    </A>
                  )}
                </For>
                <A
                  href={`/comps?component=${ERROR_OVERLAY_COMPONENT_KEY}`}
                  class={css({
                    textDecoration: "none",
                    px: "2",
                    py: "0.75",
                    borderRadius: "l1",
                    borderWidth: "1px",
                    borderColor:
                      selectedComponent() === ERROR_OVERLAY_COMPONENT_KEY
                        ? "red.7"
                        : "border",
                    bg:
                      selectedComponent() === ERROR_OVERLAY_COMPONENT_KEY
                        ? "red.subtle.bg"
                        : "transparent",
                    color:
                      selectedComponent() === ERROR_OVERLAY_COMPONENT_KEY
                        ? "red.subtle.fg"
                        : "fg.default",
                    textStyle: "2xs",
                    fontWeight: "medium",
                    lineHeight: "tight",
                    whiteSpace: "nowrap",
                  })}
                >
                  Error Overlay
                </A>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Box as="main" flex="1" minW="0" p={{ base: "3", md: "4" }}>
          <Box pt={{ base: "2", md: "3" }}>
            <VStack alignItems="stretch" gap="5">
              <Show
                when={
                  selectedComponent() === DESIGN_SYSTEM_COLORS_KEY ||
                  selectedComponent() === DESIGN_SYSTEM_SIZES_KEY
                }
                fallback={
                  <Show
                    when={selectedComponent() === ERROR_OVERLAY_COMPONENT_KEY}
                    fallback={
                      <For each={visibleRecipes()}>
                        {(recipe) => {
                          const variantEntries = Object.entries(
                            recipe.variantMap,
                          );
                          const useVariantGrid = recipe.key !== "dialog";
                          const axes = variantEntries.map(([axis]) => axis);
                          const gridAxes = axes.filter(
                            (axis) =>
                              (recipe.variantMap[axis]?.length ?? 0) > 1,
                          );
                          const selectedCombo = createMemo(() =>
                            resolveCombo(
                              recipe,
                              selectedVariantsByRecipe()[recipe.key] ?? {},
                            ),
                          );

                          const mode = createMemo<GridMode>(() => {
                            if (!useVariantGrid) return "single";
                            const stored = modeByRecipe()[recipe.key];
                            if (stored === "single") return "single";
                            if (stored === "grid1d" && gridAxes.length > 0)
                              return "grid1d";
                            if (stored === "grid2d" && gridAxes.length > 1)
                              return "grid2d";
                            if (gridAxes.length > 1) return "grid2d";
                            if (gridAxes.length > 0) return "grid1d";
                            return "single";
                          });

                          const axisSelection = createMemo(
                            () => axesByRecipe()[recipe.key] ?? {},
                          );
                          const axisLayout = createMemo<AxisLayout>(
                            () =>
                              axisLayoutByRecipe()[recipe.key] ?? "horizontal",
                          );

                          const axis1 = createMemo(() => {
                            const selected = axisSelection().one;
                            if (selected && gridAxes.includes(selected))
                              return selected;
                            return gridAxes[0] ?? "";
                          });

                          const axisX = createMemo(() => {
                            const selected = axisSelection().x;
                            if (selected && gridAxes.includes(selected))
                              return selected;
                            return gridAxes[0] ?? "";
                          });

                          const axisY = createMemo(() => {
                            const selected = axisSelection().y;
                            if (
                              selected &&
                              gridAxes.includes(selected) &&
                              selected !== axisX()
                            )
                              return selected;
                            const fallback = gridAxes.find(
                              (axis) => axis !== axisX(),
                            );
                            return fallback ?? axisX();
                          });

                          const renderCell = (combo: Combo) => (
                            <Box
                              p="2"
                              display="inline-flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Box width="fit-content">
                                {renderRecipeDemo(recipe.key, combo)}
                              </Box>
                            </Box>
                          );

                          return (
                            <Box id={`recipe-${recipe.key}`}>
                              <VStack alignItems="stretch" gap="4">
                                <HStack
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Box
                                    textStyle={{ base: "xl", md: "2xl" }}
                                    fontWeight="semibold"
                                  >
                                    {recipe.label}
                                  </Box>
                                  <Show when={recipe.key === "toast"}>
                                    <Box textStyle="xs" color="fg.muted">
                                      Click button to verify toast behavior.
                                    </Box>
                                  </Show>
                                </HStack>

                                <Show
                                  when={
                                    variantEntries.length > 0 && useVariantGrid
                                  }
                                >
                                  <VStack
                                    alignItems="stretch"
                                    gap="1.5"
                                    borderWidth="1px"
                                    borderColor="border"
                                    borderRadius="l2"
                                    p="2.5"
                                    bg="bg.subtle"
                                  >
                                    <HStack
                                      alignItems="start"
                                      gap="2"
                                      flexWrap="wrap"
                                    >
                                      <For each={variantEntries}>
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
                                            <Box
                                              textStyle="xs"
                                              color="fg.muted"
                                              whiteSpace="nowrap"
                                            >
                                              {axis}
                                            </Box>
                                            <HStack gap="1" flexWrap="wrap">
                                              <For each={options}>
                                                {(option) => (
                                                  <Button
                                                    size="xs"
                                                    variant={
                                                      selectedCombo()[axis] ===
                                                      option
                                                        ? "solid"
                                                        : "outline"
                                                    }
                                                    onClick={() =>
                                                      setSelectedVariantsByRecipe(
                                                        (prev) => ({
                                                          ...prev,
                                                          [recipe.key]: {
                                                            ...(prev[
                                                              recipe.key
                                                            ] ?? {}),
                                                            [axis]: option,
                                                          },
                                                        }),
                                                      )
                                                    }
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
                                        <Box
                                          textStyle="xs"
                                          color="fg.muted"
                                          whiteSpace="nowrap"
                                        >
                                          mode
                                        </Box>
                                        <HStack gap="1" flexWrap="wrap">
                                          <Button
                                            size="xs"
                                            variant={
                                              mode() === "single"
                                                ? "solid"
                                                : "outline"
                                            }
                                            onClick={() =>
                                              setModeByRecipe((prev) => ({
                                                ...prev,
                                                [recipe.key]: "single",
                                              }))
                                            }
                                          >
                                            Single
                                          </Button>
                                          <Button
                                            size="xs"
                                            variant={
                                              mode() === "grid1d"
                                                ? "solid"
                                                : "outline"
                                            }
                                            disabled={gridAxes.length === 0}
                                            onClick={() =>
                                              setModeByRecipe((prev) => ({
                                                ...prev,
                                                [recipe.key]: "grid1d",
                                              }))
                                            }
                                          >
                                            1D
                                          </Button>
                                          <Button
                                            size="xs"
                                            variant={
                                              mode() === "grid2d"
                                                ? "solid"
                                                : "outline"
                                            }
                                            disabled={gridAxes.length < 2}
                                            onClick={() =>
                                              setModeByRecipe((prev) => ({
                                                ...prev,
                                                [recipe.key]: "grid2d",
                                              }))
                                            }
                                          >
                                            2D
                                          </Button>
                                        </HStack>
                                      </HStack>

                                      <Show
                                        when={
                                          mode() === "grid1d" &&
                                          gridAxes.length > 0
                                        }
                                      >
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
                                          <Box
                                            textStyle="xs"
                                            color="fg.muted"
                                            whiteSpace="nowrap"
                                          >
                                            1d axis
                                          </Box>
                                          <HStack gap="1" flexWrap="wrap">
                                            <For each={gridAxes}>
                                              {(axis) => (
                                                <Button
                                                  size="xs"
                                                  variant={
                                                    axis1() === axis
                                                      ? "solid"
                                                      : "outline"
                                                  }
                                                  onClick={() =>
                                                    setAxesByRecipe((prev) => ({
                                                      ...prev,
                                                      [recipe.key]: {
                                                        ...(prev[recipe.key] ??
                                                          {}),
                                                        one: axis,
                                                      },
                                                    }))
                                                  }
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
                                          <Box
                                            textStyle="xs"
                                            color="fg.muted"
                                            whiteSpace="nowrap"
                                          >
                                            1d layout
                                          </Box>
                                          <HStack gap="1" flexWrap="wrap">
                                            <Button
                                              size="xs"
                                              variant={
                                                axisLayout() === "horizontal"
                                                  ? "solid"
                                                  : "outline"
                                              }
                                              onClick={() =>
                                                setAxisLayoutByRecipe(
                                                  (prev) => ({
                                                    ...prev,
                                                    [recipe.key]: "horizontal",
                                                  }),
                                                )
                                              }
                                            >
                                              Horizontal
                                            </Button>
                                            <Button
                                              size="xs"
                                              variant={
                                                axisLayout() === "vertical"
                                                  ? "solid"
                                                  : "outline"
                                              }
                                              onClick={() =>
                                                setAxisLayoutByRecipe(
                                                  (prev) => ({
                                                    ...prev,
                                                    [recipe.key]: "vertical",
                                                  }),
                                                )
                                              }
                                            >
                                              Vertical
                                            </Button>
                                          </HStack>
                                        </HStack>
                                      </Show>

                                      <Show
                                        when={
                                          mode() === "grid2d" &&
                                          gridAxes.length > 1
                                        }
                                      >
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
                                          <Box
                                            textStyle="xs"
                                            color="fg.muted"
                                            whiteSpace="nowrap"
                                          >
                                            2d axes
                                          </Box>
                                          <HStack
                                            gap="1"
                                            alignItems="center"
                                            flexWrap="wrap"
                                          >
                                            <Box
                                              textStyle="xs"
                                              color="fg.muted"
                                            >
                                              x
                                            </Box>
                                            <HStack gap="1" flexWrap="wrap">
                                              <For each={gridAxes}>
                                                {(axis) => (
                                                  <Button
                                                    size="xs"
                                                    variant={
                                                      axisX() === axis
                                                        ? "solid"
                                                        : "outline"
                                                    }
                                                    onClick={() =>
                                                      setAxesByRecipe(
                                                        (prev) => ({
                                                          ...prev,
                                                          [recipe.key]: {
                                                            ...(prev[
                                                              recipe.key
                                                            ] ?? {}),
                                                            x: axis,
                                                          },
                                                        }),
                                                      )
                                                    }
                                                  >
                                                    {axis}
                                                  </Button>
                                                )}
                                              </For>
                                            </HStack>
                                          </HStack>
                                          <HStack
                                            gap="1"
                                            alignItems="center"
                                            flexWrap="wrap"
                                          >
                                            <Box
                                              textStyle="xs"
                                              color="fg.muted"
                                            >
                                              y
                                            </Box>
                                            <HStack gap="1" flexWrap="wrap">
                                              <For
                                                each={gridAxes.filter(
                                                  (axis) => axis !== axisX(),
                                                )}
                                              >
                                                {(axis) => (
                                                  <Button
                                                    size="xs"
                                                    variant={
                                                      axisY() === axis
                                                        ? "solid"
                                                        : "outline"
                                                    }
                                                    onClick={() =>
                                                      setAxesByRecipe(
                                                        (prev) => ({
                                                          ...prev,
                                                          [recipe.key]: {
                                                            ...(prev[
                                                              recipe.key
                                                            ] ?? {}),
                                                            y: axis,
                                                          },
                                                        }),
                                                      )
                                                    }
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

                                <Show
                                  when={
                                    variantEntries.length === 0 ||
                                    !useVariantGrid
                                  }
                                >
                                  <Box textStyle="sm" color="fg.muted">
                                    <Show
                                      when={useVariantGrid}
                                      fallback={
                                        <>
                                          Variants are configured within the
                                          example itself for this component.
                                        </>
                                      }
                                    >
                                      No recipe variants. Showing static
                                      template.
                                    </Show>
                                  </Box>
                                </Show>

                                <Show when={mode() === "single"}>
                                  {renderCell(selectedCombo())}
                                </Show>

                                <Show
                                  when={
                                    useVariantGrid &&
                                    mode() === "grid1d" &&
                                    axis1()
                                  }
                                >
                                  <Show
                                    when={axisLayout() === "horizontal"}
                                    fallback={
                                      <VStack alignItems="stretch" gap="3">
                                        <For
                                          each={
                                            recipe.variantMap[axis1()] ?? []
                                          }
                                        >
                                          {(option) => {
                                            const combo = {
                                              ...selectedCombo(),
                                              [axis1()]: option,
                                            };

                                            return (
                                              <VStack
                                                alignItems="stretch"
                                                gap="1.5"
                                              >
                                                <Box
                                                  textStyle="xs"
                                                  color="fg.muted"
                                                >
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
                                      <HStack
                                        alignItems="stretch"
                                        gap="2.5"
                                        flexWrap="nowrap"
                                      >
                                        <For
                                          each={
                                            recipe.variantMap[axis1()] ?? []
                                          }
                                        >
                                          {(option) => {
                                            const combo = {
                                              ...selectedCombo(),
                                              [axis1()]: option,
                                            };

                                            return (
                                              <VStack
                                                alignItems="stretch"
                                                gap="1.5"
                                              >
                                                <Box
                                                  textStyle="xs"
                                                  color="fg.muted"
                                                >
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
                                  when={
                                    useVariantGrid &&
                                    mode() === "grid2d" &&
                                    axisX() &&
                                    axisY()
                                  }
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
                                            {axisY()} \ {axisX()}
                                          </th>
                                          <For
                                            each={
                                              recipe.variantMap[axisX()] ?? []
                                            }
                                          >
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
                                        <For
                                          each={
                                            recipe.variantMap[axisY()] ?? []
                                          }
                                        >
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
                                              <For
                                                each={
                                                  recipe.variantMap[axisX()] ??
                                                  []
                                                }
                                              >
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
                                                        borderBottomWidth:
                                                          "1px",
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
                        }}
                      </For>
                    }
                  >
                    <ErrorOverlayPlayground />
                  </Show>
                }
              >
                <DesignSystemOverview
                  section={
                    selectedComponent() === DESIGN_SYSTEM_SIZES_KEY
                      ? "sizes"
                      : "colors"
                  }
                />
              </Show>
            </VStack>
          </Box>
        </Box>
      </HStack>
    </Box>
  );
};
