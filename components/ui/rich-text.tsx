import { Fragment, type ReactNode } from "react";

/**
 * CMS page text as JSX: *asterisks* become the green <em> part of a heading, and {name}
 * is replaced by values[name] (text or a link). Unknown {names} are left as typed.
 */
export function rich(text: string, values: Record<string, ReactNode> = {}): ReactNode {
  return text.split(/(\*[^*]+\*|\{\w+\})/).map((part, index) => {
    if (/^\*[^*]+\*$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    if (name && name in values) return <Fragment key={index}>{values[name]}</Fragment>;
    return part;
  });
}
