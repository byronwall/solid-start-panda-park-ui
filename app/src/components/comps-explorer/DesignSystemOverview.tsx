import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { Button } from "~/components/ui/button";
import { recipes } from "~/theme/recipes";

type RecipeLike = {
  variants?: Record<string, Record<string, unknown>>;
};

type ParsedColorToken = {
  cssVar: string;
  palette: string;
  key: string;
  tokenPath: string;
};

type SizeMetric = {
  token: string;
  rawValue: string;
  pxValue: number | null;
  remValue: number | null;
  isTextual: boolean;
};

type SizeDisplayUnit = "rem" | "px";

type TypographyCssVars = {
  fonts: string[];
  fontSizes: string[];
  fontWeights: string[];
  lineHeights: string[];
  letterSpacings: string[];
};
type ThemeCategory = {
  key: string;
  label: string;
  group: "layout" | "motion" | "effects";
  tokenCategory: string;
  tokens: Array<{
    token: string;
    value: string | number;
    numericValue: number | null;
    isAlias: boolean;
  }>;
};

const THEME_CATEGORY_CONFIG = [
  {
    key: "radii",
    label: "Radii",
    prefix: "--radii-",
    tokenCategory: "radii",
    group: "layout",
  },
  {
    key: "shadows",
    label: "Shadows",
    prefix: "--shadows-",
    tokenCategory: "shadows",
    group: "effects",
  },
  {
    key: "durations",
    label: "Durations",
    prefix: "--durations-",
    tokenCategory: "durations",
    group: "motion",
  },
  {
    key: "zIndex",
    label: "Z Index",
    prefix: "--z-index-",
    tokenCategory: "zIndex",
    group: "layout",
  },
  {
    key: "easings",
    label: "Easings",
    prefix: "--easings-",
    tokenCategory: "easings",
    group: "motion",
  },
  {
    key: "animations",
    label: "Animations",
    prefix: "--animations-",
    tokenCategory: "animations",
    group: "motion",
  },
  {
    key: "breakpoints",
    label: "Breakpoints",
    prefix: "--breakpoints-",
    tokenCategory: "breakpoints",
    group: "layout",
  },
  {
    key: "aspectRatios",
    label: "Aspect Ratios",
    prefix: "--aspect-ratios-",
    tokenCategory: "aspectRatios",
    group: "layout",
  },
  {
    key: "blurs",
    label: "Blurs",
    prefix: "--blurs-",
    tokenCategory: "blurs",
    group: "effects",
  },
  {
    key: "borders",
    label: "Borders",
    prefix: "--borders-",
    tokenCategory: "borders",
    group: "layout",
  },
  {
    key: "spacing",
    label: "Spacing",
    prefix: "--spacing-",
    tokenCategory: "spacing",
    group: "layout",
  },
] as const;

const SIZE_REFERENCE_PATTERN = /(?:\{|token\()?\s*sizes\.([a-zA-Z0-9.-]+)/g;

const toSortedList = (values: Iterable<string>) =>
  Array.from(new Set(values)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

const collectStringValues = (value: unknown, result: string[]) => {
  if (typeof value === "string") {
    result.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, result);
    return;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectStringValues(nested, result);
    }
  }
};

const collectTokenReferences = (pattern: RegExp): string[] => {
  const stringValues: string[] = [];
  collectStringValues(recipes, stringValues);

  const matches: string[] = [];
  for (const value of stringValues) {
    for (const match of value.matchAll(pattern)) {
      const tokenKey = match[1];
      if (tokenKey) matches.push(tokenKey);
    }
  }

  return toSortedList(matches);
};

const getTokenValue = (path: string) =>
  token(path as Parameters<typeof token>[0], path);

const parseCssVarToken = (cssVar: string, prefix: string) =>
  cssVar.replace(prefix, "").replaceAll("\\.", ".");

const parseColorCssVar = (cssVar: string): ParsedColorToken => {
  const raw = parseCssVarToken(cssVar, "--colors-");
  const parts = raw.split("-");

  if (parts[0] === "color" && parts[1] === "palette") {
    const key = parts.slice(2).join(".") || "default";
    return {
      cssVar,
      palette: "colorPalette",
      key,
      tokenPath: key === "default" ? "colorPalette" : `colorPalette.${key}`,
    };
  }

  const palette = parts[0] ?? "misc";
  const key = parts.slice(1).join(".") || "default";

  return {
    cssVar,
    palette,
    key,
    tokenPath: key === "default" ? palette : `${palette}.${key}`,
  };
};

const isNumericShade = (value: string) => /^(?:[1-9]|1[0-2])$/.test(value);
const isAlphaShade = (value: string) => /^a(?:[1-9]|1[0-2])$/.test(value);
const isTextualSizeValue = (value: string) =>
  /(content|auto|fit-content|min-content|max-content)/.test(value);
const parseNumericTokenValue = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }
  if (typeof value !== "string") {
    return Number.NaN;
  }

  const match = value.match(/-?\d*\.?\d+/);
  if (!match) return Number.NaN;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const parseAspectRatioValue = (value: string) => {
  const match = value.match(/(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)/);
  if (!match) return Number.NaN;
  const numerator = Number.parseFloat(match[1]);
  const denominator = Number.parseFloat(match[2]);
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return Number.NaN;
  }
  return numerator / denominator;
};

const parseThemeNumericValue = (
  tokenCategory: string,
  value: string | number,
) => {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value !== "string") return Number.NaN;
  if (tokenCategory === "aspectRatios") return parseAspectRatioValue(value);
  if (value.includes("var(")) return Number.NaN;
  return parseNumericTokenValue(value);
};

const toColorGroupId = (palette: string) =>
  `color-group-${palette.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export type DesignSystemSection =
  | "colors"
  | "layout"
  | "typography"
  | "motion"
  | "effects";

type DesignSystemOverviewProps = {
  section: DesignSystemSection;
};

export const DesignSystemOverview = (props: DesignSystemOverviewProps) => {
  const [colorCssVars, setColorCssVars] = createSignal<string[]>([]);
  const [sizeCssVars, setSizeCssVars] = createSignal<string[]>([]);
  const [sizeMetrics, setSizeMetrics] = createSignal<SizeMetric[]>([]);
  const [sizeDisplayUnit, setSizeDisplayUnit] =
    createSignal<SizeDisplayUnit>("rem");
  const [typographyCssVars, setTypographyCssVars] =
    createSignal<TypographyCssVars>({
      fonts: [],
      fontSizes: [],
      fontWeights: [],
      lineHeights: [],
      letterSpacings: [],
    });
  const [themeCategories, setThemeCategories] = createSignal<ThemeCategory[]>(
    [],
  );

  const sizeTokens = createMemo(() => {
    const generatedSizes = sizeCssVars().map((cssVar) =>
      parseCssVarToken(cssVar, "--sizes-"),
    );

    const candidates = [
      ...generatedSizes,
      ...collectTokenReferences(SIZE_REFERENCE_PATTERN),
    ];

    return toSortedList(candidates);
  });

  onMount(() => {
    const styles = getComputedStyle(document.documentElement);
    const allVars: string[] = [];

    for (let index = 0; index < styles.length; index += 1) {
      const propName = styles.item(index);
      if (propName.startsWith("--")) allVars.push(propName);
    }

    const nextColorVars = toSortedList(
      allVars.filter((propName) => propName.startsWith("--colors-")),
    );
    const nextSizeVars = toSortedList(
      allVars.filter((propName) => propName.startsWith("--sizes-")),
    );

    setColorCssVars(nextColorVars);
    setSizeCssVars(nextSizeVars);
    setTypographyCssVars({
      fonts: toSortedList(
        allVars.filter((propName) => propName.startsWith("--fonts-")),
      ),
      fontSizes: toSortedList(
        allVars.filter((propName) => propName.startsWith("--font-sizes-")),
      ),
      fontWeights: toSortedList(
        allVars.filter((propName) => propName.startsWith("--font-weights-")),
      ),
      lineHeights: toSortedList(
        allVars.filter((propName) => propName.startsWith("--line-heights-")),
      ),
      letterSpacings: toSortedList(
        allVars.filter((propName) => propName.startsWith("--letter-spacings-")),
      ),
    });
    const nextThemeCategories = THEME_CATEGORY_CONFIG.map((config) => {
      const tokenNames = toSortedList(
        allVars
          .filter((propName) => propName.startsWith(config.prefix))
          .map((propName) => parseCssVarToken(propName, config.prefix)),
      );

      const tokens = tokenNames
        .map((tokenName) => {
          const value = getTokenValue(`${config.tokenCategory}.${tokenName}`);
          const numericValue = parseThemeNumericValue(
            config.tokenCategory,
            value,
          );
          const isAlias = typeof value === "string" && value.includes("var(");
          return {
            token: tokenName,
            value,
            numericValue: Number.isFinite(numericValue) ? numericValue : null,
            isAlias,
          };
        })
        .sort((a, b) => {
          const aValue = a.numericValue;
          const bValue = b.numericValue;
          if (aValue !== null && bValue !== null) return aValue - bValue;
          if (aValue !== null) return -1;
          if (bValue !== null) return 1;
          if (a.isAlias && !b.isAlias) return 1;
          if (!a.isAlias && b.isAlias) return -1;
          return a.token.localeCompare(b.token, undefined, { numeric: true });
        });

      return {
        key: config.key,
        label: config.label,
        group: config.group,
        tokenCategory: config.tokenCategory,
        tokens,
      };
    }).filter((category) => category.tokens.length > 0);

    setThemeCategories(nextThemeCategories);

    const themeLogEntries = nextThemeCategories.map((category) => ({
      key: category.key,
      label: category.label,
      tokenCategory: category.tokenCategory,
      count: category.tokens.length,
      tokens: category.tokens.map((tokenName) => {
        const value = tokenName.value;
        return {
          token: tokenName.token,
          fullToken: `${category.tokenCategory}.${tokenName.token}`,
          value,
          numericValue: tokenName.numericValue,
          isAlias: tokenName.isAlias,
        };
      }),
    }));

    console.info("[DesignSystemOverview] theme token catalog", {
      categoryCount: themeLogEntries.length,
      tokenCount: themeLogEntries.reduce((sum, entry) => sum + entry.count, 0),
      categories: themeLogEntries.map((entry) => ({
        key: entry.key,
        label: entry.label,
        count: entry.count,
      })),
    });
    console.info(
      "[DesignSystemOverview] theme token catalog (detailed)",
      themeLogEntries,
    );

    const resolvedSizeTokens = sizeTokens();

    queueMicrotask(() => {
      const measureHost = document.createElement("div");
      measureHost.style.position = "absolute";
      measureHost.style.visibility = "hidden";
      measureHost.style.pointerEvents = "none";
      measureHost.style.inset = "-9999px";
      measureHost.style.width = "1024px";
      measureHost.style.height = "0";
      measureHost.style.overflow = "hidden";
      document.body.appendChild(measureHost);

      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );

      const nextMetrics = resolvedSizeTokens
        .map((sizeToken) => {
          const rawValue = getTokenValue(`sizes.${sizeToken}`);
          const textual = isTextualSizeValue(rawValue);
          const probe = document.createElement("div");
          probe.style.width = `var(--sizes-${sizeToken.replaceAll(".", "\\.")})`;
          measureHost.appendChild(probe);
          const computedWidth = getComputedStyle(probe).width;
          probe.remove();

          const parsedPx = Number.parseFloat(computedWidth);
          const pxValue =
            textual || !Number.isFinite(parsedPx) ? null : parsedPx;
          const parsedRem = Number.parseFloat(rawValue);
          const remValue = rawValue.endsWith("rem")
            ? Number.isFinite(parsedRem)
              ? parsedRem
              : null
            : pxValue !== null &&
                Number.isFinite(rootFontSize) &&
                rootFontSize > 0
              ? pxValue / rootFontSize
              : null;

          return {
            token: sizeToken,
            rawValue,
            pxValue,
            remValue,
            isTextual: textual,
          };
        })
        .sort((a, b) => {
          if (a.isTextual && !b.isTextual) return -1;
          if (!a.isTextual && b.isTextual) return 1;
          if (a.isTextual && b.isTextual) {
            return a.token.localeCompare(b.token, undefined, { numeric: true });
          }
          if (a.pxValue !== null && b.pxValue !== null) {
            return a.pxValue - b.pxValue;
          }
          if (a.pxValue !== null) return -1;
          if (b.pxValue !== null) return 1;
          return a.token.localeCompare(b.token, undefined, { numeric: true });
        });

      setSizeMetrics(nextMetrics);
      measureHost.remove();
    });
  });

  const recipeList = createMemo(() =>
    Object.values(recipes).map((recipe) => recipe as RecipeLike),
  );

  const recipeColorPalettes = createMemo(() =>
    toSortedList(
      recipeList()
        .flatMap((recipe) => Object.entries(recipe.variants ?? {}))
        .filter(([axis]) => axis === "colorPalette")
        .flatMap(([, options]) => Object.keys(options)),
    ),
  );

  const parsedColors = createMemo(() => colorCssVars().map(parseColorCssVar));

  const paletteGroups = createMemo(() => {
    const grouped = new Map<string, ParsedColorToken[]>();

    for (const entry of parsedColors()) {
      const list = grouped.get(entry.palette) ?? [];
      list.push(entry);
      grouped.set(entry.palette, list);
    }

    const recipePalettes = new Set(recipeColorPalettes());
    const semanticOrder = ["bg", "fg", "border", "error", "black", "white"];

    return Array.from(grouped.entries())
      .map(([palette, items]) => {
        const shades = items
          .filter((item) => isNumericShade(item.key))
          .sort((a, b) =>
            a.key.localeCompare(b.key, undefined, { numeric: true }),
          );
        const alphas = items
          .filter((item) => isAlphaShade(item.key))
          .sort((a, b) =>
            a.key.localeCompare(b.key, undefined, { numeric: true }),
          );
        const roles = items
          .filter(
            (item) => !isNumericShade(item.key) && !isAlphaShade(item.key),
          )
          .sort((a, b) =>
            a.key.localeCompare(b.key, undefined, { numeric: true }),
          );

        return { palette, shades, alphas, roles };
      })
      .sort((a, b) => {
        const aRecipe = recipePalettes.has(a.palette);
        const bRecipe = recipePalettes.has(b.palette);
        if (aRecipe && !bRecipe) return -1;
        if (!aRecipe && bRecipe) return 1;

        const aSemantic = semanticOrder.indexOf(a.palette);
        const bSemantic = semanticOrder.indexOf(b.palette);
        if (aSemantic !== -1 && bSemantic !== -1) return aSemantic - bSemantic;
        if (aSemantic !== -1) return -1;
        if (bSemantic !== -1) return 1;

        return a.palette.localeCompare(b.palette);
      });
  });

  const textualSizes = createMemo(() =>
    sizeMetrics().filter((metric) => metric.isTextual),
  );
  const measuredSizes = createMemo(() =>
    sizeMetrics().filter((metric) => !metric.isTextual),
  );
  const maxMeasuredPx = createMemo(() =>
    measuredSizes().reduce(
      (max, metric) =>
        metric.pxValue !== null ? Math.max(max, metric.pxValue) : max,
      0,
    ),
  );

  const fontFamilyTokens = createMemo(() =>
    typographyCssVars().fonts.map((cssVar) =>
      parseCssVarToken(cssVar, "--fonts-"),
    ),
  );
  const fontSizeTokens = createMemo(() =>
    typographyCssVars().fontSizes.map((cssVar) =>
      parseCssVarToken(cssVar, "--font-sizes-"),
    ),
  );
  const fontWeightTokens = createMemo(() =>
    typographyCssVars().fontWeights.map((cssVar) =>
      parseCssVarToken(cssVar, "--font-weights-"),
    ),
  );
  const lineHeightTokens = createMemo(() =>
    typographyCssVars().lineHeights.map((cssVar) =>
      parseCssVarToken(cssVar, "--line-heights-"),
    ),
  );
  const letterSpacingTokens = createMemo(() =>
    typographyCssVars().letterSpacings.map((cssVar) =>
      parseCssVarToken(cssVar, "--letter-spacings-"),
    ),
  );

  const sortedFontWeightTokens = createMemo(() =>
    [...fontWeightTokens()].sort((a, b) => {
      const aValue = parseNumericTokenValue(getTokenValue(`fontWeights.${a}`));
      const bValue = parseNumericTokenValue(getTokenValue(`fontWeights.${b}`));
      if (Number.isFinite(aValue) && Number.isFinite(bValue))
        return aValue - bValue;
      if (Number.isFinite(aValue)) return -1;
      if (Number.isFinite(bValue)) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    }),
  );

  const sortedFontSizeTokens = createMemo(() =>
    [...fontSizeTokens()].sort((a, b) => {
      const aValue = parseNumericTokenValue(getTokenValue(`fontSizes.${a}`));
      const bValue = parseNumericTokenValue(getTokenValue(`fontSizes.${b}`));
      if (Number.isFinite(aValue) && Number.isFinite(bValue))
        return aValue - bValue;
      if (Number.isFinite(aValue)) return -1;
      if (Number.isFinite(bValue)) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    }),
  );

  const sortedLineHeightTokens = createMemo(() =>
    [...lineHeightTokens()].sort((a, b) => {
      const aValue = parseNumericTokenValue(getTokenValue(`lineHeights.${a}`));
      const bValue = parseNumericTokenValue(getTokenValue(`lineHeights.${b}`));
      if (Number.isFinite(aValue) && Number.isFinite(bValue))
        return aValue - bValue;
      if (Number.isFinite(aValue)) return -1;
      if (Number.isFinite(bValue)) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    }),
  );

  const sortedLetterSpacingTokens = createMemo(() =>
    [...letterSpacingTokens()].sort((a, b) => {
      const aValue = parseNumericTokenValue(
        getTokenValue(`letterSpacings.${a}`),
      );
      const bValue = parseNumericTokenValue(
        getTokenValue(`letterSpacings.${b}`),
      );
      if (Number.isFinite(aValue) && Number.isFinite(bValue))
        return aValue - bValue;
      if (Number.isFinite(aValue)) return -1;
      if (Number.isFinite(bValue)) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    }),
  );

  const typographyTokenCount = createMemo(
    () =>
      fontFamilyTokens().length +
      fontSizeTokens().length +
      fontWeightTokens().length +
      lineHeightTokens().length +
      letterSpacingTokens().length,
  );
  const layoutThemeCategories = createMemo(() =>
    themeCategories().filter((category) => category.group === "layout"),
  );
  const motionThemeCategories = createMemo(() =>
    themeCategories().filter((category) => category.group === "motion"),
  );
  const effectThemeCategories = createMemo(() =>
    themeCategories().filter((category) => category.group === "effects"),
  );
  const layoutTokenCount = createMemo(
    () =>
      sizeMetrics().length +
      layoutThemeCategories().reduce(
        (total, category) => total + category.tokens.length,
        0,
      ),
  );
  const motionTokenCount = createMemo(() =>
    motionThemeCategories().reduce(
      (total, category) => total + category.tokens.length,
      0,
    ),
  );
  const effectTokenCount = createMemo(() =>
    effectThemeCategories().reduce(
      (total, category) => total + category.tokens.length,
      0,
    ),
  );

  return (
    <VStack alignItems="stretch" gap="6">
      <VStack alignItems="stretch" gap="1">
        <Box textStyle={{ base: "xl", md: "2xl" }} fontWeight="semibold">
          {props.section === "colors"
            ? "Design System Colors"
            : props.section === "layout"
              ? "Design System Layout"
              : props.section === "typography"
                ? "Design System Typography"
                : props.section === "motion"
                  ? "Design System Motion"
                  : "Design System Effects"}
        </Box>
        <Box textStyle="sm" color="fg.muted">
          {props.section === "colors"
            ? "Palette and semantic color tokens auto-derived from runtime CSS vars."
            : props.section === "layout"
              ? "Size and layout tokens grouped together and sorted by resolved value."
              : props.section === "typography"
                ? "Typography tokens auto-derived from runtime CSS vars."
                : props.section === "motion"
                  ? "Motion and animation tokens auto-derived from runtime CSS vars."
                  : "Visual effect tokens auto-derived from runtime CSS vars."}
        </Box>
      </VStack>

      <Show when={props.section === "colors"}>
        <VStack alignItems="stretch" gap="3">
          <HStack justifyContent="space-between" alignItems="center">
            <Box textStyle="lg" fontWeight="semibold">
              Colors
            </Box>
            <Box textStyle="xs" color="fg.muted">
              {parsedColors().length} tokens
            </Box>
          </HStack>

          <HStack alignItems="flex-start" gap="3">
            <VStack
              alignItems="stretch"
              gap="1"
              position="sticky"
              top="3"
              alignSelf="start"
              maxH="calc(100dvh - 2rem)"
              overflowY="auto"
              borderWidth="1px"
              borderColor="border"
              borderRadius="l1"
              p="2"
              minW="160px"
              bg="bg.subtle"
            >
              <Box textStyle="2xs" color="fg.muted" fontWeight="semibold">
                GROUPS
              </Box>
              <For each={paletteGroups()}>
                {(group) => (
                  <button
                    type="button"
                    class={css({
                      textAlign: "left",
                      textStyle: "2xs",
                      color: "fg.default",
                      px: "1.5",
                      py: "1",
                      borderRadius: "l1",
                      _hover: { bg: "bg.default" },
                    })}
                    onClick={() =>
                      document
                        .getElementById(toColorGroupId(group.palette))
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  >
                    {group.palette}
                  </button>
                )}
              </For>
            </VStack>

            <VStack alignItems="stretch" gap="4" flex="1" minW="0">
              <For each={paletteGroups()}>
                {(group) => (
                  <VStack
                    id={toColorGroupId(group.palette)}
                    alignItems="stretch"
                    gap="2"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="l2"
                    p="3"
                  >
                    <HStack
                      justifyContent="space-between"
                      alignItems="baseline"
                    >
                      <Box
                        textStyle="md"
                        fontWeight="semibold"
                        textTransform="capitalize"
                      >
                        {group.palette}
                      </Box>
                      <HStack gap="3" flexWrap="wrap" justifyContent="flex-end">
                        <Show
                          when={recipeColorPalettes().includes(group.palette)}
                        >
                          <Box textStyle="2xs" color="fg.muted">
                            recipe: colorPalette=&quot;{group.palette}&quot;
                          </Box>
                        </Show>
                        <Box textStyle="2xs" color="fg.muted">
                          token: colors.{group.palette}.*
                        </Box>
                      </HStack>
                    </HStack>

                    <Show when={group.shades.length > 0}>
                      <VStack alignItems="stretch" gap="1">
                        <Box textStyle="2xs" color="fg.muted">
                          Scale
                        </Box>
                        <Box
                          class={css({
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(78px, 1fr))",
                            gap: "1.5",
                          })}
                        >
                          <For each={group.shades}>
                            {(item) => (
                              <VStack alignItems="stretch" gap="1">
                                <Box
                                  h="12"
                                  borderRadius="l1"
                                  borderWidth="1px"
                                  borderColor="border"
                                  style={{
                                    "background-color": `var(${item.cssVar})`,
                                  }}
                                />
                                <Box
                                  textStyle="2xs"
                                  color="fg.muted"
                                  textAlign="center"
                                >
                                  {item.key}
                                </Box>
                              </VStack>
                            )}
                          </For>
                        </Box>
                      </VStack>
                    </Show>

                    <Show when={group.alphas.length > 0}>
                      <VStack alignItems="stretch" gap="1">
                        <Box textStyle="2xs" color="fg.muted">
                          Alpha
                        </Box>
                        <Box
                          class={css({
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(78px, 1fr))",
                            gap: "1.5",
                          })}
                        >
                          <For each={group.alphas}>
                            {(item) => (
                              <VStack alignItems="stretch" gap="1">
                                <Box
                                  h="10"
                                  borderRadius="l1"
                                  borderWidth="1px"
                                  borderColor="border"
                                  style={{
                                    "background-color": `var(${item.cssVar})`,
                                  }}
                                />
                                <Box
                                  textStyle="2xs"
                                  color="fg.muted"
                                  textAlign="center"
                                >
                                  {item.key}
                                </Box>
                              </VStack>
                            )}
                          </For>
                        </Box>
                      </VStack>
                    </Show>

                    <Show when={group.roles.length > 0}>
                      <VStack alignItems="stretch" gap="1">
                        <Box textStyle="2xs" color="fg.muted">
                          Semantic / State
                        </Box>
                        <Box
                          class={css({
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(170px, 1fr))",
                            gap: "1.5",
                          })}
                        >
                          <For each={group.roles}>
                            {(item) => (
                              <VStack
                                alignItems="stretch"
                                gap="1"
                                p="2"
                                borderWidth="1px"
                                borderColor="border"
                                borderRadius="l1"
                              >
                                <Box
                                  h="8"
                                  borderRadius="l1"
                                  borderWidth="1px"
                                  borderColor="border"
                                  style={{
                                    "background-color": `var(${item.cssVar})`,
                                  }}
                                />
                                <Box textStyle="2xs" color="fg.muted">
                                  {item.tokenPath}
                                </Box>
                              </VStack>
                            )}
                          </For>
                        </Box>
                      </VStack>
                    </Show>
                  </VStack>
                )}
              </For>
            </VStack>
          </HStack>
        </VStack>
      </Show>

      <Show when={props.section === "layout"}>
        <VStack alignItems="stretch" gap="3">
          <HStack justifyContent="space-between" alignItems="center">
            <Box textStyle="lg" fontWeight="semibold">
              Layout
            </Box>
            <HStack gap="2" alignItems="center">
              <Box textStyle="xs" color="fg.muted">
                {layoutTokenCount()} tokens
              </Box>
              <HStack gap="1">
                <Button
                  size="xs"
                  variant={sizeDisplayUnit() === "rem" ? "solid" : "outline"}
                  onClick={() => setSizeDisplayUnit("rem")}
                >
                  Rem
                </Button>
                <Button
                  size="xs"
                  variant={sizeDisplayUnit() === "px" ? "solid" : "outline"}
                  onClick={() => setSizeDisplayUnit("px")}
                >
                  Px
                </Button>
              </HStack>
            </HStack>
          </HStack>

          <VStack alignItems="stretch" gap="2">
            <Show when={textualSizes().length > 0}>
              <VStack alignItems="stretch" gap="1.5">
                <Box textStyle="2xs" color="fg.muted">
                  Keyword / Content Sizes
                </Box>
                <Box
                  class={css({
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "1.5",
                  })}
                >
                  <For each={textualSizes()}>
                    {(metric) => (
                      <VStack
                        alignItems="stretch"
                        gap="0.75"
                        p="2"
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="l1"
                        bg="bg.subtle"
                      >
                        <Box
                          textStyle="2xs"
                          color="fg.default"
                          fontWeight="medium"
                          fontFamily="mono"
                        >
                          {metric.token}
                        </Box>
                        <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                          {metric.rawValue}
                        </Box>
                      </VStack>
                    )}
                  </For>
                </Box>
              </VStack>
            </Show>

            <Show when={measuredSizes().length > 0}>
              <VStack alignItems="stretch" gap="1">
                <HStack justifyContent="space-between" alignItems="center">
                  <Box textStyle="2xs" color="fg.muted">
                    Measured Sizes
                  </Box>
                  <Box textStyle="2xs" color="fg.muted">
                    Sorted by resolved px, display in {sizeDisplayUnit()}
                  </Box>
                </HStack>
              </VStack>
            </Show>

            <Box
              class={css({
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.5",
              })}
            >
              <For each={measuredSizes()}>
                {(metric, index) => (
                  <HStack
                    alignItems="center"
                    gap="2"
                    p="2"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="l1"
                  >
                    <Box
                      textStyle="2xs"
                      color="fg.default"
                      fontWeight="medium"
                      fontFamily="mono"
                      minW="0"
                      flex="1"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {metric.token}
                    </Box>
                    <Box
                      textStyle="2xs"
                      color="fg.muted"
                      whiteSpace="nowrap"
                      fontFamily="mono"
                    >
                      <Show
                        when={sizeDisplayUnit() === "rem"}
                        fallback={
                          <Show
                            when={metric.pxValue !== null}
                            fallback={metric.rawValue}
                          >
                            {metric.pxValue?.toFixed(2).replace(/\.?0+$/, "")}px
                          </Show>
                        }
                      >
                        <Show
                          when={metric.remValue !== null}
                          fallback={metric.rawValue}
                        >
                          {metric.remValue?.toFixed(3).replace(/\.?0+$/, "")}rem
                        </Show>
                      </Show>
                    </Box>
                    <Box
                      h="2"
                      minW="70px"
                      flex="0 0 70px"
                      borderRadius="l1"
                      borderWidth="1px"
                      borderColor="border"
                      bg="bg.subtle"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        h="full"
                        bg={
                          recipeColorPalettes()[
                            index() % recipeColorPalettes().length
                          ] ?? "blue.9"
                        }
                        style={{
                          width:
                            metric.pxValue !== null && maxMeasuredPx() > 0
                              ? `${Math.max(
                                  2,
                                  (metric.pxValue / maxMeasuredPx()) * 100,
                                )}%`
                              : "4px",
                        }}
                      />
                    </Box>
                  </HStack>
                )}
              </For>
            </Box>

            <VStack
              alignItems="stretch"
              gap="2"
              p="3"
              borderWidth="1px"
              borderColor="border"
              borderRadius="l2"
            >
              <Box textStyle="sm" fontWeight="semibold">
                Layout Scale Tokens
              </Box>
              <For each={layoutThemeCategories()}>
                {(category) => (
                  <VStack alignItems="stretch" gap="1">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Box
                        textStyle="xs"
                        color="fg.muted"
                        fontWeight="semibold"
                      >
                        {category.label}
                      </Box>
                      <Box textStyle="2xs" color="fg.muted">
                        {category.tokens.length} tokens
                      </Box>
                    </HStack>
                    <Box
                      class={css({
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(210px, 1fr))",
                        gap: "1",
                      })}
                    >
                      <For each={category.tokens}>
                        {(item) => (
                          <VStack
                            alignItems="stretch"
                            gap="1"
                            p="2"
                            borderWidth="1px"
                            borderColor="border"
                            borderRadius="l1"
                            bg={item.isAlias ? "bg.subtle" : "transparent"}
                          >
                            <HStack
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box
                                textStyle="2xs"
                                color="fg.default"
                                fontFamily="mono"
                              >
                                {item.token}
                              </Box>
                              <Show when={item.isAlias}>
                                <Box textStyle="2xs" color="fg.muted">
                                  alias
                                </Box>
                              </Show>
                            </HStack>
                            <Box
                              textStyle="2xs"
                              color="fg.muted"
                              fontFamily="mono"
                            >
                              {String(item.value)}
                            </Box>
                            <Show
                              when={
                                category.key === "spacing" ||
                                category.key === "breakpoints"
                              }
                            >
                              <Box
                                h="2"
                                borderRadius="l1"
                                borderWidth="1px"
                                borderColor="border"
                                bg="bg.subtle"
                                overflow="hidden"
                              >
                                <Box
                                  h="full"
                                  bg="blue.9"
                                  style={{
                                    width:
                                      item.numericValue !== null
                                        ? `${Math.min(
                                            100,
                                            Math.max(2, item.numericValue * 4),
                                          )}%`
                                        : "4px",
                                  }}
                                />
                              </Box>
                            </Show>
                            <Show when={category.key === "radii"}>
                              <Box
                                h="7"
                                borderWidth="1px"
                                borderColor="border"
                                bg="bg.subtle"
                                style={{
                                  "border-radius":
                                    typeof item.value === "string"
                                      ? item.value
                                      : `${item.value}px`,
                                }}
                              />
                            </Show>
                            <Show when={category.key === "aspectRatios"}>
                              <Box
                                w="full"
                                h="0"
                                borderWidth="1px"
                                borderColor="border"
                                bg="bg.subtle"
                                style={{
                                  "padding-top":
                                    item.numericValue !== null
                                      ? `${100 / item.numericValue}%`
                                      : "56.25%",
                                }}
                              />
                            </Show>
                          </VStack>
                        )}
                      </For>
                    </Box>
                  </VStack>
                )}
              </For>
            </VStack>
          </VStack>
        </VStack>
      </Show>

      <Show when={props.section === "typography"}>
        <VStack alignItems="stretch" gap="3">
          <HStack justifyContent="space-between" alignItems="center">
            <Box textStyle="lg" fontWeight="semibold">
              Typography
            </Box>
            <Box textStyle="xs" color="fg.muted">
              {typographyTokenCount()} tokens
            </Box>
          </HStack>

          <VStack alignItems="stretch" gap="2.5">
            <Box textStyle="xs" color="fg.muted" fontWeight="semibold">
              Font Families
            </Box>
            <Box
              class={css({
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5",
              })}
            >
              <For each={fontFamilyTokens()}>
                {(tokenName) => (
                  <VStack
                    alignItems="stretch"
                    gap="1"
                    p="2"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="l1"
                  >
                    <Box textStyle="2xs" color="fg.default" fontFamily="mono">
                      {tokenName}
                    </Box>
                    <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                      {getTokenValue(`fonts.${tokenName}`)}
                    </Box>
                    <Box
                      style={{
                        "font-family": getTokenValue(`fonts.${tokenName}`),
                      }}
                    >
                      The quick brown fox jumps over 123.
                    </Box>
                  </VStack>
                )}
              </For>
            </Box>
          </VStack>

          <VStack alignItems="stretch" gap="2.5">
            <Box textStyle="xs" color="fg.muted" fontWeight="semibold">
              Font Sizes
            </Box>
            <VStack alignItems="stretch" gap="1">
              <For each={sortedFontSizeTokens()}>
                {(tokenName) => (
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    p="2"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="l1"
                  >
                    <HStack gap="2" minW="0" flex="1" alignItems="baseline">
                      <Box textStyle="2xs" color="fg.default" fontFamily="mono">
                        {tokenName}
                      </Box>
                      <Box
                        style={{
                          "font-size": getTokenValue(`fontSizes.${tokenName}`),
                        }}
                      >
                        Sample Aa
                      </Box>
                    </HStack>
                    <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                      {getTokenValue(`fontSizes.${tokenName}`)}
                    </Box>
                  </HStack>
                )}
              </For>
            </VStack>
          </VStack>

          <HStack alignItems="flex-start" gap="2.5">
            <VStack alignItems="stretch" gap="1.5" flex="1" minW="0">
              <Box textStyle="xs" color="fg.muted" fontWeight="semibold">
                Font Weights
              </Box>
              <For each={sortedFontWeightTokens()}>
                {(tokenName) => (
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    p="2"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="l1"
                  >
                    <Box textStyle="2xs" color="fg.default" fontFamily="mono">
                      {tokenName}
                    </Box>
                    <Box
                      style={{
                        "font-weight": getTokenValue(
                          `fontWeights.${tokenName}`,
                        ),
                      }}
                    >
                      Weight
                    </Box>
                    <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                      {getTokenValue(`fontWeights.${tokenName}`)}
                    </Box>
                  </HStack>
                )}
              </For>
            </VStack>

            <VStack alignItems="stretch" gap="1.5" flex="1" minW="0">
              <Box textStyle="xs" color="fg.muted" fontWeight="semibold">
                Line Heights
              </Box>
              <For each={sortedLineHeightTokens()}>
                {(tokenName) => (
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    p="2"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="l1"
                  >
                    <Box textStyle="2xs" color="fg.default" fontFamily="mono">
                      {tokenName}
                    </Box>
                    <Box
                      textStyle="xs"
                      style={{
                        "line-height": getTokenValue(
                          `lineHeights.${tokenName}`,
                        ),
                      }}
                    >
                      A line
                    </Box>
                    <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                      {getTokenValue(`lineHeights.${tokenName}`)}
                    </Box>
                  </HStack>
                )}
              </For>
            </VStack>
          </HStack>

          <VStack alignItems="stretch" gap="1.5">
            <Box textStyle="xs" color="fg.muted" fontWeight="semibold">
              Letter Spacing
            </Box>
            <For each={sortedLetterSpacingTokens()}>
              {(tokenName) => (
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  p="2"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l1"
                >
                  <Box textStyle="2xs" color="fg.default" fontFamily="mono">
                    {tokenName}
                  </Box>
                  <Box
                    textStyle="xs"
                    style={{
                      "letter-spacing": getTokenValue(
                        `letterSpacings.${tokenName}`,
                      ),
                    }}
                  >
                    Tracking
                  </Box>
                  <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                    {getTokenValue(`letterSpacings.${tokenName}`)}
                  </Box>
                </HStack>
              )}
            </For>
          </VStack>
        </VStack>
      </Show>

      <Show when={props.section === "motion"}>
        <VStack alignItems="stretch" gap="3">
          <HStack justifyContent="space-between" alignItems="center">
            <Box textStyle="lg" fontWeight="semibold">
              Motion
            </Box>
            <Box textStyle="xs" color="fg.muted">
              {motionTokenCount()} tokens
            </Box>
          </HStack>

          <For each={motionThemeCategories()}>
            {(category) => (
              <VStack
                alignItems="stretch"
                gap="2"
                p="3"
                borderWidth="1px"
                borderColor="border"
                borderRadius="l2"
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <Box textStyle="sm" fontWeight="semibold">
                    {category.label}
                  </Box>
                  <Box textStyle="2xs" color="fg.muted">
                    {category.tokens.length} tokens
                  </Box>
                </HStack>
                <Box
                  class={css({
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "1",
                  })}
                >
                  <For each={category.tokens}>
                    {(item) => (
                      <VStack
                        alignItems="stretch"
                        gap="1"
                        p="2"
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="l1"
                      >
                        <Box
                          textStyle="2xs"
                          color="fg.default"
                          fontFamily="mono"
                        >
                          {item.token}
                        </Box>
                        <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                          {String(item.value)}
                        </Box>
                        <Show when={category.key === "durations"}>
                          <Box
                            h="2"
                            borderRadius="l1"
                            borderWidth="1px"
                            borderColor="border"
                            bg="bg.subtle"
                            overflow="hidden"
                          >
                            <Box
                              h="full"
                              bg="green.9"
                              style={{
                                width:
                                  item.numericValue !== null
                                    ? `${Math.min(
                                        100,
                                        Math.max(4, item.numericValue / 4),
                                      )}%`
                                    : "8px",
                              }}
                            />
                          </Box>
                        </Show>
                        <Show when={category.key === "animations"}>
                          <Box pb="28">
                            <Box
                              textStyle="2xs"
                              color="fg.default"
                              px="2"
                              py="1"
                              borderWidth="1px"
                              borderColor="border"
                              borderRadius="l1"
                              style={{
                                animation:
                                  typeof item.value === "string"
                                    ? item.value
                                    : undefined,
                              }}
                            >
                              animate
                            </Box>
                          </Box>
                        </Show>
                      </VStack>
                    )}
                  </For>
                </Box>
              </VStack>
            )}
          </For>
        </VStack>
      </Show>

      <Show when={props.section === "effects"}>
        <VStack alignItems="stretch" gap="3">
          <HStack justifyContent="space-between" alignItems="center">
            <Box textStyle="lg" fontWeight="semibold">
              Effects
            </Box>
            <Box textStyle="xs" color="fg.muted">
              {effectTokenCount()} tokens
            </Box>
          </HStack>

          <For each={effectThemeCategories()}>
            {(category) => (
              <VStack
                alignItems="stretch"
                gap="2"
                p="3"
                borderWidth="1px"
                borderColor="border"
                borderRadius="l2"
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <Box textStyle="sm" fontWeight="semibold">
                    {category.label}
                  </Box>
                  <Box textStyle="2xs" color="fg.muted">
                    {category.tokens.length} tokens
                  </Box>
                </HStack>
                <Box
                  class={css({
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "1",
                  })}
                >
                  <For each={category.tokens}>
                    {(item) => (
                      <VStack
                        alignItems="stretch"
                        gap="1"
                        p="2"
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="l1"
                        bg={item.isAlias ? "bg.subtle" : "transparent"}
                      >
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box
                            textStyle="2xs"
                            color="fg.default"
                            fontFamily="mono"
                          >
                            {item.token}
                          </Box>
                          <Show when={item.isAlias}>
                            <Box textStyle="2xs" color="fg.muted">
                              alias
                            </Box>
                          </Show>
                        </HStack>
                        <Box textStyle="2xs" color="fg.muted" fontFamily="mono">
                          {String(item.value)}
                        </Box>
                        <Show when={category.key === "shadows"}>
                          <Box
                            h="8"
                            borderRadius="l1"
                            borderWidth="1px"
                            borderColor="border"
                            bg="bg.subtle"
                            style={{
                              "box-shadow":
                                typeof item.value === "string"
                                  ? item.value
                                  : undefined,
                            }}
                          />
                        </Show>
                        <Show when={category.key === "blurs"}>
                          <Box
                            h="8"
                            borderRadius="l1"
                            borderWidth="1px"
                            borderColor="border"
                            bg="blue.subtle.bg"
                            style={{
                              filter:
                                typeof item.value === "string"
                                  ? `blur(${item.value})`
                                  : item.numericValue !== null
                                    ? `blur(${item.numericValue}px)`
                                    : undefined,
                            }}
                          />
                        </Show>
                      </VStack>
                    )}
                  </For>
                </Box>
              </VStack>
            )}
          </For>
        </VStack>
      </Show>
    </VStack>
  );
};
