var ROIDrawBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // index.js
  var index_exports = {};
  __export(index_exports, {
    attach: () => attach,
    autoAttach: () => autoAttach
  });

  // adapter/viewer-adapter.js
  var ViewerAdapter = class {
    /* --- surface identity ------------------------------------------------------------- */
    /** @returns {string} an id for the surface (e.g. "fsaverage"), stamped into exports. */
    surfaceId() {
      throw new Error("ViewerAdapter.surfaceId not implemented");
    }
    /** @returns {boolean} whether the surface is fully flattened (drawing is flat-only). */
    isFlat() {
      throw new Error("ViewerAdapter.isFlat not implemented");
    }
    /** @returns {{width:number, height:number}} the surface canvas size in CSS px. */
    viewportSize() {
      throw new Error("ViewerAdapter.viewportSize not implemented");
    }
    /** @returns {HTMLCanvasElement} the surface's WebGL canvas (for positioning the overlay). */
    canvas() {
      throw new Error("ViewerAdapter.canvas not implemented");
    }
    /* --- projection (host-specific: morph + camera) ----------------------------------- */
    /**
     * Project the surface's vertices to screen px at the CURRENT view, dropping anything
     * behind the camera. Used for selection and view-framing.
     * @param {{subsample?:number}} [opts] keep ~1 of every `subsample` vertices (framing only).
     * @returns {{left:{idx:number[], px:[number,number][]}, right:{...}}}  in-frustum verts.
     */
    projectVertices(_opts) {
      throw new Error("ViewerAdapter.projectVertices not implemented");
    }
    /**
     * Every vertex's subject index + flat-UV, per hemi. View-INDEPENDENT (no camera): the basis
     * for uv-space ROI membership, so a reloaded bezier selects the same vertices at any view.
     * @returns {{left:{idx:number[], uv:[number,number][]}, right:{...}}}
     */
    allVertexUV() {
      throw new Error("ViewerAdapter.allVertexUV not implemented");
    }
    /** @returns {[number,number]|null} flat-UV ([0,1]) of one subject vertex {h,g}, or null. */
    vertexUV(_o) {
      throw new Error("ViewerAdapter.vertexUV not implemented");
    }
    /**
     * Project ONLY the vertices whose flat-UV falls within `bounds`, reporting each one's uv AND
     * current-view px. The bezier edit overlay fits a LOCAL uv<->px homography from these (one
     * global homography drifts where the flatmap isn't perfectly planar; locally it's near-exact).
     * @param {{minu:number,maxu:number,minv:number,maxv:number}} bounds
     * @returns {{left:{uv:[number,number][], px:[number,number][]}, right:{...}}}
     */
    projectVerticesInUvBounds(_bounds) {
      throw new Error("ViewerAdapter.projectVerticesInUvBounds not implemented");
    }
    /* --- overlay layer (the occlusion-correct ROI rendering) -------------------------- */
    /**
     * Create/replace a named overlay layer rendered INTO the surface (so it occludes and morphs
     * like built-in ROIs). `rois` carries, per ROI, the boundary ring + label vertex (and, when
     * present, an editable flat-UV `bezier` the adapter renders as a smooth cubic path); the
     * adapter converts vertices/bezier→uv→layer geometry.
     * @param {string} name
     * @param {Array<{name, outline:[{h,g}], labelVert:{h,g}, bezier?}>} rois
     */
    setOverlayLayer(_name, _rois) {
      throw new Error("ViewerAdapter.setOverlayLayer not implemented");
    }
    /** Show/hide the outlines and labels of a previously-created layer. */
    setLayerVisible(_name, _shapes, _labels) {
      throw new Error("ViewerAdapter.setLayerVisible not implemented");
    }
    /* --- camera / transitions --------------------------------------------------------- */
    /** Smoothly flatten the surface (mix -> 1). */
    flatten() {
      throw new Error("ViewerAdapter.flatten not implemented");
    }
    /** Aim the camera at a world point [x,y,z] (keeps the center of mass framed). */
    setCameraTarget(_xyz) {
      throw new Error("ViewerAdapter.setCameraTarget not implemented");
    }
    /** Set the camera orbit radius (zoom). */
    setCameraRadius(_r) {
      throw new Error("ViewerAdapter.setCameraRadius not implemented");
    }
    /** @returns {number} current camera orbit radius. */
    cameraRadius() {
      throw new Error("ViewerAdapter.cameraRadius not implemented");
    }
    /** Request a render (viewers render on demand). */
    requestRender() {
      throw new Error("ViewerAdapter.requestRender not implemented");
    }
    /* --- events ----------------------------------------------------------------------- */
    /** Subscribe to surface morph changes; cb() runs on every mix frame. @returns {function} unsubscribe */
    onMixChange(_cb) {
      throw new Error("ViewerAdapter.onMixChange not implemented");
    }
    /* --- optional niceties (sensible defaults; override if the host supports them) ----- */
    /** Forward a click to the host's own picker (Shift-inspect while drawing). */
    inspectAt(_x, _y) {
    }
    /** Zoom the surface by a mouse-wheel delta (lets the user draw fine detail). */
    zoom(_deltaY) {
    }
    /** Pan the surface by a screen-pixel drag delta (reposition while drawing). */
    pan(_dx, _dy) {
    }
    /** @returns {DOMRect|null} the host control panel's screen rect, for placing UI beside it. */
    controlPanelRect() {
      return null;
    }
    /** Collapse the host's own control panel on startup. */
    collapseControlPanel() {
    }
    /** Show/hide the host's control panel when switching Display/Draw modes. */
    setControlPanelVisible(_visible) {
    }
  };

  // core/geom.js
  function pointInPolygon(pt, poly) {
    const x = pt[0], y = pt[1];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const crosses = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (crosses) inside = !inside;
    }
    return inside;
  }
  function polygonBounds(poly) {
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (let i = 0; i < poly.length; i++) {
      const px = poly[i][0], py = poly[i][1];
      if (px < minx) minx = px;
      if (px > maxx) maxx = px;
      if (py < miny) miny = py;
      if (py > maxy) maxy = py;
    }
    return { minx, miny, maxx, maxy };
  }
  function inBounds(pt, b) {
    return pt[0] >= b.minx && pt[0] <= b.maxx && pt[1] >= b.miny && pt[1] <= b.maxy;
  }
  function simplifyRDP(points, epsilon) {
    if (points.length < 3) return points.slice();
    const sqEps = epsilon * epsilon;
    const keep = new Array(points.length);
    keep[0] = keep[points.length - 1] = true;
    const sqSegDist = (p, a, b) => {
      let x = a[0], y = a[1];
      let dx = b[0] - x, dy = b[1] - y;
      if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
          x = b[0];
          y = b[1];
        } else if (t > 0) {
          x += dx * t;
          y += dy * t;
        }
      }
      dx = p[0] - x;
      dy = p[1] - y;
      return dx * dx + dy * dy;
    };
    const stack = [[0, points.length - 1]];
    while (stack.length) {
      const [first, last] = stack.pop();
      let maxd = 0, idx = -1;
      for (let i = first + 1; i < last; i++) {
        const d = sqSegDist(points[i], points[first], points[last]);
        if (d > maxd) {
          maxd = d;
          idx = i;
        }
      }
      if (maxd > sqEps) {
        keep[idx] = true;
        stack.push([first, idx], [idx, last]);
      }
    }
    const out = [];
    for (let k = 0; k < points.length; k++) if (keep[k]) out.push(points[k]);
    return out;
  }
  function chaikin(points, iterations = 1) {
    let pts = points;
    for (let it = 0; it < iterations; it++) {
      if (pts.length < 3) break;
      const next = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
        next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      pts = next;
    }
    return pts;
  }
  function centroid(points) {
    if (!points.length) return null;
    let sx = 0, sy = 0;
    for (let i = 0; i < points.length; i++) {
      sx += points[i][0];
      sy += points[i][1];
    }
    return [sx / points.length, sy / points.length];
  }

  // adapter/pycortex-adapter.js
  var SVGNS = "http://www.w3.org/2000/svg";
  var HEMIS = ["left", "right"];
  var FLAT_THRESHOLD = 0.999;
  var DEFAULT_FILL = 0.7;
  var FRAME_SUBSAMPLE = 250;
  var ZOOM_SENSITIVITY = 1e-3;
  var DEFAULT_FOV_DEG = 35;
  var OVERLAY_RETRY_MAX = 40;
  var OVERLAY_RETRY_MS = 250;
  var COLLAPSE_SCHEDULE_MS = [400, 1200, 2500, 4500];
  var COLLAPSE_WINDOW_MS = 8e3;
  function attrCount(attr) {
    if (attr.count !== void 0 && !isNaN(attr.count)) return attr.count;
    return attr.array.length / attr.itemSize;
  }
  function findSurface(viewer) {
    const surfs = viewer && viewer.surfs;
    if (!surfs || !surfs.length) return null;
    for (let i = 0; i < surfs.length; i++) {
      const s = surfs[i];
      if (!s) continue;
      if (s.surf && s.surf.pivots) return s.surf;
      if (s.pivots) return s;
    }
    return null;
  }
  function surfaceReady(viewer) {
    const s = findSurface(viewer);
    return !!(s && s.pivots && s.hemis && s.hemis.left && s.hemis.left.attributes && s.hemis.left.attributes.position);
  }
  var PycortexAdapter = class extends ViewerAdapter {
    constructor(viewer, { layerName = "drawnrois", animSpeedFallback = 0.6 } = {}) {
      super();
      this.THREE = globalThis.THREE;
      this.mriview = globalThis.mriview;
      this.svgoverlay = globalThis.svgoverlay;
      if (!this.THREE) throw new Error("[roidraw] THREE global not found");
      if (!this.mriview || !this.mriview.get_position) throw new Error("[roidraw] mriview.get_position not found");
      this.viewer = viewer;
      this.surface = findSurface(viewer);
      if (!this.surface) throw new Error("[roidraw] could not locate Surface (viewer.surfs[].surf)");
      this.posdata = this.surface.picker && this.surface.picker.posdata || this._buildPosdata();
      this._layerName = layerName;
      this._animSpeedFallback = animSpeedFallback;
      this._v = new this.THREE.Vector3();
      this._thickmix = 0.5;
      this._drawn = null;
      this._layerHidden = false;
      this._labelsHidden = false;
      this._uiFolderAdded = false;
    }
    // --- surface identity -------------------------------------------------------------
    surfaceId() {
      try {
        const d = this.viewer.active && this.viewer.active.data && this.viewer.active.data[0];
        if (d && d.subject) return d.subject;
      } catch (e) {
      }
      return "unknown";
    }
    isFlat() {
      return this._currentMix() >= FLAT_THRESHOLD;
    }
    viewportSize() {
      const r = this.canvas().getBoundingClientRect();
      return { width: r.width, height: r.height };
    }
    canvas() {
      const c = this.viewer.canvas;
      if (c && c[0]) return c[0];
      if (c instanceof HTMLCanvasElement) return c;
      return this.viewer.renderer && this.viewer.renderer.domElement;
    }
    // --- projection -------------------------------------------------------------------
    // Live unfold mix straight from the viewer (surfmix === slider value); don't trust caches.
    _currentMix() {
      try {
        if (typeof this.viewer.setMix === "function") {
          const m = this.viewer.setMix();
          if (typeof m === "number") return m;
        }
      } catch (e) {
      }
      return 0;
    }
    _flatOffY() {
      return this.surface.flatoff && this.surface.flatoff[1] || 0;
    }
    // Refresh the WHOLE pivot chain so back.matrixWorld reflects the current mix, then return
    // {cam, surfmix, foy, W, H}. setMix drives ancestor transforms (pivots.front via setPivot,
    // back.rotation.x), so updating only `back` would read a stale parent.
    _prepProjection() {
      const cam = this.viewer.camera;
      cam.updateMatrixWorld();
      if (this.viewer.root && this.viewer.root.updateMatrixWorld) this.viewer.root.updateMatrixWorld(true);
      const r = this.canvas().getBoundingClientRect();
      return { cam, surfmix: this._currentMix(), foy: this._flatOffY(), W: r.width, H: r.height };
    }
    // World position of geometry-local vertex `i` at the current mix (incl. the flatoff offset
    // so it lands on the *rendered* mesh, not floating above it). Mutates+returns this._v.
    _worldOf(pd, mw, i, surfmix, foy) {
      const gp = this.mriview.get_position(pd, surfmix, this._thickmix, i).pos;
      gp.y -= foy;
      return this._v.copy(gp).applyMatrix4(mw);
    }
    projectVertices({ subsample = 1 } = {}) {
      const { cam, surfmix, foy, W, H } = this._prepProjection();
      const out = { left: { idx: [], px: [] }, right: { idx: [], px: [] } };
      for (const h of HEMIS) {
        const pivot = this.surface.pivots[h].back;
        pivot.updateMatrixWorld(true);
        const mw = pivot.matrixWorld;
        const pd = this.posdata[h];
        const revIdx = this.surface.hemis[h].reverseIndexMap;
        const n = attrCount(pd.positions[0]);
        const step = Math.max(1, subsample | 0);
        for (let i = 0; i < n; i += step) {
          const v = this._worldOf(pd, mw, i, surfmix, foy).project(cam);
          if (v.z < -1 || v.z > 1) continue;
          out[h].idx.push(revIdx[i]);
          out[h].px.push(this._ndc(v, W, H));
        }
      }
      return out;
    }
    // All vertices' subject index + flat-UV, per hemi. View-INDEPENDENT (no camera), so it's the
    // basis for uv-space ROI membership: a reloaded bezier selects the same vertices regardless of
    // the current pan/zoom/mix. uv is the same shared [0,1]^2 the SVG overlay uses.
    allVertexUV() {
      const out = { left: { idx: [], uv: [] }, right: { idx: [], uv: [] } };
      for (const h of HEMIS) {
        const hemi = this.surface.hemis[h];
        const uvarr = hemi.attributes.uv && hemi.attributes.uv.array;
        if (!uvarr) continue;
        const revIdx = hemi.reverseIndexMap;
        const n = attrCount(this.posdata[h].positions[0]);
        for (let i = 0; i < n; i++) {
          out[h].idx.push(revIdx[i]);
          out[h].uv.push([uvarr[i * 2], uvarr[i * 2 + 1]]);
        }
      }
      return out;
    }
    // Flat-UV of one subject vertex {h,g}, or null if it has no flat coords.
    vertexUV(o) {
      const hemi = this.surface.hemis[o.h];
      if (!hemi || !hemi.attributes.uv) return null;
      const gi = hemi.indexMap[o.g];
      if (gi === void 0) return null;
      const uv = hemi.attributes.uv.array;
      return [uv[gi * 2], uv[gi * 2 + 1]];
    }
    // Project ONLY the vertices whose flat-UV is within `b` ({minu,maxu,minv,maxv}). Cheap (scans
    // uv with no projection, projects just the in-bounds few) and dense. The edit overlay fits its
    // uv->px homography from these LOCAL correspondences: the flatmap isn't perfectly planar, so a
    // single global homography drifts, but locally (around one ROI) it's near-exact — which is what
    // makes the editable curve trace the baked white outline instead of sitting slightly inside it.
    projectVerticesInUvBounds(b) {
      const { cam, surfmix, foy, W, H } = this._prepProjection();
      const out = { left: { uv: [], px: [] }, right: { uv: [], px: [] } };
      for (const h of HEMIS) {
        const pivot = this.surface.pivots[h].back;
        pivot.updateMatrixWorld(true);
        const mw = pivot.matrixWorld;
        const pd = this.posdata[h];
        const uvarr = this.surface.hemis[h].attributes.uv && this.surface.hemis[h].attributes.uv.array;
        if (!uvarr) continue;
        const n = attrCount(pd.positions[0]);
        for (let i = 0; i < n; i++) {
          const u = uvarr[i * 2], v = uvarr[i * 2 + 1];
          if (u < b.minu || u > b.maxu || v < b.minv || v > b.maxv) continue;
          const p = this._worldOf(pd, mw, i, surfmix, foy).project(cam);
          if (p.z < -1 || p.z > 1) continue;
          out[h].uv.push([u, v]);
          out[h].px.push(this._ndc(p, W, H));
        }
      }
      return out;
    }
    _ndc(v, W, H) {
      return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H];
    }
    // --- view framing primitive -------------------------------------------------------
    // Center of mass (world) + the camera radius that fills `fillTarget` of the viewport.
    // fill is the on-screen NDC extent (canvas-size independent); on-screen size ∝ 1/radius.
    measureFrame(fillTarget = DEFAULT_FILL, subsample = FRAME_SUBSAMPLE) {
      const ctrl = this.viewer.controls;
      if (!ctrl || typeof ctrl.radius !== "number") return null;
      const { cam, surfmix, foy, W, H } = this._prepProjection();
      let sx = 0, sy = 0, sz = 0, count = 0;
      let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity, seen = false;
      for (const h of HEMIS) {
        const pivot = this.surface.pivots[h].back;
        pivot.updateMatrixWorld(true);
        const mw = pivot.matrixWorld, pd = this.posdata[h], n = attrCount(pd.positions[0]);
        const step = Math.max(1, Math.floor(n / subsample));
        for (let i = 0; i < n; i += step) {
          const w = this._worldOf(pd, mw, i, surfmix, foy);
          sx += w.x;
          sy += w.y;
          sz += w.z;
          count++;
          const nd = w.clone().project(cam);
          if (nd.z < -1 || nd.z > 1) continue;
          const px = this._ndc(nd, W, H);
          if (px[0] < minx) minx = px[0];
          if (px[0] > maxx) maxx = px[0];
          if (px[1] < miny) miny = px[1];
          if (px[1] > maxy) maxy = px[1];
          seen = true;
        }
      }
      if (!count) return null;
      const out = { com: [sx / count, sy / count, sz / count], radius: ctrl.radius };
      if (seen && W > 0 && H > 0) {
        const fill = Math.max((maxx - minx) / W, (maxy - miny) / H);
        if (fill > 0.01) out.radius = ctrl.radius * (fill / fillTarget);
      }
      return out;
    }
    // --- camera / transitions ---------------------------------------------------------
    _animSpeed() {
      const v = globalThis.viewopts && parseFloat(globalThis.viewopts.anim_speed);
      return v && isFinite(v) ? v : this._animSpeedFallback;
    }
    setCameraTarget(xyz) {
      const c = this.viewer.controls;
      if (c && c.setTarget) c.setTarget(xyz);
    }
    setCameraRadius(r) {
      const c = this.viewer.controls;
      if (c && c.setRadius) c.setRadius(r);
    }
    cameraRadius() {
      const c = this.viewer.controls;
      return c ? c.radius : 0;
    }
    requestRender() {
      if (typeof this.viewer.schedule === "function") this.viewer.schedule();
    }
    // Forward a click to the viewer's own voxel picker (Shift-inspect while drawing). Dispatching
    // the controls' "pick" event is the exact native click path, minus the mouse state machine.
    inspectAt(x, y) {
      const ctrl = this.viewer.controls;
      if (ctrl && ctrl.dispatchEvent) ctrl.dispatchEvent({ type: "pick", x, y, keep: false });
    }
    // Screen rect of the host control panel, so the UI can sit beside it. null if unavailable.
    controlPanelRect() {
      const el = this.viewer.gui && this.viewer.gui.domElement;
      return el ? el.getBoundingClientRect() : null;
    }
    // Zoom by a mouse-wheel delta (toward the user => zoom out). Adjusts the orbit radius directly,
    // bypassing the controls' mouse-state machine.
    zoom(deltaY) {
      const c = this.viewer.controls;
      if (!c || typeof c.radius !== "number") return;
      const r = c.radius * Math.exp(deltaY * ZOOM_SENSITIVITY);
      if (typeof c.setRadius === "function") c.setRadius(r);
      else c.radius = r;
      this.requestRender();
    }
    // Pan by a screen-pixel drag delta. This controls version has no setpan, and it rebuilds
    // controls.target every frame from _flat/_foldedtarget — so we move the orbit point through
    // setTarget (which updates those persistent targets; the same lever framing uses). We shift
    // the target along the camera's screen axes, scaled by world-units-per-pixel at the current
    // zoom (so panning is ~1:1 with the cursor); the surface follows the cursor ("grab").
    pan(dx, dy) {
      const c = this.viewer.controls, cam = this.viewer.camera, THREE = this.THREE;
      if (!c || typeof c.setTarget !== "function" || typeof c.radius !== "number" || !cam) return;
      const cur = c.setTarget();
      if (!Array.isArray(cur)) return;
      cam.updateMatrixWorld();
      const e = cam.matrixWorld.elements;
      const right = new THREE.Vector3(e[0], e[1], e[2]).normalize();
      const up = new THREE.Vector3(e[4], e[5], e[6]).normalize();
      const vh = this.viewportSize().height || 1;
      const worldPerPx = 2 * c.radius * Math.tan((cam.fov || DEFAULT_FOV_DEG) * Math.PI / 180 / 2) / vh;
      right.multiplyScalar(-dx * worldPerPx);
      up.multiplyScalar(dy * worldPerPx);
      c.setTarget([cur[0] + right.x + up.x, cur[1] + right.y + up.y, cur[2] + right.z + up.z]);
      this.requestRender();
    }
    // Smooth state transition using the viewer's own animation (same as its toolbar buttons).
    animateCamera({ target, radius, mix }) {
      const sp = this._animSpeed(), anim = [];
      if (target) anim.push({ state: "camera.target", idx: sp, value: [target[0], target[1], target[2]] });
      if (radius != null) anim.push({ state: "camera.radius", idx: sp, value: radius });
      if (mix != null) anim.push({ state: "mix", idx: sp, value: mix });
      if (!anim.length) return;
      try {
        this.viewer.animate(anim);
      } catch (e) {
        if (target) this.setCameraTarget(target);
        if (radius != null) this.setCameraRadius(radius);
        if (mix != null && typeof this.viewer.setMix === "function") this.viewer.setMix(mix);
        this.requestRender();
      }
    }
    flatten() {
      this.animateCamera({ mix: 1 });
    }
    // --- events -----------------------------------------------------------------------
    onMixChange(cb) {
      const surf = this.surface;
      const handler = () => cb();
      surf.addEventListener("mix", handler);
      const repaint = () => this.requestRender();
      surf.addEventListener("update", repaint);
      return () => {
        surf.removeEventListener("mix", handler);
        surf.removeEventListener("update", repaint);
      };
    }
    // --- overlay layer (occlusion-correct ROI rendering) ------------------------------
    setOverlayLayer(name, rois) {
      const svgo = this.surface.svg;
      if (!svgo || !svgo.svg || !svgo.posdata || !svgo.depth) return false;
      const doc = svgo.svg.ownerDocument;
      const vb = (svgo.svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(parseFloat);
      const W = vb.length === 4 && vb[2] ? vb[2] : svgo.width;
      const H = vb.length === 4 && vb[3] ? vb[3] : svgo.height;
      if (this._drawn) {
        try {
          if (this._drawn.labels) {
            svgo.labels.left.remove(this._drawn.labels.meshes.left);
            svgo.labels.right.remove(this._drawn.labels.meshes.right);
          }
          if (this._drawn.layerEl && this._drawn.layerEl.parentNode)
            this._drawn.layerEl.parentNode.removeChild(this._drawn.layerEl);
        } catch (e) {
        }
        delete svgo.layers[name];
        delete svgo[name];
        this._drawn = null;
      }
      if (!rois.length) {
        svgo.update();
        return true;
      }
      const layerEl = doc.createElementNS(SVGNS, "g");
      layerEl.setAttribute("id", name);
      layerEl.setAttribute("class", "display_layer");
      layerEl.setAttribute("style", "display:" + (this._layerHidden ? "none" : "inline"));
      const shapesEl = doc.createElementNS(SVGNS, "g");
      shapesEl.setAttribute("id", name + "_shapes");
      const labelsEl = doc.createElementNS(SVGNS, "g");
      labelsEl.setAttribute("id", name + "_labels");
      layerEl.appendChild(shapesEl);
      layerEl.appendChild(labelsEl);
      for (const roi of rois) {
        const d = this._roiSvgPath(roi, W, H);
        if (d) {
          const path = doc.createElementNS(SVGNS, "path");
          path.setAttribute("d", d);
          path.setAttribute("style", "fill:none;stroke:#ffffff;stroke-width:3;stroke-opacity:1");
          shapesEl.appendChild(path);
        }
        const ptidx = this._labelPtidx(roi.labelVert);
        if (ptidx != null) {
          const t = doc.createElementNS(SVGNS, "text");
          t.setAttribute("data-ptidx", String(ptidx));
          t.setAttribute("style", "font-family:Helvetica, sans-serif;font-size:14pt;font-weight:bold;font-style:italic;fill:white;fill-opacity:1;text-anchor:middle;filter:url(#dropshadow)");
          t.appendChild(doc.createTextNode(roi.name));
          labelsEl.appendChild(t);
        }
      }
      svgo.svg.appendChild(layerEl);
      let labels = null;
      try {
        labels = new this.svgoverlay.Labels(labelsEl, svgo.posdata, !!this._labelsHidden);
        labels.shader.uniforms.depth.value = svgo.depth;
        const w = this.surface.width || this.viewportSize().width || 1024;
        const h = this.surface.height || this.viewportSize().height || 768;
        labels.shader.uniforms.scale.value.set(1 / w, 1 / h);
        labels.setMix({ mix: this._currentMix(), thickmix: this._thickmix });
        svgo.labels.left.add(labels.meshes.left);
        svgo.labels.right.add(labels.meshes.right);
      } catch (e) {
        console.warn("[roidraw] ROI labels failed (outlines still drawn):", e);
        labels = null;
      }
      const stub = { meshes: { left: { visible: false }, right: { visible: false } }, setMix() {
      }, showhide() {
      } };
      svgo.layers[name] = svgo[name] = {
        name,
        layer: layerEl,
        labels: labels || stub,
        _hidden: !!this._layerHidden,
        showhide(state) {
          if (state === void 0) return !this._hidden;
          this._hidden = !state;
          layerEl.style.display = state ? "inline" : "none";
        }
      };
      this._drawn = { layerEl, labels };
      this._ensureUIFolder(name);
      svgo.update();
      return true;
    }
    // An ROI's white outline as an SVG path in overlay (flat-uv) coords: uv -> (u*W,(1-v)*H).
    // When the ROI carries a bezier (the editable boundary), emit it as a native cubic path —
    // genuinely smooth and compact. Otherwise fall back to a Chaikin-smoothed vertex ring (v1 ROIs).
    _roiSvgPath(roi, W, H) {
      if (roi.bezier && roi.bezier.anchors && roi.bezier.anchors.length >= 3)
        return this._bezierSvgPath(roi.bezier, W, H);
      if (!roi.outline || roi.outline.length < 3) return null;
      const pts = [];
      for (const o of roi.outline) {
        const uv = this.vertexUV(o);
        if (uv) pts.push([uv[0] * W, (1 - uv[1]) * H]);
      }
      if (pts.length < 3) return null;
      const c = chaikin(pts, 2);
      let d = "M" + c[0][0].toFixed(2) + "," + c[0][1].toFixed(2);
      for (let i = 1; i < c.length; i++) d += "L" + c[i][0].toFixed(2) + "," + c[i][1].toFixed(2);
      return d + "Z";
    }
    // Closed cubic-bezier path from {anchors,inHandles,outHandles} in flat-uv -> viewBox px.
    _bezierSvgPath(bez, W, H) {
      const { anchors, inHandles, outHandles } = bez;
      const n = anchors.length;
      const P = (uv) => (uv[0] * W).toFixed(2) + "," + ((1 - uv[1]) * H).toFixed(2);
      let d = "M" + P(anchors[0]);
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        d += "C" + P(outHandles[i]) + " " + P(inHandles[j]) + " " + P(anchors[j]);
      }
      return d + "Z";
    }
    _labelPtidx(lv) {
      if (!lv) return null;
      const leftlen = attrCount(this.posdata.left.positions[0]);
      return lv.h === "left" ? lv.g : leftlen + lv.g;
    }
    setLayerVisible(name, shapes, labels) {
      if (shapes !== void 0) {
        this._layerHidden = !shapes;
        if (this._drawn && this._drawn.layerEl) this._drawn.layerEl.style.display = shapes ? "inline" : "none";
        if (this.surface.svg) this.surface.svg.update();
      }
      if (labels !== void 0) {
        this._labelsHidden = !labels;
        if (this._drawn && this._drawn.labels) this._drawn.labels.showhide(labels);
      }
    }
    // Register a "drawn ROIs" folder under Surface > overlays, once (mirrors built-in rois/sulci).
    _ensureUIFolder(name) {
      if (this._uiFolderAdded) return;
      const svgo = this.surface.svg, self = this;
      if (!svgo || !svgo.ui) return;
      try {
        svgo.ui.addFolder("drawn ROIs", true).add({
          visible: { action: [{ get f() {
            return !self._layerHidden;
          }, set f(v) {
            self.setLayerVisible(name, v, void 0);
          } }, "f"] }
        });
        this._uiFolderAdded = true;
      } catch (e) {
        console.warn("[roidraw] control-panel folder add failed:", e);
      }
    }
    // --- host control panel + defaults ------------------------------------------------
    collapseControlPanel(closeRoot = true) {
      const close = (gui, includeSelf) => {
        if (!gui) return;
        const folders = gui.__folders || {};
        for (const k in folders) close(folders[k], true);
        if (includeSelf) {
          try {
            gui.close();
          } catch (e) {
          }
        }
      };
      close(this.viewer.gui, closeRoot);
    }
    setControlPanelVisible(visible) {
      const el = this.viewer.gui && this.viewer.gui.domElement;
      if (el) el.style.display = visible ? "" : "none";
    }
    // pycortex-specific startup niceties (not part of the portable contract):
    // hide the built-in ROI layer (keep sulci), and re-collapse the late "data layers" folder.
    applyHostDefaults() {
      const trySetOverlays = (tries) => {
        const svg = this.surface && this.surface.svg;
        if (!svg || !svg.layers || !(svg.rois || svg.sulci)) {
          if (tries > OVERLAY_RETRY_MAX) return;
          setTimeout(() => trySetOverlays(tries + 1), OVERLAY_RETRY_MS);
          return;
        }
        if (svg.rois) {
          svg.rois.showhide(false);
          if (svg.rois.labels) svg.rois.labels.showhide(false);
        }
        if (svg.sulci) svg.sulci.showhide(true);
        this.requestRender();
      };
      trySetOverlays(0);
      COLLAPSE_SCHEDULE_MS.forEach((ms) => setTimeout(() => this.collapseControlPanel(false), ms));
      const t0 = Date.now();
      if (this.viewer.addEventListener)
        this.viewer.addEventListener("setData", () => {
          if (Date.now() - t0 < COLLAPSE_WINDOW_MS) this.collapseControlPanel(false);
        });
    }
    // Rebuild posdata from hemi attributes if the picker's isn't available (mirrors pycortex).
    _buildPosdata() {
      const pd = {};
      for (const h of HEMIS) {
        const a = this.surface.hemis[h].attributes;
        const positions = [a.position], normals = [a.normal];
        let i = 0;
        while (a["mixSurfs" + i]) {
          positions.push(a["mixSurfs" + i]);
          normals.push(a["mixNorms" + i]);
          i++;
        }
        pd[h] = { positions, normals, map: this.surface.hemis[h].indexMap };
        if (a.wm) {
          pd[h].wm = a.wm;
          pd[h].wmnorm = a.wmnorm;
        }
      }
      return pd;
    }
  };

  // core/roi-model.js
  var FORMAT = "pycortex-roidraw/vertexset-v2";
  var PALETTE = ["#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c"];
  var ROISet = class {
    constructor() {
      this.rois = [];
      this.nextId = 1;
    }
    get length() {
      return this.rois.length;
    }
    nextColor() {
      return PALETTE[(this.nextId - 1) % PALETTE.length];
    }
    add({ name, color, left, right, outline = null, labelVert = null, bezier = null }) {
      const roi = {
        id: this.nextId++,
        name,
        color: color || this.nextColor(),
        left,
        right,
        outline,
        labelVert,
        bezier
      };
      this.rois.push(roi);
      return roi;
    }
    remove(id) {
      this.rois = this.rois.filter((r) => r.id !== id);
    }
    clear() {
      this.rois = [];
    }
    toJSON(surfaceId) {
      return {
        format: FORMAT,
        generated: (/* @__PURE__ */ new Date()).toISOString(),
        surface: surfaceId || null,
        note: "Per-hemisphere subject vertex indices + an ordered boundary ring (outline) + an editable flat-UV bezier. Portable to any viewer built on the same surface.",
        rois: this.rois.map((r) => ({
          name: r.name,
          color: r.color,
          counts: { left: r.left.length, right: r.right.length },
          vertices: { left: r.left, right: r.right },
          outline: r.outline || null,
          labelVert: r.labelVert || null,
          bezier: r.bezier || null
        }))
      };
    }
    /* Append ROIs from a parsed document. Returns the ROIs added. Throws on an unknown format. */
    loadJSON(doc) {
      if (!doc || !doc.format || doc.format.indexOf("pycortex-roidraw") !== 0)
        throw new Error("unrecognized format: " + (doc && doc.format));
      const added = [];
      for (const r of doc.rois || []) {
        const v = r.vertices || {};
        const roi = this.add({
          name: r.name || "roi" + this.nextId,
          color: r.color,
          left: v.left || [],
          right: v.right || [],
          outline: r.outline || null,
          labelVert: r.labelVert || null,
          bezier: r.bezier || null
        });
        if (!roi.labelVert && roi.outline && roi.outline.length)
          roi.labelVert = roi.outline[Math.floor(roi.outline.length / 2)];
        added.push(roi);
      }
      return added;
    }
  };

  // core/selection.js
  function selectInPolygon(projected, lasso) {
    const bounds = polygonBounds(lasso);
    const out = { left: [], right: [], px: { left: [], right: [] }, total: 0 };
    for (const h of ["left", "right"]) {
      const p = projected[h];
      if (!p) continue;
      const idx = p.idx, px = p.px;
      for (let k = 0; k < px.length; k++) {
        const pt = px[k];
        if (!inBounds(pt, bounds)) continue;
        if (pointInPolygon(pt, lasso)) {
          out[h].push(idx[k]);
          out.px[h].push(pt);
          out.total++;
        }
      }
    }
    return out;
  }

  // core/outline.js
  var DEFAULT_EPSILON = 4;
  function buildOutline(lasso, sel, { epsilon = DEFAULT_EPSILON } = {}) {
    let simp = simplifyRDP(lasso, epsilon);
    if (simp.length < 3) simp = lasso;
    const cand = [];
    for (const h of ["left", "right"]) {
      const ids = sel[h], pxs = sel.px[h];
      for (let k = 0; k < ids.length; k++) cand.push({ h, g: ids[k], x: pxs[k][0], y: pxs[k][1] });
    }
    if (!cand.length) return null;
    const ring = [];
    let prev = null;
    for (let i = 0; i < simp.length; i++) {
      const lx = simp[i][0], ly = simp[i][1];
      let best = null, bd = Infinity;
      for (let j = 0; j < cand.length; j++) {
        const dx = cand[j].x - lx, dy = cand[j].y - ly, d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = cand[j];
        }
      }
      if (best && (!prev || prev.h !== best.h || prev.g !== best.g)) {
        ring.push({ h: best.h, g: best.g });
        prev = best;
      }
    }
    if (ring.length > 2 && ring[0].h === ring[ring.length - 1].h && ring[0].g === ring[ring.length - 1].g) ring.pop();
    return ring.length >= 3 ? ring : null;
  }
  function pickLabelVertex(sel) {
    let cx = 0, cy = 0, n = 0;
    for (const h of ["left", "right"]) for (const p of sel.px[h]) {
      cx += p[0];
      cy += p[1];
      n++;
    }
    if (!n) return null;
    cx /= n;
    cy /= n;
    let best = null, bd = Infinity;
    for (const h of ["left", "right"]) {
      const ids = sel[h], pxs = sel.px[h];
      for (let k = 0; k < ids.length; k++) {
        const dx = pxs[k][0] - cx, dy = pxs[k][1] - cy, d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = { h, g: ids[k] };
        }
      }
    }
    return best;
  }

  // core/bezier.js
  var DEFAULT_EPSILON2 = 4e-3;
  function catmullRomHandles(anchors) {
    const n = anchors.length;
    const inHandles = new Array(n), outHandles = new Array(n);
    for (let i = 0; i < n; i++) {
      const prev = anchors[(i - 1 + n) % n], next = anchors[(i + 1) % n], a = anchors[i];
      const tx = (next[0] - prev[0]) / 6, ty = (next[1] - prev[1]) / 6;
      outHandles[i] = [a[0] + tx, a[1] + ty];
      inHandles[i] = [a[0] - tx, a[1] - ty];
    }
    return { inHandles, outHandles };
  }
  function bezierFromAnchors(anchors) {
    const a = anchors.map((p) => [p[0], p[1]]);
    const { inHandles, outHandles } = catmullRomHandles(a);
    return { closed: true, anchors: a, inHandles, outHandles, smooth: a.map(() => true) };
  }
  function rotateToExtreme(pts) {
    const c = centroid(pts);
    if (!c) return pts;
    let bi = 0, bd = -1;
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i][0] - c[0], dy = pts[i][1] - c[1], d = dx * dx + dy * dy;
      if (d > bd) {
        bd = d;
        bi = i;
      }
    }
    return bi === 0 ? pts : pts.slice(bi).concat(pts.slice(0, bi));
  }
  function fitClosedBezier(ring, { epsilon = DEFAULT_EPSILON2 } = {}) {
    if (!ring || ring.length < 3) return null;
    let pts = ring.slice();
    const f = pts[0], l = pts[pts.length - 1];
    if (pts.length > 3 && f[0] === l[0] && f[1] === l[1]) pts.pop();
    pts = rotateToExtreme(pts);
    let anchors = simplifyRDP(pts, epsilon);
    if (anchors.length < 3) anchors = pts;
    if (anchors.length > 3) {
      const a0 = anchors[0], aN = anchors[anchors.length - 1];
      if (a0[0] === aN[0] && a0[1] === aN[1]) anchors.pop();
    }
    if (anchors.length < 3) return null;
    return bezierFromAnchors(anchors);
  }
  function cubicAt(p0, c1, c2, p3, t) {
    const mt = 1 - t, a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
    return [
      a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
      a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1]
    ];
  }
  function evalClosedBezier(bez, samplesPerSeg = 12) {
    if (!bez || !bez.anchors || bez.anchors.length < 3) return [];
    const { anchors, inHandles, outHandles } = bez;
    const n = anchors.length, out = [];
    const steps = Math.max(1, samplesPerSeg | 0);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const p0 = anchors[i], c1 = outHandles[i], c2 = inHandles[j], p3 = anchors[j];
      for (let s = 0; s < steps; s++) out.push(cubicAt(p0, c1, c2, p3, s / steps));
    }
    return out;
  }
  var sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  var add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  var lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  var len = (v) => Math.hypot(v[0], v[1]);
  function cloneBezier(bez) {
    const n = bez.anchors.length;
    return {
      closed: bez.closed !== false,
      anchors: bez.anchors.map((p) => [p[0], p[1]]),
      inHandles: bez.inHandles.map((p) => [p[0], p[1]]),
      outHandles: bez.outHandles.map((p) => [p[0], p[1]]),
      smooth: bez.smooth ? bez.smooth.slice(0, n) : bez.anchors.map(() => true)
    };
  }
  function moveAnchor(bez, i, pos) {
    const b = cloneBezier(bez);
    const d = sub(pos, b.anchors[i]);
    b.anchors[i] = [pos[0], pos[1]];
    b.outHandles[i] = add(b.outHandles[i], d);
    b.inHandles[i] = add(b.inHandles[i], d);
    return b;
  }
  function moveHandle(bez, i, which, pos) {
    const b = cloneBezier(bez);
    const a = b.anchors[i];
    const here = which === "in" ? b.inHandles : b.outHandles;
    const other = which === "in" ? b.outHandles : b.inHandles;
    here[i] = [pos[0], pos[1]];
    if (b.smooth[i]) other[i] = [2 * a[0] - pos[0], 2 * a[1] - pos[1]];
    return b;
  }
  function setAnchorSmooth(bez, i, smooth) {
    const b = cloneBezier(bez);
    b.smooth[i] = !!smooth;
    if (!smooth) return b;
    const n = b.anchors.length;
    const a = b.anchors[i], prev = b.anchors[(i - 1 + n) % n], next = b.anchors[(i + 1) % n];
    let dir = sub(next, prev);
    let dl = len(dir);
    if (dl < 1e-9) {
      dir = sub(b.outHandles[i], a);
      dl = len(dir);
    }
    if (dl < 1e-9) {
      dir = [1, 0];
      dl = 1;
    }
    dir = [dir[0] / dl, dir[1] / dl];
    let r = (len(sub(b.outHandles[i], a)) + len(sub(b.inHandles[i], a))) / 2;
    if (r < 1e-9) r = dl / 6;
    b.outHandles[i] = [a[0] + dir[0] * r, a[1] + dir[1] * r];
    b.inHandles[i] = [a[0] - dir[0] * r, a[1] - dir[1] * r];
    return b;
  }
  function splitSegment(bez, seg, t) {
    const b = cloneBezier(bez);
    const n = b.anchors.length;
    const j = (seg + 1) % n;
    const p0 = b.anchors[seg], p1 = b.outHandles[seg], p2 = b.inHandles[j], p3 = b.anchors[j];
    const ab = lerp(p0, p1, t), bc = lerp(p1, p2, t), cd = lerp(p2, p3, t);
    const abc = lerp(ab, bc, t), bcd = lerp(bc, cd, t);
    const mid = lerp(abc, bcd, t);
    b.outHandles[seg] = ab;
    b.inHandles[j] = cd;
    b.anchors.splice(seg + 1, 0, mid);
    b.inHandles.splice(seg + 1, 0, abc);
    b.outHandles.splice(seg + 1, 0, bcd);
    b.smooth.splice(seg + 1, 0, true);
    return b;
  }
  function deleteAnchor(bez, i) {
    if (bez.anchors.length <= 3) return bez;
    const b = cloneBezier(bez);
    b.anchors.splice(i, 1);
    b.inHandles.splice(i, 1);
    b.outHandles.splice(i, 1);
    b.smooth.splice(i, 1);
    return b;
  }
  function nearestOnClosedBezier(bez, pt, samplesPerSeg = 24) {
    if (!bez || !bez.anchors || bez.anchors.length < 3) return null;
    const { anchors, inHandles, outHandles } = bez;
    const n = anchors.length, steps = Math.max(2, samplesPerSeg | 0);
    let best = null;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const p0 = anchors[i], c1 = outHandles[i], c2 = inHandles[j], p3 = anchors[j];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, q = cubicAt(p0, c1, c2, p3, t);
        const dx = q[0] - pt[0], dy = q[1] - pt[1], d = dx * dx + dy * dy;
        if (!best || d < best.d2) best = { seg: i, t, point: q, d2: d };
      }
    }
    return best ? { seg: best.seg, t: best.t, point: best.point, dist: Math.sqrt(best.d2) } : null;
  }

  // ui/lasso-overlay.js
  var DRAG_THRESHOLD = 4;
  var LassoOverlay = class {
    constructor(adapter, { onLasso, onInspect } = {}) {
      this.adapter = adapter;
      this.onLasso = onLasso || (() => {
      });
      this.onInspect = onInspect || (() => {
      });
      this.active = false;
      this.passthrough = false;
      this.drawing = false;
      this.lasso = [];
      this._gesture = "none";
      this._downPt = null;
      this._panLast = null;
      this._moved = false;
      const el = document.createElement("canvas");
      el.className = "roidraw-overlay";
      document.body.appendChild(el);
      this.el = el;
      this.ctx = el.getContext("2d");
      this._onResize = () => this.syncRect();
      window.addEventListener("resize", this._onResize);
      el.addEventListener("mousedown", (e) => this._onDown(e));
      el.addEventListener("mousemove", (e) => this._onMove(e));
      el.addEventListener("mouseup", (e) => this._onUp(e));
      el.addEventListener("mouseleave", (e) => {
        if (this._gesture !== "none") this._onUp(e);
      });
      el.addEventListener("wheel", (e) => this._onWheel(e), { passive: false });
      this.syncRect();
      setTimeout(() => this.syncRect(), 800);
    }
    syncRect() {
      const r = this.adapter.canvas().getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      this.el.style.left = Math.round(r.left) + "px";
      this.el.style.top = Math.round(r.top) + "px";
      this.el.style.width = w + "px";
      this.el.style.height = h + "px";
      this.el.width = w;
      this.el.height = h;
      this._redraw();
    }
    setActive(on) {
      this.active = on;
      this.passthrough = false;
      this._gesture = "none";
      this.el.style.pointerEvents = on ? "auto" : "none";
      if (on) this.syncRect();
      else this._cancel();
      this._applyMode();
    }
    // Shift held: a drag pans the surface (so you can zoom/pan in to draw fine detail), and a
    // click (no drag) inspects the voxel underneath. Plain drag (no Shift) is the lasso.
    setPassthrough(on) {
      if (!this.active || this._gesture !== "none" || on === this.passthrough) return;
      this.passthrough = on;
      this._applyMode();
    }
    _applyMode() {
      const nav = this.active && this.passthrough;
      this.el.classList.toggle("roidraw-overlay--active", this.active && !nav);
      this.el.classList.toggle("roidraw-overlay--inspect", nav);
      this.el.style.cursor = nav ? "grab" : this.active ? "crosshair" : "default";
    }
    _evtPt(e) {
      const r = this.el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    _onDown(e) {
      if (!this.active) return;
      e.preventDefault();
      this._downPt = this._evtPt(e);
      if (this.passthrough) {
        this._gesture = "shift";
        this._panLast = this._downPt;
        this._moved = false;
      } else {
        this._gesture = "lasso";
        this.drawing = true;
        this.lasso = [this._downPt];
      }
    }
    _onMove(e) {
      if (this._gesture === "shift") {
        const p = this._evtPt(e);
        if (!this._moved && (Math.abs(p[0] - this._downPt[0]) > DRAG_THRESHOLD || Math.abs(p[1] - this._downPt[1]) > DRAG_THRESHOLD)) {
          this._moved = true;
          this.el.style.cursor = "grabbing";
        }
        if (this._moved) {
          this.adapter.pan(p[0] - this._panLast[0], p[1] - this._panLast[1]);
          this._panLast = p;
        }
        return;
      }
      if (this._gesture !== "lasso") return;
      e.preventDefault();
      this.lasso.push(this._evtPt(e));
      this._redraw();
    }
    _onUp(e) {
      const g = this._gesture;
      this._gesture = "none";
      if (g === "shift") {
        if (!this._moved) {
          const p = this._evtPt(e);
          this.onInspect(p[0], p[1]);
        }
        this._applyMode();
        return;
      }
      if (g !== "lasso") return;
      this.drawing = false;
      const pts = this.lasso;
      this.lasso = [];
      this._redraw();
      if (pts.length >= 3) this.onLasso(pts);
    }
    _onWheel(e) {
      if (!this.active) return;
      e.preventDefault();
      this.adapter.zoom(e.deltaY);
    }
    _cancel() {
      this.drawing = false;
      this._gesture = "none";
      this.lasso = [];
      this._redraw();
    }
    cancel() {
      this._cancel();
    }
    _redraw() {
      const ctx = this.ctx;
      if (!ctx) return;
      ctx.clearRect(0, 0, this.el.width, this.el.height);
      if (this.lasso.length > 1) {
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.lasso[0][0], this.lasso[0][1]);
        for (let j = 1; j < this.lasso.length; j++) ctx.lineTo(this.lasso[j][0], this.lasso[j][1]);
        ctx.stroke();
      }
    }
    destroy() {
      window.removeEventListener("resize", this._onResize);
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  };

  // core/transform.js
  function solve(A, b) {
    const n = b.length;
    const M = A.map((row, i) => row.concat(b[i]));
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
      if (Math.abs(M[piv][col]) < 1e-12) return null;
      const tmp = M[col];
      M[col] = M[piv];
      M[piv] = tmp;
      const pv = M[col][col];
      for (let j = col; j <= n; j++) M[col][j] /= pv;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const f = M[r][col];
        if (f === 0) continue;
        for (let j = col; j <= n; j++) M[r][j] -= f * M[col][j];
      }
    }
    return M.map((row) => row[n]);
  }
  function spans2D(pts) {
    const n = pts.length;
    if (n < 4) return false;
    let cx = 0, cy = 0;
    for (let i = 0; i < n; i++) {
      cx += pts[i][0];
      cy += pts[i][1];
    }
    cx /= n;
    cy /= n;
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = pts[i][0] - cx, dy = pts[i][1] - cy;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    const mean = (sxx + syy) / 2, half = (sxx - syy) / 2;
    const d = Math.sqrt(half * half + sxy * sxy);
    const l1 = mean + d, l2 = mean - d;
    return l1 > 0 && l2 >= l1 * 1e-6;
  }
  function fitHomography(src, dst) {
    const n = Math.min(src.length, dst.length);
    if (n < 4 || !spans2D(src)) return null;
    const ATA = Array.from({ length: 8 }, () => new Array(8).fill(0));
    const ATb = new Array(8).fill(0);
    const row = new Array(8);
    const accum = (r, rhs) => {
      for (let i = 0; i < 8; i++) {
        ATb[i] += r[i] * rhs;
        for (let j = 0; j < 8; j++) ATA[i][j] += r[i] * r[j];
      }
    };
    for (let k = 0; k < n; k++) {
      const x = src[k][0], y = src[k][1], u = dst[k][0], v = dst[k][1];
      row[0] = x;
      row[1] = y;
      row[2] = 1;
      row[3] = 0;
      row[4] = 0;
      row[5] = 0;
      row[6] = -x * u;
      row[7] = -y * u;
      accum(row, u);
      row[0] = 0;
      row[1] = 0;
      row[2] = 0;
      row[3] = x;
      row[4] = y;
      row[5] = 1;
      row[6] = -x * v;
      row[7] = -y * v;
      accum(row, v);
    }
    const h = solve(ATA, ATb);
    if (!h) return null;
    const H = [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
    for (let i = 0; i < 9; i++) if (!isFinite(H[i])) return null;
    return H;
  }
  function applyHomography(H, pt) {
    const x = pt[0], y = pt[1];
    let w = H[6] * x + H[7] * y + H[8];
    if (!isFinite(w) || Math.abs(w) < 1e-12) w = w < 0 ? -1e-12 : 1e-12;
    return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
  }
  function invertHomography(H) {
    const a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7], i = H[8];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-12) return null;
    const id = 1 / det;
    return [
      A * id,
      (c * h - b * i) * id,
      (b * f - c * e) * id,
      B * id,
      (a * i - c * g) * id,
      (c * d - a * f) * id,
      C * id,
      (b * g - a * h) * id,
      (a * e - b * d) * id
    ];
  }

  // ui/bezier-edit-overlay.js
  var HIT_RADIUS = 9;
  var HANDLE_RADIUS = 8;
  var CURVE_HIT = 7;
  var DRAG_SLOP = 1.5;
  var TRACK_MS = 500;
  var LOCAL_MARGIN = 0.06;
  var CURVE_SAMPLES = 40;
  var BezierEditOverlay = class {
    constructor(adapter, { onEdit } = {}) {
      this.adapter = adapter;
      this.onEdit = onEdit || (() => {
      });
      this.roi = null;
      this.bez = null;
      this._uvPoly = null;
      this.H = null;
      this.Hinv = null;
      this._anchorPx = [];
      this._handlePx = null;
      this._sel = -1;
      this._drag = null;
      this._dragMoved = false;
      this._downPt = null;
      this._hover = null;
      this._panLast = null;
      this._panMoved = false;
      this._raf = 0;
      this._trackUntil = 0;
      const el = document.createElement("canvas");
      el.className = "roidraw-overlay roidraw-edit-overlay";
      document.body.appendChild(el);
      this.el = el;
      this.ctx = el.getContext("2d");
      this._onResize = () => this.reproject();
      window.addEventListener("resize", this._onResize);
      this._onKey = (e) => this._onKeyDown(e);
      window.addEventListener("keydown", this._onKey);
      el.addEventListener("mousedown", (e) => this._onDown(e));
      el.addEventListener("mousemove", (e) => this._onMove(e));
      el.addEventListener("mouseup", (e) => this._onUp(e));
      el.addEventListener("mouseleave", (e) => {
        if (this._drag || this._panLast) this._onUp(e);
      });
      el.addEventListener("dblclick", (e) => this._onDblClick(e));
      el.addEventListener("wheel", (e) => this._onWheel(e), { passive: false });
    }
    syncRect() {
      const r = this.adapter.canvas().getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      this.el.style.left = Math.round(r.left) + "px";
      this.el.style.top = Math.round(r.top) + "px";
      this.el.style.width = w + "px";
      this.el.style.height = h + "px";
      if (this.el.width !== w || this.el.height !== h) {
        this.el.width = w;
        this.el.height = h;
      }
    }
    // Begin editing `roi` (must have a bezier), or pass null to stop.
    setEditing(roi) {
      this.roi = roi && roi.bezier && roi.bezier.anchors ? roi : null;
      this.bez = this.roi ? cloneBezier(this.roi.bezier) : null;
      this._sel = -1;
      this._recurve();
      this._drag = null;
      this._dragMoved = false;
      this._hover = null;
      this._panLast = null;
      this.el.style.pointerEvents = this.roi ? "auto" : "none";
      this.el.classList.toggle("roidraw-edit-overlay--active", !!this.roi);
      if (this.roi) {
        this.syncRect();
        this.reproject();
      } else {
        this._stopTracking();
        this._clear();
      }
    }
    isEditing() {
      return !!this.roi;
    }
    // Re-sample the bezier to a uv polyline. Only the curve changes (on an edit), never the view —
    // so caching this lets the per-frame tracking loop just re-map it through the new homography
    // instead of rebuilding + re-sampling the curve every frame.
    _recurve() {
      this._uvPoly = this.bez && this.bez.anchors.length >= 3 ? evalClosedBezier(this.bez, CURVE_SAMPLES) : null;
    }
    // The viewer applies a camera change on its NEXT render frame, so reprojecting synchronously in
    // a wheel/pan handler reads a stale camera (knots lag the surface by a frame, and a damped zoom
    // keeps gliding for several). Instead, re-track on rAF for a short window after the gesture, so
    // the knots follow the surface every frame until the camera settles.
    _pokeTracking() {
      this._trackUntil = (typeof performance !== "undefined" ? performance.now() : Date.now()) + TRACK_MS;
      if (!this._raf) this._raf = requestAnimationFrame(() => this._trackFrame());
    }
    _trackFrame() {
      this._raf = 0;
      if (!this.roi) return;
      this.reproject();
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now < this._trackUntil) this._raf = requestAnimationFrame(() => this._trackFrame());
    }
    _stopTracking() {
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
      }
      this._trackUntil = 0;
    }
    // Re-fit the uv->px homography for the current view and redraw. Call on pan/zoom/mix/resize.
    // The fit is LOCAL to the ROI: the flatmap isn't perfectly planar, so one global homography
    // drifts (the curve sits slightly inside the baked outline), but around a single ROI it's
    // near-exact. Falls back to the whole flatmap only if the local region is too sparse on screen.
    reproject() {
      if (!this.bez || this.bez.anchors.length < 3) {
        this._clear();
        return;
      }
      this.syncRect();
      let c = this._correspondences(this._anchorUvBounds(LOCAL_MARGIN));
      if (c.src.length < 6 && !this.H) c = this._correspondences(null);
      if (c.src.length >= 4) {
        const H = fitHomography(c.src, c.dst);
        if (H) {
          this.H = H;
          this.Hinv = invertHomography(H);
        }
      }
      this._redraw();
    }
    // uv->px correspondences from the vertices inside `bounds` (or the whole flatmap if null).
    _correspondences(bounds) {
      const b = bounds || { minu: -Infinity, maxu: Infinity, minv: -Infinity, maxv: Infinity };
      const proj = this.adapter.projectVerticesInUvBounds(b);
      const src = [], dst = [];
      for (const h of ["left", "right"]) {
        const p = proj[h];
        if (!p) continue;
        for (let i = 0; i < p.uv.length; i++) {
          src.push(p.uv[i]);
          dst.push(p.px[i]);
        }
      }
      return { src, dst };
    }
    // uv bounding box of the current anchors, padded by `m`.
    _anchorUvBounds(m) {
      let minu = Infinity, maxu = -Infinity, minv = Infinity, maxv = -Infinity;
      for (const a of this.bez.anchors) {
        if (a[0] < minu) minu = a[0];
        if (a[0] > maxu) maxu = a[0];
        if (a[1] < minv) minv = a[1];
        if (a[1] > maxv) maxv = a[1];
      }
      return { minu: minu - m, maxu: maxu + m, minv: minv - m, maxv: maxv + m };
    }
    _evtPt(e) {
      const r = this.el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    // Hit-test a point against the editable bits, nearest first: the selected anchor's two handles
    // (they sit on top), then any anchor. Returns { kind:"handle"|"anchor", i, which? } or null.
    _hitTest(pt) {
      if (this._sel >= 0 && this._handlePx) {
        for (const which of ["out", "in"]) {
          const hp = this._handlePx[which];
          if (hp) {
            const dx = hp[0] - pt[0], dy = hp[1] - pt[1];
            if (dx * dx + dy * dy <= HANDLE_RADIUS * HANDLE_RADIUS) return { kind: "handle", i: this._sel, which };
          }
        }
      }
      let best = -1, bd = HIT_RADIUS * HIT_RADIUS;
      for (let i = 0; i < this._anchorPx.length; i++) {
        const a = this._anchorPx[i];
        const dx = a[0] - pt[0], dy = a[1] - pt[1], d = dx * dx + dy * dy;
        if (d <= bd) {
          bd = d;
          best = i;
        }
      }
      return best >= 0 ? { kind: "anchor", i: best } : null;
    }
    // Is `pt` (px) close to the curve? Map it to uv, find the nearest curve point, map that back to
    // px and compare in px. Returns { seg, t } for a split, or null.
    _hitCurve(pt) {
      if (!this.Hinv || !this.H) return null;
      const uv = applyHomography(this.Hinv, pt);
      const hit = nearestOnClosedBezier(this.bez, uv, 24);
      if (!hit) return null;
      const px = applyHomography(this.H, hit.point);
      const dx = px[0] - pt[0], dy = px[1] - pt[1];
      return dx * dx + dy * dy <= CURVE_HIT * CURVE_HIT ? { seg: hit.seg, t: hit.t } : null;
    }
    _onDown(e) {
      if (!this.roi || !this.Hinv) return;
      e.preventDefault();
      const pt = this._evtPt(e);
      const hit = e.shiftKey ? null : this._hitTest(pt);
      if (hit) {
        if (hit.kind === "anchor") this._select(hit.i);
        this._drag = hit;
        this._dragMoved = false;
        this._downPt = pt;
        this.el.style.cursor = "grabbing";
      } else {
        this._panLast = pt;
        this._panMoved = false;
      }
    }
    _onMove(e) {
      const pt = this._evtPt(e);
      if (this._drag) {
        e.preventDefault();
        if (!this._dragMoved) {
          const dx = pt[0] - this._downPt[0], dy = pt[1] - this._downPt[1];
          if (dx * dx + dy * dy <= DRAG_SLOP * DRAG_SLOP) return;
          this._dragMoved = true;
        }
        const uv = applyHomography(this.Hinv, pt);
        this.bez = this._drag.kind === "handle" ? moveHandle(this.bez, this._drag.i, this._drag.which, uv) : moveAnchor(this.bez, this._drag.i, uv);
        this._recurve();
        this._redraw();
        return;
      }
      if (this._panLast) {
        const dx = pt[0] - this._panLast[0], dy = pt[1] - this._panLast[1];
        if (dx || dy) this._panMoved = true;
        this.adapter.pan(dx, dy);
        this._panLast = pt;
        this._pokeTracking();
        return;
      }
      const hov = this._hitTest(pt);
      const key = (t) => t ? t.kind + t.i + (t.which || "") : "";
      if (key(hov) !== key(this._hover)) {
        this._hover = hov;
        this.el.style.cursor = hov ? "grab" : "default";
        this._redraw();
      }
    }
    _onUp() {
      if (this._drag) {
        const moved = this._dragMoved;
        this._drag = null;
        this.el.style.cursor = this._hover ? "grab" : "default";
        if (moved) {
          this._commit();
          this.reproject();
        } else this._redraw();
        return;
      }
      if (this._panLast) {
        const wasClick = !this._panMoved;
        this._panLast = null;
        if (wasClick && this._sel >= 0) {
          this._sel = -1;
          this._redraw();
        }
      }
    }
    _onDblClick(e) {
      if (!this.roi || !this.Hinv) return;
      e.preventDefault();
      const pt = this._evtPt(e);
      const anchor = this._hitTestAnchorOnly(pt);
      if (anchor >= 0) {
        this.bez = setAnchorSmooth(this.bez, anchor, !this.bez.smooth[anchor]);
        this._select(anchor);
        this._recurve();
        this._commit();
        this.reproject();
        return;
      }
      const c = this._hitCurve(pt);
      if (c) {
        this.bez = splitSegment(this.bez, c.seg, c.t);
        this._select(c.seg + 1);
        this._recurve();
        this._commit();
        this.reproject();
      }
    }
    _hitTestAnchorOnly(pt) {
      let best = -1, bd = HIT_RADIUS * HIT_RADIUS;
      for (let i = 0; i < this._anchorPx.length; i++) {
        const a = this._anchorPx[i];
        const dx = a[0] - pt[0], dy = a[1] - pt[1], d = dx * dx + dy * dy;
        if (d <= bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    }
    _onKeyDown(e) {
      if (!this.roi || this._sel < 0) return;
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const t = e.target, tag = t && t.tagName;
      if (t && (t.isContentEditable || tag === "TEXTAREA" || tag === "INPUT")) return;
      e.preventDefault();
      const before = this.bez.anchors.length;
      this.bez = deleteAnchor(this.bez, this._sel);
      if (this.bez.anchors.length === before) return;
      this._sel = -1;
      this._recurve();
      this._commit();
      this.reproject();
    }
    _onWheel(e) {
      if (!this.roi) return;
      e.preventDefault();
      this.adapter.zoom(e.deltaY);
      this._pokeTracking();
    }
    _select(i) {
      this._sel = i;
    }
    // push the working curve to the host (re-derives membership + re-bakes the white outline)
    _commit() {
      this.onEdit(cloneBezier(this.bez));
    }
    _clear() {
      if (this.ctx) this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    }
    _redraw() {
      const ctx = this.ctx;
      if (!ctx) return;
      this._clear();
      if (!this.roi || !this.H || !this._uvPoly) return;
      const toPx = (uv) => applyHomography(this.H, uv);
      const poly = this._uvPoly.map(toPx);
      ctx.strokeStyle = "#39d0ff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
      ctx.closePath();
      ctx.stroke();
      this._anchorPx = this.bez.anchors.map(toPx);
      this._handlePx = null;
      if (this._sel >= 0 && this._sel < this._anchorPx.length) {
        const a = this._anchorPx[this._sel];
        const out = toPx(this.bez.outHandles[this._sel]);
        const inp = toPx(this.bez.inHandles[this._sel]);
        this._handlePx = { out, in: inp };
        ctx.strokeStyle = "#9fe8ff";
        ctx.lineWidth = 1;
        for (const hp of [out, inp]) {
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(hp[0], hp[1]);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(hp[0], hp[1], 4, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#1f7fa0";
          ctx.stroke();
          ctx.strokeStyle = "#9fe8ff";
          ctx.lineWidth = 1;
        }
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0a3a4a";
      const hoverI = this._hover && this._hover.kind === "anchor" ? this._hover.i : -1;
      for (let i = 0; i < this._anchorPx.length; i++) {
        const a = this._anchorPx[i];
        const big = i === this._sel || i === hoverI;
        const r = big ? 6 : 4;
        ctx.fillStyle = i === this._sel ? "#fff" : "#39d0ff";
        ctx.beginPath();
        if (this.bez.smooth[i]) ctx.arc(a[0], a[1], r, 0, Math.PI * 2);
        else ctx.rect(a[0] - r, a[1] - r, r * 2, r * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    destroy() {
      this._stopTracking();
      window.removeEventListener("resize", this._onResize);
      window.removeEventListener("keydown", this._onKey);
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  };

  // ui/draw-panel.js
  var DrawPanel = class {
    constructor({ onExport, onImport, onClear, onRemove, onEdit } = {}) {
      this.onRemove = onRemove || (() => {
      });
      this.onEdit = onEdit || (() => {
      });
      this._editingId = null;
      const el = document.createElement("div");
      el.className = "roidraw-panel";
      const h = document.createElement("h2");
      h.textContent = "ROI draw";
      el.appendChild(h);
      this.statusEl = document.createElement("div");
      this.statusEl.className = "roidraw-status";
      el.appendChild(this.statusEl);
      this.doneEl = document.createElement("button");
      this.doneEl.className = "roidraw-done";
      this.doneEl.textContent = "\u2713 Done editing";
      this.doneEl.style.display = "none";
      this.doneEl.onclick = () => this.onEdit(null);
      el.appendChild(this.doneEl);
      this.listEl = document.createElement("div");
      this.listEl.className = "roidraw-list";
      el.appendChild(this.listEl);
      const exp = document.createElement("button");
      exp.textContent = "Export JSON";
      exp.onclick = () => onExport && onExport();
      el.appendChild(exp);
      const lab = document.createElement("label");
      lab.textContent = "Import: ";
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "application/json";
      inp.onchange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f && onImport) onImport(f);
        e.target.value = "";
        e.target.blur();
      };
      lab.appendChild(inp);
      el.appendChild(lab);
      const clr = document.createElement("button");
      clr.textContent = "Clear all";
      clr.onclick = () => onClear && onClear();
      el.appendChild(clr);
      this.msgEl = document.createElement("div");
      this.msgEl.className = "roidraw-msg";
      el.appendChild(this.msgEl);
      document.body.appendChild(el);
      this.el = el;
      this.renderList([]);
    }
    // The id of the ROI currently being edited (highlighted + its Edit link reads "done"), or null.
    setEditingId(id) {
      this._editingId = id;
    }
    setStatus(text, kind = "ok") {
      this.statusEl.textContent = text;
      this.statusEl.className = "roidraw-status roidraw-status--" + kind;
    }
    message(text) {
      this.msgEl.textContent = text;
    }
    setVisible(on) {
      this.el.style.display = on ? "" : "none";
    }
    renderList(rois) {
      const ed = rois.find((r) => r.id === this._editingId);
      this.doneEl.style.display = ed ? "" : "none";
      if (ed) this.doneEl.textContent = "\u2713 Done editing \u201C" + ed.name + "\u201D";
      const list = this.listEl;
      list.textContent = "";
      if (!rois.length) {
        const e = document.createElement("span");
        e.className = "roidraw-list__empty";
        e.textContent = "no ROIs yet";
        list.appendChild(e);
        return;
      }
      for (const r of rois) {
        const editing = r.id === this._editingId;
        const row = document.createElement("div");
        row.className = "roidraw-roi" + (editing ? " roidraw-roi--editing" : "");
        const sw = document.createElement("span");
        sw.className = "roidraw-roi__swatch";
        sw.style.background = r.color;
        row.appendChild(sw);
        const nm = document.createElement("span");
        nm.className = "roidraw-roi__name";
        nm.textContent = r.name;
        row.appendChild(nm);
        const ct = document.createElement("span");
        ct.className = "roidraw-roi__count";
        ct.textContent = String(r.left.length + r.right.length);
        row.appendChild(ct);
        const edit = document.createElement("button");
        edit.className = "roidraw-roi__editbtn" + (editing ? " roidraw-roi__editbtn--on" : "");
        edit.textContent = editing ? "editing" : "\u270E edit";
        edit.title = r.bezier ? editing ? "finish editing" : "edit shape" : "no editable curve";
        edit.disabled = !r.bezier;
        edit.onclick = (e) => {
          e.preventDefault();
          if (r.bezier) this.onEdit(editing ? null : r.id);
        };
        row.appendChild(edit);
        const del = document.createElement("a");
        del.className = "roidraw-roi__del";
        del.textContent = "\u2715";
        del.title = "remove";
        del.onclick = (e) => {
          e.preventDefault();
          this.onRemove(r.id);
        };
        row.appendChild(del);
        list.appendChild(row);
      }
    }
  };

  // ui/mode-toggle.js
  var ModeToggle = class {
    constructor({ onMode } = {}) {
      const bar = document.createElement("div");
      bar.className = "roidraw-modebar";
      this.displayBtn = this._mkBtn("Display", "display", onMode);
      this.drawBtn = this._mkBtn("Draw", "draw", onMode);
      bar.appendChild(this.displayBtn);
      bar.appendChild(this.drawBtn);
      document.body.appendChild(bar);
      this.el = bar;
    }
    _mkBtn(label, mode, onMode) {
      const b = document.createElement("button");
      b.className = "roidraw-modebtn";
      b.textContent = label;
      b.onclick = () => onMode && onMode(mode);
      return b;
    }
    setMode(mode) {
      this.displayBtn.classList.toggle("roidraw-modebtn--active", mode === "display");
      this.drawBtn.classList.toggle("roidraw-modebtn--active", mode === "draw");
    }
    /* Sit just left of the host control panel (top-aligned); falls back to the CSS default. */
    position(rect) {
      if (rect && rect.width > 0) {
        this.el.style.right = Math.round(window.innerWidth - rect.left + 8) + "px";
        this.el.style.top = Math.round(rect.top) + "px";
      }
    }
  };

  // ui/roidraw.css
  var roidraw_default = '/* roidraw UI \u2014 class-based styles (no inline style strings in the JS). */\n\n.roidraw-overlay {\n    position: fixed;\n    left: 0;\n    top: 0;\n    pointer-events: none;          /* only captures in draw mode (.roidraw-overlay--active) */\n    z-index: 9998;\n    outline-offset: -2px;\n}\n.roidraw-overlay--active { cursor: crosshair; background: rgba(255, 204, 0, 0.05); outline: 2px dashed rgba(255, 204, 0, 0.8); }\n.roidraw-overlay--inspect { cursor: cell;  background: rgba(80, 160, 255, 0.06); outline: 2px dashed rgba(80, 160, 255, 0.85); }\n.roidraw-edit-overlay--active { outline: 2px dashed rgba(57, 208, 255, 0.85); }\n\n.roidraw-panel {\n    position: fixed;\n    right: 10px;\n    top: 8px;\n    z-index: 9999;\n    width: 230px;\n    padding: 10px;\n    background: rgba(20, 20, 20, 0.92);\n    color: #eee;\n    font: 12px/1.4 -apple-system, system-ui, sans-serif;\n    border: 1px solid #444;\n    border-radius: 6px;\n}\n.roidraw-panel h2 { font-size: 12px; font-weight: 700; margin: 0 0 6px; }\n.roidraw-panel button { width: 100%; margin-bottom: 6px; }\n.roidraw-panel input[type="file"] { width: 100%; }\n.roidraw-panel label { display: block; margin-bottom: 4px; }\n\n.roidraw-status { margin-bottom: 6px; }\n.roidraw-status--ok    { color: #9f9; }\n.roidraw-status--warn  { color: #f99; }\n.roidraw-status--draw  { color: #ffcc00; }\n.roidraw-status--inspect { color: #6cf; }\n\n.roidraw-list { margin-bottom: 6px; }\n.roidraw-list__empty { color: #777; }\n.roidraw-roi { display: flex; align-items: center; gap: 4px; margin: 2px 0; }\n.roidraw-roi__swatch { width: 10px; height: 10px; display: inline-block; border-radius: 2px; }\n.roidraw-roi__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.roidraw-roi__count { color: #999; }\n.roidraw-roi__editbtn {\n    width: auto;                   /* override .roidraw-panel button { width: 100% } */\n    margin: 0;\n    padding: 3px 9px;\n    font-size: 11px;\n    color: #cdeffb;\n    background: #18586e;\n    border: 1px solid #2c7d99;\n    border-radius: 4px;\n    cursor: pointer;\n}\n.roidraw-roi__editbtn:hover:not(:disabled) { background: #1e6f8a; }\n.roidraw-roi__editbtn--on { background: #1e9fd0; border-color: #4cc6f0; color: #04222e; font-weight: 700; }\n.roidraw-roi__editbtn:disabled { opacity: 0.4; cursor: default; }\n.roidraw-roi__del { color: #f77; text-decoration: none; cursor: pointer; }\n.roidraw-roi--editing { outline: 1px solid rgba(57, 208, 255, 0.6); border-radius: 3px; }\n\n.roidraw-done {\n    background: #1e9fd0;\n    color: #04222e;\n    font-weight: 700;\n    border: 0;\n    padding: 9px;\n    border-radius: 5px;\n}\n.roidraw-done:hover { background: #36b6e6; }\n\n.roidraw-msg { color: #9cf; font-size: 11px; max-height: 110px; overflow: auto; word-break: break-word; }\n\n.roidraw-modebar {\n    position: fixed;\n    right: 264px;                  /* refined to sit left of the control panel at runtime */\n    top: 8px;\n    z-index: 10001;\n    display: flex;\n    border-radius: 6px;\n    overflow: hidden;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);\n    font: 600 12px -apple-system, system-ui, sans-serif;\n}\n.roidraw-modebtn { border: 0; padding: 7px 16px; cursor: pointer; color: #eee; background: #333; }\n.roidraw-modebtn--active { background: #1a7f37; }\n';

  // index.js
  var LAYER = "drawnrois";
  var FILL_TARGET = 0.7;
  var FRAME_LERP = 0.3;
  var BEZIER_SAMPLES = 16;
  var OUTLINE_EPS_UV = 3e-3;
  function injectCss() {
    if (document.getElementById("roidraw-css")) return;
    const s = document.createElement("style");
    s.id = "roidraw-css";
    s.textContent = roidraw_default;
    document.head.appendChild(s);
  }
  var ROIDrawer = class {
    constructor(viewer, opts = {}) {
      injectCss();
      this.adapter = new PycortexAdapter(viewer, opts);
      this.rois = new ROISet();
      this.mode = "display";
      this.overlay = new LassoOverlay(this.adapter, {
        onLasso: (pts) => this._finishLasso(pts),
        onInspect: (x, y) => this.adapter.inspectAt(x, y)
      });
      this.editOverlay = new BezierEditOverlay(this.adapter, {
        onEdit: (bez) => this._applyEdit(bez)
      });
      this.editingId = null;
      this.panel = new DrawPanel({
        onExport: () => this.exportJSON(),
        onImport: (file) => this._import(file),
        onClear: () => this.clear(),
        onRemove: (id) => this.remove(id),
        onEdit: (id) => this._editToggle(id)
      });
      this.toggle = new ModeToggle({ onMode: (m) => this.setMode(m) });
      this._unsubMix = this.adapter.onMixChange(() => this._onMix());
      this._wireKeys();
      this.adapter.applyHostDefaults();
      this.adapter.collapseControlPanel(true);
      this._onResize = () => this._positionUI();
      window.addEventListener("resize", this._onResize);
      this.setMode("display");
      this._frameOnLoad(0);
    }
    // --- view framing -----------------------------------------------------------------
    _frame() {
      const fr = this.adapter.measureFrame(FILL_TARGET);
      if (!fr) return;
      this.adapter.setCameraTarget(fr.com);
      const cur = this.adapter.cameraRadius();
      if (typeof cur === "number") this.adapter.setCameraRadius(cur + (fr.radius - cur) * FRAME_LERP);
    }
    _frameOnLoad(tries) {
      const fr = this.adapter.measureFrame(FILL_TARGET);
      if (!fr) {
        if (tries < 60) setTimeout(() => this._frameOnLoad(tries + 1), 100);
        return;
      }
      this.adapter.animateCamera({ target: fr.com, radius: fr.radius });
    }
    _onMix() {
      this._updateDrawActive();
      if (this.editOverlay.isEditing()) this.editOverlay.reproject();
      this._frame();
      this._renderStatus();
    }
    // --- modes ------------------------------------------------------------------------
    setMode(mode) {
      this.mode = mode;
      if (mode === "draw") {
        this.adapter.setControlPanelVisible(false);
        this.panel.setVisible(true);
        this.adapter.flatten();
      } else {
        this._editToggle(null);
        this.panel.setVisible(false);
        this.adapter.setControlPanelVisible(true);
      }
      this.toggle.setMode(mode);
      this._updateDrawActive();
      this._positionUI();
      this._renderStatus();
    }
    // Lasso capture is on exactly when we're in Draw mode AND flat AND not editing a shape. Drawing
    // is flat-only; Draw mode flattens automatically, so capture switches on when the morph finishes.
    _updateDrawActive() {
      this.overlay.setActive(this.mode === "draw" && this.adapter.isFlat() && !this.editOverlay.isEditing());
    }
    _renderStatus() {
      if (this.mode !== "draw") return;
      if (!this.adapter.isFlat()) {
        this.panel.setStatus("Flattening\u2026", "warn");
        return;
      }
      if (this.editOverlay.isEditing()) this.panel.setStatus("Editing \u2014 drag \u25CF to move \xB7 click an anchor, drag \u25CB to bend \xB7 double-click the line to add a point \xB7 double-click \u25CF to toggle corner/smooth \xB7 select + Delete to remove \xB7 scroll to zoom \xB7 \u2713 done when finished.", "draw");
      else this.panel.setStatus("Lasso to draw \xB7 \u270E to edit a shape \xB7 scroll to zoom \xB7 Shift+drag to pan \xB7 Shift+click to inspect.", "draw");
    }
    // --- drawing pipeline -------------------------------------------------------------
    _finishLasso(pts) {
      const projected = this.adapter.projectVertices({ subsample: 1 });
      const sel0 = selectInPolygon(projected, pts);
      if (!sel0.total) {
        this.panel.message("0 vertices selected \u2014 lasso the flatmap.");
        return;
      }
      const lassoRing = buildOutline(pts, sel0);
      const ringUv = this._ringToUv(lassoRing);
      const bezier = ringUv && ringUv.length >= 3 ? fitClosedBezier(ringUv) : null;
      const derived = bezier ? this._roiFromBezier(bezier) : null;
      const sel = derived && derived.total ? derived : {
        left: sel0.left,
        right: sel0.right,
        outline: lassoRing,
        labelVert: pickLabelVertex(sel0),
        total: sel0.total
      };
      const name = window.prompt("ROI name:", "roi" + (this.rois.length + 1));
      if (name === null) return;
      this.rois.add({
        name,
        left: sel.left,
        right: sel.right,
        outline: sel.outline,
        labelVert: sel.labelVert,
        bezier
      });
      this._sync();
      this.panel.message('ROI "' + name + '": ' + sel.total + " vertices." + (bezier ? " \u270E editable." : ""));
    }
    // Map an outline ring [{h,g}] to flat-UV points [[u,v],...], dropping vertices with no uv.
    _ringToUv(ring) {
      if (!ring) return null;
      const uv = [];
      for (const o of ring) {
        const p = this.adapter.vertexUV(o);
        if (p) uv.push(p);
      }
      return uv;
    }
    // Derive ROI membership + outline + label from a bezier, entirely in flat-UV (view-independent,
    // so a reloaded ROI selects the same vertices). selectInPolygon/buildOutline are coordinate-space
    // agnostic, so we feed them uv where they'd normally get screen px.
    _roiFromBezier(bezier) {
      const poly = evalClosedBezier(bezier, BEZIER_SAMPLES);
      if (poly.length < 3) return null;
      const all = this.adapter.allVertexUV();
      const projectedUv = { left: { idx: all.left.idx, px: all.left.uv }, right: { idx: all.right.idx, px: all.right.uv } };
      const sel = selectInPolygon(projectedUv, poly);
      const outline = buildOutline(poly, sel, { epsilon: OUTLINE_EPS_UV });
      return { left: sel.left, right: sel.right, outline, labelVert: pickLabelVertex(sel), total: sel.total };
    }
    // --- editing ----------------------------------------------------------------------
    // Toggle shape editing. id => start editing that ROI's bezier; null => stop.
    _editToggle(id) {
      const roi = id != null ? this.rois.rois.find((r) => r.id === id) : null;
      this.editingId = roi ? roi.id : null;
      this.editOverlay.setEditing(roi || null);
      this.panel.setEditingId(this.editingId);
      this._updateDrawActive();
      this.panel.renderList(this.rois.rois);
      this._renderStatus();
    }
    // A drag-release from the edit overlay: store the new bezier and re-derive vertices from it.
    _applyEdit(bezier) {
      const roi = this.rois.rois.find((r) => r.id === this.editingId);
      if (!roi) return;
      roi.bezier = bezier;
      const d = this._roiFromBezier(bezier);
      if (d && d.total) {
        roi.left = d.left;
        roi.right = d.right;
        roi.outline = d.outline;
        roi.labelVert = d.labelVert;
      }
      this.adapter.setOverlayLayer(LAYER, this.rois.rois);
      this.panel.renderList(this.rois.rois);
    }
    _sync() {
      this.adapter.setOverlayLayer(LAYER, this.rois.rois);
      this.panel.renderList(this.rois.rois);
    }
    remove(id) {
      if (id === this.editingId) this._editToggle(null);
      this.rois.remove(id);
      this._sync();
    }
    clear() {
      this._editToggle(null);
      this.rois.clear();
      this._sync();
    }
    // --- export / import --------------------------------------------------------------
    exportJSON() {
      if (!this.rois.length) {
        this.panel.message("Nothing to export.");
        return;
      }
      let text;
      try {
        text = JSON.stringify(this.rois.toJSON(this.adapter.surfaceId()), null, 2);
      } catch (e) {
        this.panel.message("Export failed: " + (e && e.message ? e.message : e));
        return;
      }
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rois.json";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
      }, 4e3);
      this.panel.message("Exported " + this.rois.length + " ROI(s), " + text.length + " bytes, to rois.json.");
    }
    _import(file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result;
          if (!text || !String(text).trim()) {
            this.panel.message("Import failed: \u201C" + file.name + "\u201D is empty (0 bytes). Re-export and try again.");
            return;
          }
          const added = this.rois.loadJSON(JSON.parse(text));
          let fitted = 0;
          for (const roi of added) {
            if (roi.bezier || !roi.outline) continue;
            const ringUv = this._ringToUv(roi.outline);
            const bez = ringUv && ringUv.length >= 3 ? fitClosedBezier(ringUv) : null;
            if (bez) {
              roi.bezier = bez;
              fitted++;
            }
          }
          this._sync();
          this.panel.message("Imported " + added.length + " ROI(s) from " + file.name + (fitted ? " (" + fitted + " made editable)." : "."));
        } catch (err) {
          this.panel.message("Import failed: " + (err && err.message ? err.message : err));
        }
      };
      reader.readAsText(file);
    }
    // --- ui positioning + keyboard ----------------------------------------------------
    _positionUI() {
      if (this.mode === "display") this.toggle.position(this.adapter.controlPanelRect());
    }
    _wireKeys() {
      this._keydown = (e) => {
        if (this._isTextEntry(e.target)) return;
        if (e.key === "Escape") {
          if (this.editOverlay.isEditing()) this._editToggle(null);
          else this.overlay.cancel();
        } else if (e.key === "Shift") this.overlay.setPassthrough(true);
      };
      this._keyup = (e) => {
        if (e.key === "Shift") this.overlay.setPassthrough(false);
      };
      window.addEventListener("keydown", this._keydown, true);
      window.addEventListener("keyup", this._keyup, true);
      window.addEventListener("blur", () => this.overlay.setPassthrough(false));
    }
    // True only for text-entry targets (so we don't swallow Shift/Esc there). A file/button input
    // is NOT text entry, so global gestures keep working even if such an element holds focus.
    _isTextEntry(t) {
      if (!t) return false;
      if (t.isContentEditable) return true;
      const tag = t.tagName || "";
      if (tag === "TEXTAREA") return true;
      if (tag !== "INPUT") return false;
      return !/^(file|button|checkbox|radio|range|color|submit|reset|image)$/i.test(t.type || "text");
    }
  };
  function attach(viewer, opts) {
    return new ROIDrawer(viewer, opts);
  }
  function autoAttach(opts = {}) {
    let tries = 120;
    const go = () => {
      const v = window.viewer;
      if (v && surfaceReady(v)) {
        try {
          window.roidrawer = attach(v, opts);
        } catch (e) {
          console.error("[roidraw] attach failed:", e);
        }
        return;
      }
      if (tries-- > 0) setTimeout(go, 300);
      else console.warn("[roidraw] viewer never became ready");
    };
    go();
  }
  if (typeof window !== "undefined") {
    window.ROIDraw = { attach, autoAttach, ROIDrawer, surfaceReady, findSurface };
  }
  return __toCommonJS(index_exports);
})();
