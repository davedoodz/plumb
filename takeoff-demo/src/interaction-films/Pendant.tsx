type Point = [number, number, number];
const profiles = {
  dome: [
    [0.035, 1.65],
    [0.035, 0.9],
    [0.13, 0.86],
    [0.28, 0.72],
    [0.49, 0.48],
    [0.7, 0.13],
    [0.87, -0.24],
    [0.88, -0.32],
    [0, -0.32],
  ],
  cone: [
    [0.035, 1.65],
    [0.035, 0.9],
    [0.12, 0.84],
    [0.2, 0.68],
    [0.5, 0.23],
    [0.96, -0.32],
    [0.96, -0.39],
    [0, -0.39],
  ],
};
export function Pendant({
  pitch = -0.2,
  yaw = 0.4,
  shape = "dome",
  width = 320,
  height = 280,
  finish = "brass",
}: {
  pitch?: number;
  yaw?: number;
  shape?: "dome" | "cone";
  width?: number;
  height?: number;
  finish?: "brass" | "white";
}) {
  const rotate = ([x, y, z]: Point): Point => {
    const a = x * Math.cos(yaw) + z * Math.sin(yaw),
      b = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return [
      a,
      y * Math.cos(pitch) - b * Math.sin(pitch),
      y * Math.sin(pitch) + b * Math.cos(pitch),
    ];
  };
  const facets: { points: string; depth: number; fill: string }[] = [];
  const profile = profiles[shape];
  const scale = Math.min(width * 0.35, height * 0.37);
  const base = finish === "white" ? [226, 224, 217] : [181, 159, 113];
  for (let j = 0; j < profile.length - 1; j++) {
    const [r, y] = profile[j],
      [r2, y2] = profile[j + 1];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2,
        b = ((i + 1) / 48) * Math.PI * 2;
      const vertices: Point[] = [
        [r * Math.cos(a), y - 0.52, r * Math.sin(a)],
        [r2 * Math.cos(a), y2 - 0.52, r2 * Math.sin(a)],
        [r2 * Math.cos(b), y2 - 0.52, r2 * Math.sin(b)],
        [r * Math.cos(b), y - 0.52, r * Math.sin(b)],
      ];
      const q = vertices.map(rotate);
      const normal = rotate([
        (y - y2) * Math.cos((a + b) / 2),
        r2 - r,
        (y - y2) * Math.sin((a + b) / 2),
      ]);
      const length = Math.hypot(...normal) || 1;
      const light =
        0.46 +
        0.54 *
          Math.max(
            0,
            (-0.35 * normal[0] + 0.7 * normal[1] + 0.62 * normal[2]) / length,
          );
      const rgb = (j === 0 ? [48, 48, 46] : base).map((c) =>
        Math.round(c * light),
      );
      facets.push({
        depth: q.reduce((n, v) => n + v[2], 0) / 4,
        points: q
          .map(
            ([x, yy]) =>
              `${(width / 2 + x * scale).toFixed(2)},${(height / 2 - yy * scale).toFixed(2)}`,
          )
          .join(" "),
        fill: `rgb(${rgb.join(",")})`,
      });
    }
  }
  facets.sort((a, b) => a.depth - b.depth);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Illustrative three-dimensional pendant"
    >
      <ellipse
        cx={width / 2}
        cy={height * 0.9}
        rx={width * 0.22}
        ry={height * 0.024}
        fill="#00000008"
      />
      {facets.map((f, i) => (
        <polygon
          key={i}
          points={f.points}
          fill={f.fill}
          stroke={f.fill}
          strokeWidth=".25"
        />
      ))}
    </svg>
  );
}
