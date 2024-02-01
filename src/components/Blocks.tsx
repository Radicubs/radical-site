import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export function Blocks({ content }: { content: BlocksContent }) {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        image: ({ image }) => (
          <img
            src={image.url + "?f=webp&w=736"}
            alt={image.alternativeText}
            width={736}
            height={image.height * (736 / image.width)}
          />
        )
      }}
    />
  );
}
