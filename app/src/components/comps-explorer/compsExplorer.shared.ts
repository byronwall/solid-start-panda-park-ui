export type Combo = Record<string, string>;
export type GridMode = "single" | "grid1d" | "grid2d";
export type AxisLayout = "horizontal" | "vertical";
export type AxisSelection = { one?: string; x?: string; y?: string };

export type RecipeLike = {
  variants?: Record<string, Record<string, unknown>>;
  defaultVariants?: Record<string, string>;
};

export type RecipeMeta = {
  key: string;
  label: string;
  variantMap: Record<string, string[]>;
  defaultVariants: Record<string, string>;
};

export const ERROR_OVERLAY_COMPONENT_KEY = "error-overlay";
export const DESIGN_SYSTEM_COLORS_KEY = "design-system-colors";
export const DESIGN_SYSTEM_SIZES_KEY = "design-system-sizes";

export const friendlyName = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

export const getVariantMap = (recipe: RecipeLike): Record<string, string[]> => {
  const variants = recipe.variants ?? {};

  return Object.fromEntries(
    Object.entries(variants)
      .map(([axis, options]) => [axis, Object.keys(options)])
      .filter(([, options]) => options.length > 0),
  );
};

export const resolveCombo = (recipe: RecipeMeta, selected: Combo): Combo => {
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
