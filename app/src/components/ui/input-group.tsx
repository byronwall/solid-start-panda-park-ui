import { ark } from "@ark-ui/solid";
import { type ComponentProps, type JSX, Show, splitProps } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { inputGroup } from "styled-system/recipes";
import { Input as DemoInput } from "./input";
import { Kbd as DemoKbd } from "./kbd";

const { withProvider, withContext } = createStyleContext(inputGroup);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ark.div, "root");
const Element = withContext(ark.div, "element");

export interface InputGroupProps extends RootProps {
  startElement?: JSX.Element | undefined;
  endElement?: JSX.Element | undefined;
}

export const InputGroup = (props: InputGroupProps) => {
  const [local, rest] = splitProps(props, ["startElement", "endElement"]);

  return (
    <Root {...rest}>
      <Show when={local.startElement}>
        <Element insetInlineStart="0" top="0">
          {local.startElement}
        </Element>
      </Show>
      {rest.children}
      <Show when={local.endElement}>
        <Element insetInlineEnd="0" top="0">
          {local.endElement}
        </Element>
      </Show>
    </Root>
  );
};

export interface InputGroupDemoProps {
  variantProps?: Record<string, string>;
}

export const InputGroupDemo = (props: InputGroupDemoProps) => {
  return (
    <InputGroup
      {...(props.variantProps ?? {})}
      endElement={<DemoKbd>⌘K</DemoKbd>}
      width="64"
    >
      <DemoInput placeholder="Search" />
    </InputGroup>
  );
};
