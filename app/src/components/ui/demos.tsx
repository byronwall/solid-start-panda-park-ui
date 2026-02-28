import { AbsoluteCenterDemo } from "./absolute-center";
import { AccordionDemo } from "./accordion";
import { AlertDemo } from "./alert";
import { AvatarDemo } from "./avatar";
import { BadgeDemo } from "./badge";
import { BreadcrumbDemo } from "./breadcrumb";
import { ButtonDemo } from "./button";
import { CardDemo } from "./card";
import { CarouselDemo } from "./carousel";
import { CheckboxDemo } from "./checkbox";
import { ClipboardDemo } from "./clipboard";
import { CodeDemo } from "./code";
import { CollapsibleDemo } from "./collapsible";
import { ComboboxDemo } from "./combobox";
import { DialogDemo } from "./dialog";
import { DrawerDemo } from "./drawer";
import { EditableDemo } from "./editable";
import { FieldDemo } from "./field";
import { FieldsetDemo } from "./fieldset";
import { FileUploadDemo } from "./file-upload";
import { GroupDemo } from "./group";
import { HeadingDemo } from "./heading";
import { HoverCardDemo } from "./hover-card";
import { IconDemo } from "./icon";
import { InputAddonDemo } from "./input-addon";
import { InputDemo } from "./input";
import { InputGroupDemo } from "./input-group";
import { KbdDemo } from "./kbd";
import { LinkDemo } from "./link";
import { MenuDemo } from "./menu";
import { NumberInputDemo } from "./number-input";
import { PaginationDemo } from "./pagination";
import { PinInputDemo } from "./pin-input";
import { PopoverDemo } from "./popover";
import { ProgressDemo } from "./progress";
import { RadioCardGroupDemo } from "./radio-card-group";
import { RadioGroupDemo } from "./radio-group";
import { RatingGroupDemo } from "./rating-group";
import { ScrollAreaDemo } from "./scroll-area";
import { SegmentGroupDemo } from "./segment-group";
import { SelectDemo } from "./select";
import { SkeletonDemo } from "./skeleton";
import { SliderDemo } from "./slider";
import { SpinnerDemo } from "./spinner";
import { SplitterDemo } from "./splitter";
import { SwitchRecipeDemo } from "./switch";
import { TableDemo } from "./table";
import { TabsDemo } from "./tabs";
import { TagsInputDemo } from "./tags-input";
import { TextDemo } from "./text";
import { TextareaDemo } from "./textarea";
import { ToastDemo } from "./toast";
import { ToggleGroupDemo } from "./toggle-group";
import { TooltipDemo } from "./tooltip";

import type { JSX } from "solid-js";

export interface DemoComponentProps {
  variantProps?: Record<string, string>;
}

export const DEMO_COMPONENTS: Record<
  string,
  (props: DemoComponentProps) => JSX.Element
> = {
  absoluteCenter: (props) => (
    <AbsoluteCenterDemo variantProps={props.variantProps} />
  ),
  accordion: (props) => <AccordionDemo variantProps={props.variantProps} />,
  alert: (props) => <AlertDemo variantProps={props.variantProps} />,
  avatar: (props) => <AvatarDemo variantProps={props.variantProps} />,
  badge: (props) => <BadgeDemo variantProps={props.variantProps} />,
  breadcrumb: (props) => <BreadcrumbDemo variantProps={props.variantProps} />,
  button: (props) => <ButtonDemo variantProps={props.variantProps} />,
  card: (props) => <CardDemo variantProps={props.variantProps} />,
  carousel: (props) => <CarouselDemo variantProps={props.variantProps} />,
  checkbox: (props) => <CheckboxDemo variantProps={props.variantProps} />,
  clipboard: (props) => <ClipboardDemo variantProps={props.variantProps} />,
  code: (props) => <CodeDemo variantProps={props.variantProps} />,
  collapsible: (props) => <CollapsibleDemo variantProps={props.variantProps} />,
  combobox: (props) => <ComboboxDemo variantProps={props.variantProps} />,
  dialog: (props) => <DialogDemo variantProps={props.variantProps} />,
  drawer: (props) => <DrawerDemo variantProps={props.variantProps} />,
  editable: (props) => <EditableDemo variantProps={props.variantProps} />,
  field: (props) => <FieldDemo variantProps={props.variantProps} />,
  fieldset: (props) => <FieldsetDemo variantProps={props.variantProps} />,
  fileUpload: (props) => <FileUploadDemo variantProps={props.variantProps} />,
  group: (props) => <GroupDemo variantProps={props.variantProps} />,
  heading: (props) => <HeadingDemo variantProps={props.variantProps} />,
  hoverCard: (props) => <HoverCardDemo variantProps={props.variantProps} />,
  icon: (props) => <IconDemo variantProps={props.variantProps} />,
  inputAddon: (props) => <InputAddonDemo variantProps={props.variantProps} />,
  input: (props) => <InputDemo variantProps={props.variantProps} />,
  inputGroup: (props) => <InputGroupDemo variantProps={props.variantProps} />,
  kbd: (props) => <KbdDemo variantProps={props.variantProps} />,
  link: (props) => <LinkDemo variantProps={props.variantProps} />,
  menu: (props) => <MenuDemo variantProps={props.variantProps} />,
  numberInput: (props) => <NumberInputDemo variantProps={props.variantProps} />,
  pagination: (props) => <PaginationDemo variantProps={props.variantProps} />,
  pinInput: (props) => <PinInputDemo variantProps={props.variantProps} />,
  popover: (props) => <PopoverDemo variantProps={props.variantProps} />,
  progress: (props) => <ProgressDemo variantProps={props.variantProps} />,
  radioCardGroup: (props) => (
    <RadioCardGroupDemo variantProps={props.variantProps} />
  ),
  radioGroup: (props) => <RadioGroupDemo variantProps={props.variantProps} />,
  ratingGroup: (props) => <RatingGroupDemo variantProps={props.variantProps} />,
  scrollArea: (props) => <ScrollAreaDemo variantProps={props.variantProps} />,
  segmentGroup: (props) => (
    <SegmentGroupDemo variantProps={props.variantProps} />
  ),
  select: (props) => <SelectDemo variantProps={props.variantProps} />,
  skeleton: (props) => <SkeletonDemo variantProps={props.variantProps} />,
  slider: (props) => <SliderDemo variantProps={props.variantProps} />,
  spinner: (props) => <SpinnerDemo variantProps={props.variantProps} />,
  splitter: (props) => <SplitterDemo variantProps={props.variantProps} />,
  switchRecipe: (props) => (
    <SwitchRecipeDemo variantProps={props.variantProps} />
  ),
  table: (props) => <TableDemo variantProps={props.variantProps} />,
  tabs: (props) => <TabsDemo variantProps={props.variantProps} />,
  tagsInput: (props) => <TagsInputDemo variantProps={props.variantProps} />,
  text: (props) => <TextDemo variantProps={props.variantProps} />,
  textarea: (props) => <TextareaDemo variantProps={props.variantProps} />,
  toast: (props) => <ToastDemo variantProps={props.variantProps} />,
  toggleGroup: (props) => <ToggleGroupDemo variantProps={props.variantProps} />,
  tooltip: (props) => <TooltipDemo variantProps={props.variantProps} />,
};
