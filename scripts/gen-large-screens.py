"""
Generates app/(site)/large-screens.css: a copy of every pixel size in the site's stylesheets,
rescaled by --u (one pixel of the 1470px-wide reference laptop, defined in responsive.css).

Above the laptop width (1470px) the site then renders as the laptop layout enlarged in proportion
to the window width. Width-relative values (%, plain vw) and hairlines are left alone, so canvases
and gutters keep the same share of the width from each edge. Clamps that mix in vh/svh are
evaluated at a 1470x820 window. Re-run after editing any listed stylesheet:

    python3 scripts/gen-large-screens.py
"""
import re
from pathlib import Path

import tinycss2

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app/(site)/large-screens.css"
REF_W, REF_H = 1470, 820
BREAKPOINT = 1471

SOURCES = [
    "app/(site)/globals.css",
    "app/(site)/refresh.css",
    "app/(site)/home-reference.css",
    "app/(site)/contact/contact.css",
    "app/(site)/sponsors/sponsors.css",
]
# Canvas/WebGL effects size themselves; the drift wall and loader have their own fitting.
EXCLUDED_COMPONENTS = {
    "DriftWall.css", "Galaxy.css", "GridScan.css", "RippleDistortion.css", "HexagonBackground.css",
    "LatticeLoader.css", "ElectricLogo.css", "dot-grid.css", "particle-text.css", "nav-progress.css",
    "site-loader.css", "hero-electric-wordmark.css", "LineSidebar.css",
}
SOURCES += sorted(
    str(p.relative_to(ROOT)) for p in (ROOT / "components").rglob("*.css")
    if p.name not in EXCLUDED_COMPONENTS
)

PROPS = re.compile(
    r"^(font|font-size|line-height|letter-spacing|text-indent|gap|row-gap|column-gap|"
    r"(padding|margin|inset)(-(top|right|bottom|left|inline|block)(-(start|end))?)?|"
    r"(min-|max-)?(width|height)|top|right|bottom|left|"
    r"border(-(top|bottom)-(left|right))?-radius|flex|flex-basis|"
    r"grid-template-(columns|rows)|grid-auto-(rows|columns)|--[\w-]+)$"
)


def px(value):
    n = round(value, 2)
    if abs(n) <= 1.5:
        return f"{n:g}px"
    return f"calc({n:g} * var(--u))"


def evaluate(fn_text):
    """Evaluate a clamp/min/max of px, vw, vh and svh at the reference viewport."""
    expr = fn_text
    expr = re.sub(r"(-?[\d.]+)(s|d|l)?vh", lambda m: f"({float(m.group(1)) * REF_H / 100})", expr)
    expr = re.sub(r"(-?[\d.]+)vw", lambda m: f"({float(m.group(1)) * REF_W / 100})", expr)
    expr = re.sub(r"(-?[\d.]+)vmin", lambda m: f"({float(m.group(1)) * min(REF_W, REF_H) / 100})", expr)
    expr = re.sub(r"(-?[\d.]+)px", r"(\1)", expr)
    expr = re.sub(r"(-?[\d.]+)(?![\d.)])", r"\1", expr)
    if re.search(r"[a-z%]", expr.replace("clamp", "").replace("min", "").replace("max", "").replace("calc", "")):
        return None
    try:
        return eval(expr, {"clamp": lambda a, b, c: max(a, min(b, c)), "min": min, "max": max, "calc": lambda x: x})
    except Exception:
        return None


def convert(tokens):
    """Return (serialized value, changed) with px dimensions rescaled."""
    out, changed = [], False
    for tok in tokens:
        if tok.type == "dimension" and tok.lower_unit == "px" and abs(tok.value) > 1.5:
            out.append(px(tok.value))
            changed = True
        elif tok.type == "function":
            text = tinycss2.serialize([tok])
            name = tok.lower_name
            if name in ("clamp", "min", "max") and re.search(r"\d(px|vw|s?vh)", text) and "var(" not in text and "%" not in text:
                value = evaluate(text)
                if value is not None:
                    out.append(px(value))
                    changed = True
                    continue
            if name in ("calc", "clamp", "min", "max", "minmax", "repeat", "fit-content"):
                inner, inner_changed = convert(tok.arguments)
                out.append(f"{tok.name}({inner})")
                changed |= inner_changed
            else:
                out.append(text)
        else:
            out.append(tinycss2.serialize([tok]))
    return "".join(out), changed


def media_applies(prelude):
    """Keep rules that can apply on wide desktop screens."""
    text = prelude.lower()
    if any(k in text for k in ("max-width", "max-height", "reduced-motion", "print", "pointer: coarse", "hover: none")):
        return False
    for m in re.finditer(r"min-width:\s*([\d.]+)px", text):
        if float(m.group(1)) > BREAKPOINT:
            return False
    return True


def scope(selector_list):
    """Add one element of specificity so these win over equal rules loaded later."""
    parts = []
    for sel in selector_list.split(","):
        sel = sel.strip()
        if not sel:
            continue
        if re.match(r"^(html|:root)\b", sel):
            parts.append(sel)
        else:
            parts.append(f"html {sel}")
    return ", ".join(parts)


def rules(nodes, depth=1):
    lines = []
    pad = "  " * depth
    for node in nodes:
        if node.type == "qualified-rule":
            decls = tinycss2.parse_declaration_list(node.content, skip_whitespace=True, skip_comments=True)
            body = []
            for d in decls:
                if d.type != "declaration" or not PROPS.match(d.lower_name):
                    continue
                value, changed = convert(d.value)
                if changed:
                    body.append(f"{d.name}: {value.strip()}{' !important' if d.important else ''};")
            if body:
                selector = tinycss2.serialize(node.prelude).strip()
                if "@" in selector:
                    continue
                lines.append(f"{pad}{scope(selector)} {{ {' '.join(body)} }}")
        elif node.type == "at-rule" and node.lower_at_keyword in ("media", "supports") and node.content:
            prelude = tinycss2.serialize(node.prelude).strip()
            if node.lower_at_keyword == "media" and not media_applies(prelude):
                continue
            inner = rules(tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True), depth + 1)
            if inner:
                lines.append(f"{pad}@{node.at_keyword} {prelude} {{")
                lines.extend(inner)
                lines.append(f"{pad}}}")
    return lines


def main():
    out = [
        "/* Generated by scripts/gen-large-screens.py — do not edit by hand. */",
        "/* Pixel sizes from the listed stylesheets, rescaled by --u above the laptop breakpoint. */",
        f"@media (min-width: {BREAKPOINT}px) {{",
    ]
    for src in SOURCES:
        sheet = tinycss2.parse_stylesheet((ROOT / src).read_text(), skip_whitespace=True, skip_comments=True)
        body = rules(sheet)
        if body:
            out.append(f"  /* {src} */")
            out.extend(body)
    out.append("}")
    OUT.write_text("\n".join(out) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(out)} lines from {len(SOURCES)} stylesheets")


if __name__ == "__main__":
    main()
