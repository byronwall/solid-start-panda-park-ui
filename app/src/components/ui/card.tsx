import { ark } from "@ark-ui/solid/factory";
import type { ComponentProps } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { card } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(card);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(ark.div, "root");
export const Header = withContext(ark.div, "header");
export const Body = withContext(ark.div, "body");
export const Footer = withContext(ark.h3, "footer");
export const Title = withContext(ark.h3, "title");
export const Description = withContext(ark.div, "description");

export interface CardDemoProps {
  variantProps?: Record<string, string>;
}

export const CardDemo = (props: CardDemoProps) => {
  return (
    <Root {...(props.variantProps ?? {})} width="full" maxW="96">
      <Header>
        <Title>Card title</Title>
        <Description>Card description</Description>
      </Header>
      <Body>Card content body</Body>
    </Root>
  );
};
