import type { ComponentProps } from "solid-js";
import { styled } from "styled-system/jsx";
import { type TextVariantProps, text } from "styled-system/recipes";
import type { StyledComponent } from "styled-system/types";

type Props = TextVariantProps & { as?: any };

export type TextProps = ComponentProps<typeof Text>;
export const Text = styled("p", text) as StyledComponent<"p", Props>;

export interface TextDemoProps {
  variantProps?: Record<string, string>;
}

export const TextDemo = (props: TextDemoProps) => {
  return (
    <Text {...(props.variantProps ?? {})}>Text recipe preview content.</Text>
  );
};
