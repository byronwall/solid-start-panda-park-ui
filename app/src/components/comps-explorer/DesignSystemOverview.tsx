import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";
import { token } from "styled-system/tokens";
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

const parseColorCssVar = (cssVar: string): ParsedColorToken => {
  const raw = cssVar.replace(/^--colors-/, "");
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

export type DesignSystemSection = "colors" | "sizes";

type DesignSystemOverviewProps = {
  section: DesignSystemSection;
};

export const DesignSystemOverview = (props: DesignSystemOverviewProps) => {
  const [colorCssVars, setColorCssVars] = createSignal<string[]>([]);
  const [sizeCssVars, setSizeCssVars] = createSignal<string[]>([]);
  const [sizeMetrics, setSizeMetrics] = createSignal<SizeMetric[]>([]);

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

    console.info("[DesignSystemOverview] discovered css vars", {
      colorCount: nextColorVars.length,
      sizeCount: nextSizeVars.length,
      colorSample: nextColorVars.slice(0, 15),
      sizeSample: nextSizeVars.slice(0, 15),
    });

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

      const nextMetrics = sizeTokens()
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

        return { palette, shades, alphas, roles, all: items };
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

  const sizeTokens = createMemo(() => {
    const generatedSizes = sizeCssVars().map((cssVar) =>
      cssVar.replace(/^--sizes-/, "").replaceAll("\\.", "."),
    );

    const candidates = [
      ...generatedSizes,
      ...collectTokenReferences(SIZE_REFERENCE_PATTERN),
    ];

    return toSortedList(candidates);
  });

  const textualSizes = createMemo(() =>
    sizeMetrics().filter((metric) => metric.isTextual),
  );
  const measuredSizes = createMemo(() =>
    sizeMetrics().filter((metric) => !metric.isTextual),
  );

  return (
    <VStack alignItems="stretch" gap="6">
      <VStack alignItems="stretch" gap="1">
        <Box textStyle={{ base: "xl", md: "2xl" }} fontWeight="semibold">
          {props.section === "colors"
            ? "Design System Colors"
            : "Design System Sizes"}
        </Box>
        <Box textStyle="sm" color="fg.muted">
          {props.section === "colors"
            ? "Palette and semantic color tokens auto-derived from runtime CSS vars."
            : "Size tokens sorted by resolved value with rem and px reporting."}
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

          <VStack alignItems="stretch" gap="4">
            <For each={paletteGroups()}>
              {(group) => (
                <VStack
                  alignItems="stretch"
                  gap="2"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l2"
                  p="3"
                >
                  <HStack justifyContent="space-between" alignItems="baseline">
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
        </VStack>
      </Show>

      <Show when={props.section === "sizes"}>
        <VStack alignItems="stretch" gap="3">
          <HStack justifyContent="space-between" alignItems="center">
            <Box textStyle="lg" fontWeight="semibold">
              Sizes
            </Box>
            <Box textStyle="xs" color="fg.muted">
              {sizeMetrics().length} tokens
            </Box>
          </HStack>
          <VStack alignItems="stretch" gap="2">
            <Show when={textualSizes().length > 0}>
              <VStack alignItems="stretch" gap="1.5">
                <Box textStyle="2xs" color="fg.muted">
                  Keyword / Content Sizes
                </Box>
                <For each={textualSizes()}>
                  {(metric) => (
                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                      p="2"
                      borderWidth="1px"
                      borderColor="border"
                      borderRadius="l1"
                    >
                      <Box textStyle="2xs" color="fg.muted">
                        sizes.{metric.token}
                      </Box>
                      <Box textStyle="2xs" color="fg.muted">
                        {metric.rawValue}
                      </Box>
                    </HStack>
                  )}
                </For>
              </VStack>
            </Show>

            <Show when={measuredSizes().length > 0}>
              <Box textStyle="2xs" color="fg.muted">
                Measured Sizes
              </Box>
            </Show>

            <For each={measuredSizes()}>
              {(metric, index) => (
                <VStack alignItems="stretch" gap="1">
                  <HStack justifyContent="space-between" alignItems="center">
                    <Box textStyle="2xs" color="fg.muted">
                      sizes.{metric.token}
                    </Box>
                    <Box textStyle="2xs" color="fg.muted">
                      <Show
                        when={
                          metric.remValue !== null && metric.pxValue !== null
                        }
                        fallback={metric.rawValue}
                      >
                        {metric.remValue?.toFixed(3).replace(/\.?0+$/, "")}rem (
                        {metric.pxValue?.toFixed(2).replace(/\.?0+$/, "")}px)
                      </Show>
                    </Box>
                  </HStack>
                  <Box
                    h="6"
                    borderRadius="l1"
                    borderWidth="1px"
                    borderColor="border"
                    bg={
                      recipeColorPalettes()[
                        index() % recipeColorPalettes().length
                      ] ?? "blue.9"
                    }
                    style={{
                      width:
                        metric.pxValue !== null
                          ? `min(${metric.pxValue}px, 100%)`
                          : `min(${metric.rawValue}, 100%)`,
                      "min-width": "4px",
                    }}
                  />
                </VStack>
              )}
            </For>
          </VStack>
        </VStack>
      </Show>
    </VStack>
  );
};
