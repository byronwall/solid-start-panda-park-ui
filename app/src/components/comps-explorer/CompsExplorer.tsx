import { useLocation } from "@solidjs/router";
import { For, Show, createMemo, createSignal } from "solid-js";
import { Box, HStack, VStack } from "styled-system/jsx";
import {
  DesignSystemOverview,
  type DesignSystemSection,
} from "./DesignSystemOverview";
import { CompsExplorerSidebar } from "./CompsExplorerSidebar";
import { ErrorOverlayPlayground } from "./ErrorOverlayPlayground";
import { RecipeExplorerPanel } from "./RecipeExplorerPanel";
import {
  DESIGN_SYSTEM_COLORS_KEY,
  DESIGN_SYSTEM_EFFECTS_KEY,
  DESIGN_SYSTEM_LAYOUT_KEY,
  DESIGN_SYSTEM_MOTION_KEY,
  DESIGN_SYSTEM_TYPOGRAPHY_KEY,
  ERROR_OVERLAY_COMPONENT_KEY,
  friendlyName,
  getVariantMap,
  type AxisLayout,
  type AxisSelection,
  type Combo,
  type GridMode,
  type RecipeLike,
  type RecipeMeta,
} from "./compsExplorer.shared";
import { recipes } from "~/theme/recipes";

const isDesignSystemKey = (value: string) =>
  value === DESIGN_SYSTEM_COLORS_KEY ||
  value === DESIGN_SYSTEM_LAYOUT_KEY ||
  value === DESIGN_SYSTEM_TYPOGRAPHY_KEY ||
  value === DESIGN_SYSTEM_MOTION_KEY ||
  value === DESIGN_SYSTEM_EFFECTS_KEY ||
  value === "design-system-sizes" ||
  value === "design-system-theme";

const getDesignSystemSection = (
  selectedComponent: string,
): DesignSystemSection =>
  selectedComponent === DESIGN_SYSTEM_LAYOUT_KEY ||
  selectedComponent === "design-system-sizes" ||
  selectedComponent === "design-system-theme"
    ? "layout"
    : selectedComponent === DESIGN_SYSTEM_TYPOGRAPHY_KEY
      ? "typography"
      : selectedComponent === DESIGN_SYSTEM_MOTION_KEY
        ? "motion"
        : selectedComponent === DESIGN_SYSTEM_EFFECTS_KEY
          ? "effects"
          : "colors";

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
    Record<string, AxisSelection>
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
    return DESIGN_SYSTEM_LAYOUT_KEY;
  });

  const selectedRecipeKey = createMemo(() => {
    const key = selectedComponent();
    if (recipeList().some((recipe) => recipe.key === key)) return key;
    return recipeList()[0]?.key ?? "";
  });

  const visibleRecipes = createMemo(() => {
    const selected = selectedRecipeKey();
    const filtered = recipeList().filter((recipe) => recipe.key === selected);
    return filtered.length > 0 ? filtered : recipeList().slice(0, 1);
  });

  return (
    <Box minH="dvh" bg="bg.default" color="fg.default">
      <HStack alignItems="flex-start" gap="0" minH="dvh">
        <CompsExplorerSidebar
          recipeList={recipeList()}
          selectedComponent={selectedComponent()}
        />

        <Box as="main" flex="1" minW="0" p={{ base: "3", md: "4" }}>
          <Box pt={{ base: "2", md: "3" }}>
            <VStack alignItems="stretch" gap="5">
              <Show
                when={isDesignSystemKey(selectedComponent())}
                fallback={
                  <Show
                    when={selectedComponent() === ERROR_OVERLAY_COMPONENT_KEY}
                    fallback={
                      <For each={visibleRecipes()}>
                        {(recipe) => (
                          <RecipeExplorerPanel
                            recipe={recipe}
                            selectedVariants={
                              selectedVariantsByRecipe()[recipe.key] ?? {}
                            }
                            modeByRecipe={modeByRecipe()[recipe.key]}
                            axisLayoutByRecipe={
                              axisLayoutByRecipe()[recipe.key]
                            }
                            axisSelectionByRecipe={axesByRecipe()[recipe.key]}
                            onSelectVariant={(axis, option) =>
                              setSelectedVariantsByRecipe((prev) => ({
                                ...prev,
                                [recipe.key]: {
                                  ...(prev[recipe.key] ?? {}),
                                  [axis]: option,
                                },
                              }))
                            }
                            onSetMode={(mode) =>
                              setModeByRecipe((prev) => ({
                                ...prev,
                                [recipe.key]: mode,
                              }))
                            }
                            onSetAxisOne={(axis) =>
                              setAxesByRecipe((prev) => ({
                                ...prev,
                                [recipe.key]: {
                                  ...(prev[recipe.key] ?? {}),
                                  one: axis,
                                },
                              }))
                            }
                            onSetAxisX={(axis) =>
                              setAxesByRecipe((prev) => ({
                                ...prev,
                                [recipe.key]: {
                                  ...(prev[recipe.key] ?? {}),
                                  x: axis,
                                },
                              }))
                            }
                            onSetAxisY={(axis) =>
                              setAxesByRecipe((prev) => ({
                                ...prev,
                                [recipe.key]: {
                                  ...(prev[recipe.key] ?? {}),
                                  y: axis,
                                },
                              }))
                            }
                            onSetAxisLayout={(layout) =>
                              setAxisLayoutByRecipe((prev) => ({
                                ...prev,
                                [recipe.key]: layout,
                              }))
                            }
                          />
                        )}
                      </For>
                    }
                  >
                    <ErrorOverlayPlayground />
                  </Show>
                }
              >
                <DesignSystemOverview
                  section={getDesignSystemSection(selectedComponent())}
                />
              </Show>
            </VStack>
          </Box>
        </Box>
      </HStack>
    </Box>
  );
};
