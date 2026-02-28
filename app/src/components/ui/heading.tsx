import type { ComponentProps } from "solid-js";
import { styled } from "styled-system/jsx";
import { type HeadingVariantProps, heading } from "styled-system/recipes";
import type { StyledComponent } from "styled-system/types";

type Props = HeadingVariantProps & { as?: any };

export type HeadingProps = ComponentProps<typeof Heading>;
export const Heading = styled("h2", heading) as StyledComponent<"h2", Props>;

export interface HeadingDemoProps {
  variantProps?: Record<string, string>;
}

export const HeadingDemo = (props: HeadingDemoProps) => {
  return <Heading {...(props.variantProps ?? {})}>Heading Preview</Heading>;
};
