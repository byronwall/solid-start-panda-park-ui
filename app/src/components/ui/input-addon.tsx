import { ark } from "@ark-ui/solid/factory";
import type { ComponentProps } from "solid-js";
import { styled } from "styled-system/jsx";
import { inputAddon } from "styled-system/recipes";
import { Input as DemoInput } from "./input";
import { HStack as DemoHStack } from "styled-system/jsx";

export type InputAddonProps = ComponentProps<typeof InputAddon>;
export const InputAddon = styled(ark.div, inputAddon);

export interface InputAddonDemoProps {
  variantProps?: Record<string, string>;
}

export const InputAddonDemo = (props: InputAddonDemoProps) => {
  return (
    <DemoHStack alignItems="center" gap="0" width="64">
      <InputAddon {...(props.variantProps ?? {})}>https://</InputAddon>
      <DemoInput value="example.com" readOnly />
    </DemoHStack>
  );
};
