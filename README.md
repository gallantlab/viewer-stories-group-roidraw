# viewer-stories-group-roidraw

A brain viewer of the **gallantlab group semantic maps**, with **in-browser ROI and sulcus
drawing** added — an optional companion to the standard viewer. Same data and maps, plus the
ability to draw on the flattened cortex: lasso regions and export them as portable vertex sets, or
trace sulci and export them as pycortex `overlays.svg` markup.

### ▶ Open it: **https://gallantlab.org/viewer-stories-group-roidraw/**

- **Standard viewer (no drawing):** https://gallantlab.org/viewer-stories-group/ —
  [`gallantlab/viewer-stories-group`](https://github.com/gallantlab/viewer-stories-group)
- The surface, data, and overlays here are **identical** to the standard viewer; this build only
  adds the drawing UI, so it exposes nothing the standard viewer doesn't.

## Drawing

Use the **Display / Draw** toggle at the top:

- **Display** — the normal viewer + control panel.
- **Draw** — the brain flattens and the draw panel appears. An **`ROI` / `Sulcus`** selector at the
  top of the panel picks what a plain drag draws:

| Gesture | Action |
| --- | --- |
| Drag, with **ROI** selected | Lasso a region → name it → drawn onto the surface as a closed outline |
| Drag, with **Sulcus** selected | Trace along a sulcus → name it → drawn as an open curve |
| Scroll | Zoom (to draw fine detail) |
| **Shift** + drag | Pan |
| **Shift** + click | Inspect the data under the cursor |
| `Esc` | Cancel the current stroke |

Click **✎ edit** on any shape to reshape its bezier — drag anchors and tangent handles, double-click
the curve to insert a point. Everything drawn is a toggleable overlay layer alongside the built-in
rois/sulci.

### Two shapes, two export formats

- **ROIs** are closed curves. **Export ROIs (JSON)** writes portable per-hemisphere vertex indices,
  so an ROI re-imports to the exact same outline in any viewer on the same surface.
- **Sulci** are open curves. **Export sulci (SVG)** writes an `overlays.svg`-compatible fragment —
  pycortex's own storage format for sulci — which `quickflat`, the WebGL viewer, and Inkscape read
  natively. Trace a sulcus on each hemisphere and give both strokes the same name; they merge into a
  single group with one path per hemisphere, exactly as pycortex stores a sulcus such as `CaS`.
  Sulci carry no vertex data, because pycortex stores none.

## Running it locally

It's a static site — serve the directory and open **`viewer.html`** (`index.html` is a wrapper):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/viewer.html
```

Serve it over HTTP; opening `viewer.html` directly as a `file://` path won't load the data.

## How it was built

The standard viewer's assets (surface, data, overlays) are untouched. ROI drawing was added by
injecting a self-contained bundle (`roidraw.bundle.js`) plus two `<script>` tags into `viewer.html`,
and by applying small fixups to two long-standing pycortex help-menu bugs (shortcut-key casing, and
centering the `h` help panel). The drawing tool itself is the reusable
[`pycortex-roidraw`](https://github.com/gallantlab/pycortex-roidraw) library and can be dropped into
any pycortex viewer.

This build is baked with **pycortex-roidraw v0.4.0**. The bundle is a pinned copy, not a live link
to `releases/latest`, so it must be re-baked when roidraw changes.

---

## About the data

Pycortex viewer of group semantic maps computed on 24 participants.

This brain viewer presents a group-level model of lexical-semantic representation measured while
participants listened to stories drawn from the Moth Radio Hour. Twenty-four participants (11
females and 13 males) between the ages of 21 and 35 took part in the experiment. Nineteen
participants were scanned at the UC Berkeley Brain Imaging Center, and five participants were
scanned at the UT Austin Biomedical Imaging Center. The data from these latter five participants
are a subset of the public dataset by LeBel et al. (2023). All participants were healthy with
normal hearing. Participants listened to eleven 10- to 15-min stories taken from The Moth Radio
Hour over multiple scanning sessions (see Huth et al., 2016 and LeBel et al., 2023 for more
information about this paradigm). Participants were instructed to close their eyes and to listen
to the stories.
