# BettingLog cursor-mascot — ready-to-paste prompts

Two sheets make the cursor-tracking mascot: **directions** (9 head turns) and
**reactions** (9 expressions). Use **one fresh chat**, exactly two messages:
paste PROMPT 1, save the result, then paste PROMPT 2 **with sheet 1 attached**.

Do not retry inside a chat that already holds failed attempts — the model averages
over them and the two sheets stop matching. If one needs redoing, start a new chat
and redo both.

Save results as:
- `characters/bettinglog/directions.png`
- `characters/bettinglog/reactions.png`

Then tell me, and I'll build + verify + wire them up.

## What changed from your logo prompt (and why)

The logo art and the sprite art are different jobs. For the sheets, three things
from your prompt had to be dropped:

| Dropped | Why |
|---|---|
| Green circle background | Sheets need a real transparent alpha channel; a filled circle eats the cell and destroys the margins. |
| Phone + both hands | Framing is a head-and-shoulders bust. Held props are out, and hands drawn differently per cell make the mascot lurch when clicked. |
| The 3 floating UI cards + yellow accent lines | Anything wider than the head is clipped at the cell boundary. |

Everything else — palette, navy outlines, glossy shading, friendly reflective
face — carries straight over.

---

## PROMPT 1 — DIRECTIONS

```
Generate a 3x3 grid sprite sheet of a cute chibi anthropomorphic white dice character with
rounded cube edges, thick dark navy blue (#002B6B) outlines, dark navy facial features, a
friendly reflective smile, and black pips on its visible faces. Cute storybook sticker art:
clean bold navy outlines with some weight variation, big expressive eyes each with a bright
white catchlight, soft pink cheek blush, and a polished modern mobile-app mascot finish.
Give it several tones per surface -- a bright white front face (#FFFFFF), light grey shading
(#EAEAEA) on the receding faces, glossy highlights along the top edges, and crisp rounded
bevels -- so the cube reads as a solid three-dimensional object rather than a flat square.
Charming and playful, clean vector precision, premium startup mascot quality.

This sheet is NINE HEAD DIRECTIONS, not expressions -- the face keeps the same calm friendly
expression in every cell and only the direction the head is TURNED changes.

THE CHARACTER IS A CUBE, so turning the head means ROTATING THE WHOLE DIE in 3D: as it turns
the front face swings across and a different side face comes into view. Keep the pip layout
consistent, as if it were one real die: the character's face lives on the front face, 3 pips
on the top face, 2 pips on the right face, 5 pips on the left face. Show whichever of those
faces the rotation would reveal. Do not just slide the eyes.

LAYOUT: 3 columns by 3 rows, evenly spaced, fully transparent background. Each drawing is the
die plus a small rounded white upper body, centred in its cell, same character and same head
size in all nine cells.

FRAMING: a PORTRAIT BUST. Die head, short neck and upper shoulders only. NO arms, NO hands,
NO phone, NO held objects, NO legs, NO lower body, NO floating cards or icons. The shoulders
are the lowest thing in the cell.

PROPORTIONS: a BIG HEAD chibi that still has a real body. The die head is large and dominant,
and the shoulders are roughly TWO THIRDS the width of the head -- narrower than the head, but
clearly there. Do NOT draw a floating head.

THE RULE THAT MATTERS MOST: draw the BODY ONCE and reuse it. The neck, chest and shoulders
must be the EXACT SAME SHAPE in the EXACT SAME POSITION in all nine cells, identical pixels if
you can. The body always faces the viewer. Do NOT redraw the body when the head turns. Only
the die rotates, on top of an unchanging body.

MARGINS -- this is what goes wrong most often, so follow it literally: each character must sit
ENTIRELY INSIDE its own cell with a wide empty gap on all four sides. Draw it at roughly 75% of
the cell height, centred, leaving clear empty space above the head AND below the shoulders. The
shoulders must STOP WELL SHORT of the bottom edge of the cell -- do not let the body run off the
bottom or bleed into the cell underneath. Nothing may touch or cross a cell boundary. Shrink the
character equally in every cell if that is what it takes.

Turn the whole die clearly: looking left swings the front face left and brings the left side
face into view; looking up tips the top face toward the viewer.
Row 1: up-left, up, up-right. Row 2: left, straight at the viewer, right.
Row 3: down-left, down, down-right.

NO hearts, NO sparkles, NO "zzz", NO spiral eyes -- no floating symbols of any kind.
No text, no labels, no borders, no drop shadows, no background colour, no green circle.
Square image, at least 1024x1024, PNG WITH A REAL ALPHA CHANNEL. The background must be
genuinely transparent, not white.
```

---

## PROMPT 2 — EXPRESSIONS

Attach the directions sheet from PROMPT 1 alongside this.

```
The attached image is a 3x3 head-direction sprite sheet. Produce the MATCHING EXPRESSIONS
sheet for that same character. The character is a cute chibi anthropomorphic white dice
character with rounded cube edges, thick dark navy blue (#002B6B) outlines, dark navy facial
features, light grey (#EAEAEA) shading on its side faces and black pips. Copy the character
from the attached image exactly: the same colours, the same pip layout, the same bevels and
glossy highlights, the same line weight. Every marking visible in the attached sheet must
appear here too. Do not restyle, simplify or redraw it.

NOT head directions. The character faces STRAIGHT AT THE VIEWER in all nine cells, the die
perfectly square-on. The only thing that changes between cells is the FACE, plus one small
floating symbol in three of them.

CRITICAL: same art style, same palette, same line weight, same proportions, and EXACTLY THE
SAME SIZE AND POSITION IN THE CELL as the attached sheet. The chest and shoulders must be the
same drawing, the same width, and the same height off the bottom of the cell as in the attached
sheet, identical in all nine cells here. If the two sheets do not line up the character visibly
jumps, so match them.

Wide margin on all four sides, nothing touching a cell edge including the floating symbols,
and clear empty space below the shoulders.

The nine expressions, left to right, top to bottom:
1. Eyes closed as two upward curved arcs. No symbol.
2. Same closed arc eyes, plus one clearly visible SMALL RED HEART floating in the empty space
   above the head. The heart must be present.
3. Same closed arc eyes, plus THREE SMALL YELLOW SPARKLE STARS above the head.
4. Eyes wide open and very round, mouth open in a small round O of surprise.
5. Starstruck: both eyes drawn as bright star shapes, big happy smile.
6. Eyes closed arcs, strong pink blush on both cheeks.
7. Eyes closed sleeping curves, plus a small blue "z z z" above the head.
8. Both eyes drawn as spiral swirls, wavy wobbly mouth. Dizzy.
9. Eyes closed arcs, mouth wide open in a big happy grin.

No text, no labels, no borders, no drop shadows, no background colour, no green circle.
Square image, at least 1024x1024, PNG WITH A REAL ALPHA CHANNEL. The background must be
genuinely transparent, not white.
```

---

## Movement notes

**The cube is an advantage.** Most characters fake a head turn by moving features
across a fixed silhouette. A die genuinely rotates — a new face swings into view —
so the turn reads as real 3D. That is why PROMPT 1 pins the pip layout (face on
front, 3 top, 2 right, 5 left): keeping it consistent is what makes it look like
one solid object turning rather than nine different drawings.

**Only the head moves.** The body is drawn once and reused in all 18 cells. Every
wobble people notice in these mascots comes from the body being redrawn per cell.

**Expression set is fixed.** The nine above aren't arbitrary — the component maps
cells to reactions by index, so swapping in custom ones would need component
changes. Keep them as written.

**After the sheets exist**, the mascot turns toward the cursor continuously and
plays a reaction on click. Nothing is animated frame-by-frame; it just moves
`background-position`, so it costs no JavaScript at runtime.
