/* cutout.js: manual, non-AI background removal. Flood-fill magic wand, edge auto-fill, erase/restore brush, undo. */
(() => {
  class Cutout {
    constructor(cv) {
      this.cv = cv; this.ctx = cv.getContext("2d", { willReadFrequently: true });
      this.orig = null; this.hist = []; this.mode = "wand"; this.tol = 32; this.size = 24; this.drawing = false;
      cv.style.touchAction = "none";
      cv.addEventListener("pointerdown", e => this.down(e)); cv.addEventListener("pointermove", e => this.move(e));
      ["pointerup", "pointercancel"].forEach(t => cv.addEventListener(t, () => (this.drawing = false)));
    }
    load(src) { // src: canvas
      const max = 1600, k = Math.min(1, max / Math.max(src.width, src.height));
      this.cv.width = Math.round(src.width * k); this.cv.height = Math.round(src.height * k);
      this.ctx.drawImage(src, 0, 0, this.cv.width, this.cv.height);
      this.orig = this.ctx.getImageData(0, 0, this.cv.width, this.cv.height); this.hist = [];
    }
    snap() { this.hist.push(this.ctx.getImageData(0, 0, this.cv.width, this.cv.height)); if (this.hist.length > 20) this.hist.shift(); }
    undo() { const h = this.hist.pop(); if (h) this.ctx.putImageData(h, 0, 0); return !!h; }
    reset() { if (this.orig) { this.snap(); this.ctx.putImageData(this.orig, 0, 0); } }
    pos(e) { const r = this.cv.getBoundingClientRect(); return { x: Math.floor((e.clientX - r.left) * this.cv.width / r.width), y: Math.floor((e.clientY - r.top) * this.cv.height / r.height) }; }
    flood(sx, sy, tol) {
      const w = this.cv.width, h = this.cv.height, img = this.ctx.getImageData(0, 0, w, h), d = img.data, i0 = (sy * w + sx) * 4;
      if (d[i0 + 3] === 0) return;
      const r = d[i0], g = d[i0 + 1], b = d[i0 + 2], t2 = tol * tol * 3, seen = new Uint8Array(w * h), st = [sy * w + sx];
      while (st.length) {
        const p = st.pop(); if (seen[p]) continue; seen[p] = 1;
        const i = p * 4, dr = d[i] - r, dg = d[i + 1] - g, db = d[i + 2] - b;
        if (d[i + 3] === 0 || dr * dr + dg * dg + db * db > t2) continue;
        d[i + 3] = 0; const x = p % w;
        if (x > 0) st.push(p - 1); if (x < w - 1) st.push(p + 1); if (p >= w) st.push(p - w); if (p < w * (h - 1)) st.push(p + w);
      }
      this.feather(d, w, h); this.ctx.putImageData(img, 0, 0);
    }
    feather(d, w, h) { // soften 1px edge halo next to removed pixels
      const a = new Uint8Array(w * h); for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const p = y * w + x; if (!a[p]) continue;
        if (!a[p - 1] || !a[p + 1] || !a[p - w] || !a[p + w]) d[p * 4 + 3] = 150;
      }
    }
    autoEdges() { // remove everything matching the border colour
      this.snap(); const w = this.cv.width, h = this.cv.height;
      const pts = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1]];
      pts.forEach(([x, y]) => this.flood(x, y, this.tol));
    }
    down(e) {
      if (!this.orig) return; const p = this.pos(e); this.snap();
      if (this.mode === "wand") { this.flood(p.x, p.y, this.tol); this.hist.length && 0; }
      else { this.drawing = true; this.cv.setPointerCapture(e.pointerId); this.brush(p); }
    }
    move(e) { if (this.drawing) this.brush(this.pos(e)); }
    brush(p) {
      const c = this.ctx, r = this.size * this.cv.width / 600;
      c.save(); c.beginPath(); c.arc(p.x, p.y, r, 0, 7); c.clip();
      if (this.mode === "erase") c.clearRect(p.x - r, p.y - r, 2 * r, 2 * r);
      else { c.clearRect(p.x - r, p.y - r, 2 * r, 2 * r); c.putImageData(this.orig, 0, 0, p.x - r, p.y - r, 2 * r, 2 * r); }
      c.restore();
    }
    trim() { // crop to visible pixels
      const w = this.cv.width, h = this.cv.height, d = this.ctx.getImageData(0, 0, w, h).data;
      let x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 <= x0) return this.cv;
      const o = document.createElement("canvas"); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
      o.getContext("2d").drawImage(this.cv, x0, y0, o.width, o.height, 0, 0, o.width, o.height); return o;
    }
  }
  window.LLCutout = Cutout;
})();
