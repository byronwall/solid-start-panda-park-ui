import { children, splitProps, type JSX } from "solid-js";
import { normalizeCodeText, parseLanguage } from "./markdown-utils";
import { isBlockCode } from "./markdown-code-utils";
import { HighlightedLineNumberedCode } from "./highlighted-line-numbered-code";
import { markdownStyles } from "./markdown-styles";

type MarkdownCodeProps = JSX.HTMLAttributes<HTMLElement> & {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: JSX.Element;
};

export function MarkdownCode(codeProps: MarkdownCodeProps) {
  const [local, rest] = splitProps(codeProps, [
    "children",
    "node",
    "class",
    "className",
    "inline",
  ]);
  const resolvedChildren = children(() => local.children);
  const codeText = () => normalizeCodeText(resolvedChildren(), local.node);

  const languageClass = () => local.class ?? local.className;

  if (!isBlockCode(languageClass(), local.inline)) {
    return (
      <code class={markdownStyles.inlineCode} {...rest}>
        {codeText()}
      </code>
    );
  }

  const language = parseLanguage(languageClass());

  return (
    <HighlightedLineNumberedCode
      {...rest}
      language={language}
      codeText={codeText()}
      data-md-raw={codeText()}
    />
  );
}
