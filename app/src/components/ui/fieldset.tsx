import { ark } from "@ark-ui/solid/factory";
import { Fieldset } from "@ark-ui/solid/fieldset";
import type { ComponentProps } from "solid-js";
import { createStyleContext } from "styled-system/jsx";
import { fieldset } from "styled-system/recipes";
import * as DemoCheckbox from "./checkbox";

const { withProvider, withContext } = createStyleContext(fieldset);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(Fieldset.Root, "root");
export const RootProvider = withProvider(Fieldset.RootProvider, "root");
export const Legend = withContext(Fieldset.Legend, "legend");
export const HelperText = withContext(Fieldset.HelperText, "helperText");
export const ErrorText = withContext(Fieldset.ErrorText, "errorText");
export const Content = withContext(ark.div, "content");
export const Control = withContext(ark.div, "control");

export { FieldsetContext as Context } from "@ark-ui/solid/fieldset";

export interface FieldsetDemoProps {
  variantProps?: Record<string, string>;
}

export const FieldsetDemo = (props: FieldsetDemoProps) => {
  return (
    <Root {...(props.variantProps ?? {})} width="72">
      <Legend>Notifications</Legend>
      <Content>
        <DemoCheckbox.Root checked>
          <DemoCheckbox.HiddenInput />
          <DemoCheckbox.Control>
            <DemoCheckbox.Indicator />
          </DemoCheckbox.Control>
          <DemoCheckbox.Label>Email alerts</DemoCheckbox.Label>
        </DemoCheckbox.Root>
      </Content>
    </Root>
  );
};
