// A small actual WebGL mesh viewer. Geometry, lighting and camera are local.
export function pendantViewer(canvas, { transparent = false } = {}) {
  const gl = canvas.getContext("webgl", {
    alpha: transparent,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  if (!gl) {
    canvas.replaceWith(
      Object.assign(document.createElement("p"), {
        textContent:
          "3D is unavailable in this browser. Enable WebGL to inspect the model.",
      }),
    );
    return null;
  }
  const shader = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const vs = shader(
    gl.VERTEX_SHADER,
    `attribute vec3 p;attribute vec3 n;uniform float yaw;uniform float pitch;uniform float aspect;uniform float zoom;varying vec3 normal;varying vec3 pos;void main(){mat3 ry=mat3(cos(yaw),0.,-sin(yaw),0.,1.,0.,sin(yaw),0.,cos(yaw));mat3 rx=mat3(1.,0.,0.,0.,cos(pitch),sin(pitch),0.,-sin(pitch),cos(pitch));vec3 q=rx*ry*p;normal=rx*ry*n;pos=p;float z=4.5-q.z;gl_Position=vec4(q.x*zoom/aspect,q.y*zoom,(z-2.)*.3,z);}`,
  );
  const fs = shader(
    gl.FRAGMENT_SHADER,
    `precision mediump float;varying vec3 normal;varying vec3 pos;uniform vec3 color;void main(){float light=.35+.65*max(0.,dot(normalize(normal),normalize(vec3(-.4,.8,1.))));vec3 c=pos.y>1.02?vec3(.15):color;gl_FragColor=vec4(c*light,1.);}`,
  );
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const uniforms = Object.fromEntries(
    ["yaw", "pitch", "zoom", "aspect", "color"].map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ]),
  );
  const buffers = [gl.createBuffer(), gl.createBuffer()];
  let count = 0,
    yaw = 0.5,
    pitch = -0.18,
    zoom = 3.5,
    shape = "dome",
    color = [0.77, 0.67, 0.5];
  function mesh() {
    const profile =
      shape === "dome"
        ? [
            [0.06, 1.55],
            [0.06, 0.85],
            [0.13, 0.83],
            [0.24, 0.7],
            [0.43, 0.51],
            [0.64, 0.22],
            [0.83, -0.13],
            [0.88, -0.3],
            [0.85, -0.34],
            [0.7, -0.24],
            [0.49, 0.09],
            [0.25, 0.51],
            [0.08, 0.69],
          ]
        : [
            [0.045, 1.55],
            [0.045, 0.8],
            [0.16, 0.77],
            [0.24, 0.6],
            [0.54, 0.2],
            [0.94, -0.3],
            [0.94, -0.37],
            [0.86, -0.37],
            [0.48, 0.16],
            [0.18, 0.55],
            [0.08, 0.7],
          ];
    const positions = [],
      normals = [];
    for (let j = 0; j < profile.length - 1; j++) {
      const [r, y] = profile[j],
        [r2, y2] = profile[j + 1];
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2,
          b = ((i + 1) / 64) * Math.PI * 2;
        for (const [radius, height, angle] of [
          [r, y, a],
          [r2, y2, a],
          [r2, y2, b],
          [r, y, a],
          [r2, y2, b],
          [r, y, b],
        ]) {
          positions.push(
            radius * Math.cos(angle),
            height - 0.45,
            radius * Math.sin(angle),
          );
          normals.push(
            (y - y2) * Math.cos(angle),
            r2 - r,
            (y - y2) * Math.sin(angle),
          );
        }
      }
    }
    count = positions.length / 3;
    for (const [i, name, data] of [
      [0, "p", positions],
      [1, "n", normals],
    ]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    }
  }
  function draw() {
    const r = canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio, 2);
    const width = Math.max(1, Math.round(r.width * dpr));
    const height = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(
      transparent ? 0 : 0.95,
      transparent ? 0 : 0.95,
      transparent ? 0 : 0.94,
      transparent ? 0 : 1,
    );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.uniform1f(uniforms.yaw, yaw);
    gl.uniform1f(uniforms.pitch, pitch);
    gl.uniform1f(uniforms.zoom, zoom);
    gl.uniform1f(uniforms.aspect, canvas.width / canvas.height);
    gl.uniform3fv(uniforms.color, color);
    gl.drawArrays(gl.TRIANGLES, 0, count);
  }
  let drag = null;
  const down = (e) => {
    drag = [e.clientX, e.clientY];
    canvas.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drag) return;
    yaw += (e.clientX - drag[0]) * 0.012;
    pitch = Math.max(-1.2, Math.min(1.2, pitch + (e.clientY - drag[1]) * 0.01));
    drag = [e.clientX, e.clientY];
    draw();
  };
  const up = () => (drag = null);
  const key = (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    yaw += e.key === "ArrowLeft" ? -0.15 : e.key === "ArrowRight" ? 0.15 : 0;
    pitch = Math.max(
      -1.2,
      Math.min(
        1.2,
        pitch +
          (e.key === "ArrowUp" ? -0.15 : e.key === "ArrowDown" ? 0.15 : 0),
      ),
    );
    draw();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("keydown", key);
  const observer = new ResizeObserver(draw);
  observer.observe(canvas);
  mesh();
  draw();
  return {
    update(values) {
      if (values.shape && shape !== values.shape) {
        shape = values.shape;
        mesh();
      }
      if (values.color) color = values.color;
      if (values.zoom) zoom = values.zoom;
      if (values.reset) {
        yaw = 0.5;
        pitch = -0.18;
        zoom = 3.5;
      }
      draw();
    },
    destroy() {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("keydown", key);
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
