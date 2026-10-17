import assert from "node:assert/strict";
import test from "node:test";
import { lexicalToSections, type LexicalNode } from "./blog-content";
import { teamGlowIcon } from "./team-glow-icons";

const content = (...children: LexicalNode[]) => ({ root: { children } });
const text = (value: string): LexicalNode => ({ type: "text", text: value });

test("blog spacing retains consecutive empty paragraphs, spaces, line breaks, and indentation", () => {
  const sections = lexicalToSections(content(
    { type: "paragraph", children: [text("  First   line"), { type: "linebreak" }, text("Second line  ")] },
    { type: "paragraph", children: [] },
    { type: "paragraph", children: [] },
    { type: "paragraph", indent: 2, children: [text("Indented")] }
  ));
  assert.deepEqual(sections?.[0].blocks, [
    { kind: "text", text: "  First   line\nSecond line  " },
    { kind: "text", text: "" },
    { kind: "text", text: "" },
    { kind: "text", text: "Indented", indent: 2 }
  ]);
});

test("spacing changes retain headings, lists, code, and uploaded images", () => {
  const image = { kind: "image" as const, src: "/media/test.webp", alt: "Robot" };
  const sections = lexicalToSections(content(
    { type: "heading", children: [text("Mechanical")] },
    { type: "list", listType: "number", children: [{ children: [text("One"), { type: "linebreak" }, text("Two")] }] },
    { type: "block", fields: { blockType: "Code", code: "  robot.run();", language: "java" } },
    { type: "upload", value: 10 }
  ), () => image);
  assert.equal(sections?.[0].heading, "Mechanical");
  assert.deepEqual(sections?.[0].blocks, [
    { kind: "list", ordered: true, items: ["One\nTwo"] },
    { kind: "code", code: "  robot.run();", lang: "java" },
    image
  ]);
});

test("a person's selected icon overrides their role, while automatic and no-icon work", () => {
  assert.equal(teamGlowIcon("media", "Programming Lead"), "/team/icons/media.webp");
  assert.equal(teamGlowIcon("auto", "Programming Lead"), "/team/icons/code.webp");
  assert.equal(teamGlowIcon(null, "CAD Lead"), "/team/icons/cad.webp");
  assert.equal(teamGlowIcon("none", "CAD Lead"), undefined);
});
