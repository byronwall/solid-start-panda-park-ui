import { Carousel, useCarouselContext } from "@ark-ui/solid/carousel";
import { type ComponentProps, For } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { carousel } from "styled-system/recipes";
import { Button as DemoButton } from "./button";
import { Box as DemoBox } from "styled-system/jsx";

const { withProvider, withContext } = createStyleContext(carousel);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(Carousel.Root, "root", {
  forwardProps: ["page"],
  defaultProps: () => ({ spacing: "16px" }),
});
export const RootProvider = withProvider(Carousel.RootProvider, "root");
export const AutoplayTrigger = withContext(
  Carousel.AutoplayTrigger,
  "autoplayTrigger",
);
export const Control = withContext(Carousel.Control, "control");
export const Indicator = withContext(Carousel.Indicator, "indicator");
export const Item = withContext(Carousel.Item, "item");
export const ItemGroup = withContext(Carousel.ItemGroup, "itemGroup");
export const NextTrigger = withContext(Carousel.NextTrigger, "nextTrigger");
export const PrevTrigger = withContext(Carousel.PrevTrigger, "prevTrigger");

const StyledIndicatorGroup = withContext(
  Carousel.IndicatorGroup,
  "indicatorGroup",
);
export const IndicatorGroup = (
  props: ComponentProps<typeof StyledIndicatorGroup>,
) => {
  const carousel = useCarouselContext();

  return (
    <StyledIndicatorGroup {...props}>
      <For each={carousel().pageSnapPoints}>
        {(_, index) => <Indicator index={index()} />}
      </For>
    </StyledIndicatorGroup>
  );
};

export { CarouselContext as Context } from "@ark-ui/solid/carousel";

export interface CarouselDemoProps {
  variantProps?: Record<string, string>;
}

export const CarouselDemo = (props: CarouselDemoProps) => {
  return (
    <Root {...(props.variantProps ?? {})} slideCount={3} width="full" maxW="96">
      <Control>
        <PrevTrigger
          asChild={(props) => <DemoButton {...props()}>Prev</DemoButton>}
        />
        <NextTrigger
          asChild={(props) => <DemoButton {...props()}>Next</DemoButton>}
        />
      </Control>
      <ItemGroup>
        <Item index={0}>
          <DemoBox p="4">Slide One</DemoBox>
        </Item>
        <Item index={1}>
          <DemoBox p="4">Slide Two</DemoBox>
        </Item>
        <Item index={2}>
          <DemoBox p="4">Slide Three</DemoBox>
        </Item>
      </ItemGroup>
    </Root>
  );
};
