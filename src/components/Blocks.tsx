import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import {
  bundledLanguages,
  bundledLanguagesAlias,
  getHighlighter,
  type BundledTheme,
  type BundledLanguage
} from "shiki";

function ImageBlock({ image }) {
  return (
    <img
      src={image.url + "?f=webp&w=736"}
      alt={image.alternativeText}
      width={736}
      height={image.height * (736 / image.width)}
    />
  );
}

const theme: BundledTheme = "aurora-x";
const languages: BundledLanguage[] = [
  ...Object.keys(bundledLanguages),
  ...Object.keys(bundledLanguagesAlias)
] as BundledLanguage[];

const highlighter = await getHighlighter({ langs: languages, themes: [theme] });

function CodeBlock({ plainText }) {
  let lang = plainText.slice(0, plainText.indexOf("\n"));
  if (languages.includes(lang)) plainText = plainText.slice(plainText.indexOf("\n") + 1);
  else lang = "plaintext";

  const html = highlighter.codeToHtml(plainText, { lang, theme });

  return <div className="code-block" dangerouslySetInnerHTML={{ __html: html }}></div>;
}

export function Blocks({ content }: { content: BlocksContent }) {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        image: ImageBlock,
        code: CodeBlock
      }}
    />
  );
}
