/* crop.js: 4-corner perspective crop + image enhancement for label scanning.
   Pure canvas math. No AI, no network. */
(() => {
  const root = typeof window !== "undefined" ? window : globalThis;

  /* ---------- geometry: unit square -> quad (Heckbert) ---------- */
  function homography(q) {
    const [p0, p1, p2, p3] = q;
    const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
    const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
    let a, b, c, d, e, f, g, h;
    if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
      a = p1.x - p0.x; b = p3.x - p0.x; c = p0.x; d = p1.y - p0.y; e = p3.y - p0.y; f = p0.y; g = 0; h = 0;
    } else {
      const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
      g = (dx3 * dy2 - dx2 * dy3) / den;
      h = (dx1 * dy3 - dx3 * dy1) / den;
      a = p1.x - p0.x + g * p1.x; b = p3.x - p0.x + h * p3.x; c = p0.x;
      d = p1.y - p0.y + g * p1.y; e = p3.y - p0.y + h * p3.y; f = p0.y;
    }
    return { a, b, c, d, e, f, g, h };
  }
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

  /* inverse-map every output pixel into the source (bilinear) */
  function warp(src, sw, sh, quad, ow, oh) {
    const H = homography(quad), out = new Uint8ClampedArray(ow * oh * 4);
    const dx = ow > 1 ? 1 / (ow - 1) : 0, dy = oh > 1 ? 1 / (oh - 1) : 0;
    let o = 0;
    for (let y = 0; y < oh; y++) {
      const v = y * dy;
      for (let x = 0; x < ow; x++, o += 4) {
        const u = x * dx, w = H.g * u + H.h * v + 1;
        let sx = (H.a * u + H.b * v + H.c) / w, sy = (H.d * u + H.e * v + H.f) / w;
        if (sx < 0) sx = 0; else if (sx > sw - 1) sx = sw - 1;
        if (sy < 0) sy = 0; else if (sy > sh - 1) sy = sh - 1;
        const x0 = sx | 0, y0 = sy | 0, x1 = x0 + 1 < sw ? x0 + 1 : x0, y1 = y0 + 1 < sh ? y0 + 1 : y0;
        const fx = sx - x0, fy = sy - y0, i00 = (y0 * sw + x0) * 4, i10 = (y0 * sw + x1) * 4, i01 = (y1 * sw + x0) * 4, i11 = (y1 * sw + x1) * 4;
        const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        out[o] = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
        out[o + 1] = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
        out[o + 2] = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
        out[o + 3] = 255;
      }
    }
    return out;
  }

  /* ---------- enhancement filters ---------- */
  function toGray(d, n) {
    const g = new Uint8ClampedArray(n);
    for (let i = 0, j = 0; i < n; i++, j += 4) g[i] = (d[j] * 77 + d[j + 1] * 151 + d[j + 2] * 28) >> 8;
    return g;
  }
  function stretch(g, lo = 0.02, hi = 0.98) {
    const hist = new Uint32Array(256); for (let i = 0; i < g.length; i++) hist[g[i]]++;
    let acc = 0, a = 0, b = 255; const n = g.length;
    for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= n * lo) { a = i; break; } }
    acc = 0; for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= n * (1 - hi)) { b = i; break; } }
    if (b - a < 20) { a = Math.max(0, a - 10); b = Math.min(255, b + 10); }
    const k = 255 / (b - a);
    for (let i = 0; i < g.length; i++) { const v = (g[i] - a) * k; g[i] = v < 0 ? 0 : v > 255 ? 255 : v; }
    return g;
  }
  const mean = g => { let s = 0; for (let i = 0; i < g.length; i++) s += g[i]; return s / g.length; };
  function invert(g) { for (let i = 0; i < g.length; i++) g[i] = 255 - g[i]; return g; }
  function boostContrast(g, boost) {
    if (!boost) return g;
    const k = 1 + boost / 50;
    for (let i = 0; i < g.length; i++) { const v = (g[i] - 128) * k + 128; g[i] = v < 0 ? 0 : v > 255 ? 255 : v; }
    return g;
  }
  /* local-mean threshold: handles shine, curve and uneven light */
  function adaptive(g, w, h, bias = 0.1) {
    const W = w + 1, I = new Uint32Array(W * (h + 1));
    for (let y = 0; y < h; y++) { let row = 0; for (let x = 0; x < w; x++) { row += g[y * w + x]; I[(y + 1) * W + x + 1] = I[y * W + x + 1] + row; } }
    const r = Math.max(10, Math.round(Math.min(w, h) / 24)), out = new Uint8ClampedArray(g.length);
    for (let y = 0; y < h; y++) {
      const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
      for (let x = 0; x < w; x++) {
        const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
        const sum = I[y1 * W + x1] - I[y0 * W + x1] - I[y1 * W + x0] + I[y0 * W + x0];
        const m = sum / ((x1 - x0) * (y1 - y0));
        out[y * w + x] = g[y * w + x] > m * (1 - bias) ? 255 : 0;
      }
    }
    return out;
  }
  /* returns grayscale/colour RGBA bytes. mode: original | auto | contrast | adaptive | invert */
  function enhance(rgba, w, h, mode = "auto", boost = 0) {
    if (mode === "original") return rgba;
    const n = w * h;
    let g = toGray(rgba, n);
    stretch(g);
    boostContrast(g, boost);
    if (mode === "adaptive") { const dark = mean(g) < 105; g = adaptive(g, w, h); if (dark) invert(g); }
    else if (mode === "invert") invert(g);
    else if (mode === "auto" && mean(g) < 105) invert(g);
    const out = new Uint8ClampedArray(rgba.length);
    for (let i = 0, j = 0; i < n; i++, j += 4) { out[j] = out[j + 1] = out[j + 2] = g[i]; out[j + 3] = 255; }
    return out;
  }

  /* ---------- the interactive cropper ---------- */
  class QuadCrop {
    constructor(canvas) {
      this.cv = canvas; this.ctx = canvas.getContext("2d");
      this.base = null; this.src = null; this.q = null; this.rot = 0; this.tilt = 0;
      this.active = -1; this.moving = false; this.last = null; this.scale = 1; this.dpr = 1;
      const on = (t, f) => canvas.addEventListener(t, f);
      on("pointerdown", e => this.down(e)); on("pointermove", e => this.move(e));
      on("pointerup", e => this.up(e)); on("pointercancel", e => this.up(e));
      canvas.style.touchAction = "none";
      this._ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { if (this.src) { this.layout(); this.render(); } }) : null;
      if (this._ro && canvas.parentElement) this._ro.observe(canvas.parentElement);
    }
    async load(file, maxDim = 3200) {
      let bmp;
      try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); }
      catch (e) {
        bmp = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
      }
      const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight, s = Math.min(1, maxDim / Math.max(w, h));
      this.base = document.createElement("canvas"); this.base.width = Math.round(w * s); this.base.height = Math.round(h * s);
      this.base.getContext("2d").drawImage(bmp, 0, 0, this.base.width, this.base.height);
      if (bmp.close) bmp.close();
      this.rot = 0; this.tilt = 0; this.rebuild(true);
    }
    rebuild(resetQuad) {
      const rad = (this.rot * 90 + this.tilt) * Math.PI / 180, c = Math.abs(Math.cos(rad)), s = Math.abs(Math.sin(rad));
      const bw = this.base.width, bh = this.base.height;
      const W = Math.ceil(bw * c + bh * s), H = Math.ceil(bw * s + bh * c);
      const cvs = this.src && this.src !== this.base ? this.src : document.createElement("canvas");
      cvs.width = W; cvs.height = H;
      const x = cvs.getContext("2d"); x.fillStyle = "#0b1626"; x.fillRect(0, 0, W, H);
      x.translate(W / 2, H / 2); x.rotate(rad); x.drawImage(this.base, -bw / 2, -bh / 2);
      this.src = cvs;
      if (resetQuad || !this.q) this.resetQuad();
      this.layout(); this.render();
    }
    resetQuad() {
      const W = this.src.width, H = this.src.height, m = 0.07;
      this.q = [{ x: W * m, y: H * m }, { x: W * (1 - m), y: H * m }, { x: W * (1 - m), y: H * (1 - m) }, { x: W * m, y: H * (1 - m) }];
      if (this.cv) this.render();
    }
    rotate(dir) { this.rot = (this.rot + dir + 4) % 4; this.rebuild(true); }
    setTilt(deg) { this.tilt = +deg; this.rebuild(true); }
    layout() {
      const host = this.cv.parentElement, maxW = Math.max(200, host.clientWidth || 340), maxH = Math.max(240, Math.round(innerHeight * 0.62));
      this.scale = Math.min(maxW / this.src.width, maxH / this.src.height);
      this.cssW = Math.round(this.src.width * this.scale); this.cssH = Math.round(this.src.height * this.scale);
      this.dpr = Math.min(devicePixelRatio || 1, 2.5);
      this.cv.style.width = this.cssW + "px"; this.cv.style.height = this.cssH + "px";
      this.cv.width = Math.round(this.cssW * this.dpr); this.cv.height = Math.round(this.cssH * this.dpr);
    }
    pt(i) { return { x: this.q[i].x * this.scale, y: this.q[i].y * this.scale }; }
    render() {
      if (!this.src) return;
      const c = this.ctx, w = this.cssW, h = this.cssH;
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.imageSmoothingQuality = "high";
      c.drawImage(this.src, 0, 0, w, h);
      const P = [0, 1, 2, 3].map(i => this.pt(i));
      c.fillStyle = "rgba(4,10,22,.58)"; c.beginPath(); c.rect(0, 0, w, h);
      c.moveTo(P[0].x, P[0].y); P.slice(1).forEach(p => c.lineTo(p.x, p.y)); c.closePath(); c.fill("evenodd");
      // thirds grid
      c.strokeStyle = "rgba(34,211,166,.35)"; c.lineWidth = 1; c.beginPath();
      for (let t = 1; t < 3; t++) {
        const f = t / 3, a = lerp(P[0], P[1], f), b = lerp(P[3], P[2], f), d = lerp(P[0], P[3], f), e = lerp(P[1], P[2], f);
        c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.moveTo(d.x, d.y); c.lineTo(e.x, e.y);
      }
      c.stroke();
      c.strokeStyle = "#22d3a6"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(P[0].x, P[0].y); P.slice(1).forEach(p => c.lineTo(p.x, p.y)); c.closePath(); c.stroke();
      P.forEach((p, i) => {
        c.beginPath(); c.arc(p.x, p.y, i === this.active ? 15 : 12, 0, 7);
        c.fillStyle = "rgba(15,27,45,.85)"; c.fill(); c.lineWidth = 3; c.strokeStyle = i === this.active ? "#fff" : "#22d3a6"; c.stroke();
        c.beginPath(); c.arc(p.x, p.y, 3, 0, 7); c.fillStyle = "#fff"; c.fill();
      });
      if (this.active >= 0) this.loupe(P[this.active]);
    }
    loupe(p) {
      const c = this.ctx, R = 52, zoom = 2.6;
      let cx = p.x - 78, cy = p.y - 78;
      if (cx < R + 4) cx = p.x + 78; if (cy < R + 4) cy = p.y + 78;
      cx = Math.min(this.cssW - R - 4, Math.max(R + 4, cx)); cy = Math.min(this.cssH - R - 4, Math.max(R + 4, cy));
      const ww = (2 * R) / (this.scale * zoom), sx = p.x / this.scale, sy = p.y / this.scale;
      c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
      c.drawImage(this.src, sx - ww / 2, sy - ww / 2, ww, ww, cx - R, cy - R, 2 * R, 2 * R);
      c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 1; c.beginPath();
      c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke(); c.restore();
      c.beginPath(); c.arc(cx, cy, R, 0, 7); c.lineWidth = 3; c.strokeStyle = "#22d3a6"; c.stroke();
    }
    local(e) { const r = this.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (this.cssW / r.width), y: (e.clientY - r.top) * (this.cssH / r.height) }; }
    inside(p) { // point in quad (src px)
      let ins = false; const q = this.q;
      for (let i = 0, j = 3; i < 4; j = i++) {
        if ((q[i].y > p.y) !== (q[j].y > p.y) && p.x < ((q[j].x - q[i].x) * (p.y - q[i].y)) / (q[j].y - q[i].y) + q[i].x) ins = !ins;
      }
      return ins;
    }
    down(e) {
      if (!this.src) return;
      this.cv.setPointerCapture(e.pointerId);
      const p = this.local(e); let best = -1, bd = 34;
      for (let i = 0; i < 4; i++) { const h = this.pt(i), d = Math.hypot(h.x - p.x, h.y - p.y); if (d < bd) { bd = d; best = i; } }
      if (best >= 0) this.active = best;
      else if (this.inside({ x: p.x / this.scale, y: p.y / this.scale })) { this.moving = true; this.last = p; }
      this.render();
    }
    move(e) {
      if (this.active < 0 && !this.moving) return;
      const p = this.local(e), W = this.src.width, H = this.src.height;
      if (this.active >= 0) {
        this.q[this.active] = { x: Math.min(W, Math.max(0, p.x / this.scale)), y: Math.min(H, Math.max(0, p.y / this.scale)) };
      } else {
        let dx = (p.x - this.last.x) / this.scale, dy = (p.y - this.last.y) / this.scale;
        const xs = this.q.map(a => a.x), ys = this.q.map(a => a.y);
        dx = Math.max(-Math.min(...xs), Math.min(W - Math.max(...xs), dx)); dy = Math.max(-Math.min(...ys), Math.min(H - Math.max(...ys), dy));
        this.q = this.q.map(a => ({ x: a.x + dx, y: a.y + dy })); this.last = p;
      }
      this.render();
    }
    up() { this.active = -1; this.moving = false; this.render(); }

    /* flatten the chosen quad into a rectangle at high resolution and enhance it */
    crop({ maxDim = 3000, minLong = 1400, filter = "auto", boost = 0 } = {}) {
      const q = this.q, topW = dist(q[0], q[1]), botW = dist(q[3], q[2]), lh = dist(q[0], q[3]), rh = dist(q[1], q[2]);
      let ow = (topW + botW) / 2, oh = (lh + rh) / 2;
      const long = Math.max(ow, oh); let s = 1;
      if (long < minLong) s = Math.min(2.5, minLong / long); if (long * s > maxDim) s = maxDim / long;
      ow = Math.max(8, Math.round(ow * s)); oh = Math.max(8, Math.round(oh * s));
      const sd = this.src.getContext("2d").getImageData(0, 0, this.src.width, this.src.height);
      const px = warp(sd.data, this.src.width, this.src.height, q, ow, oh);
      const out = enhance(px, ow, oh, filter, boost);
      const cv = document.createElement("canvas"); cv.width = ow; cv.height = oh;
      cv.getContext("2d").putImageData(new ImageData(out, ow, oh), 0, 0);
      return cv;
    }
    destroy() { if (this._ro) this._ro.disconnect(); }
  }
  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  root.LLCrop = { QuadCrop, homography, warp, enhance, stretch, adaptive, toGray };
  if (typeof module !== "undefined" && module.exports) module.exports = root.LLCrop;
})();
