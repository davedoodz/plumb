import {
  Action,
  Bubble,
  Card,
  Chip,
  Enter,
  Label,
  Roll,
  Tap,
  C,
  settle,
  clamp,
} from "../ui";

export function Takeoff({ t }: { t: number }) {
  const expansion = settle(t, 2.25, 0.35);
  const herring = t >= 3.3 && t < 7.4;
  const collapse = settle(t, 10.55, 0.45);
  return (
    <>
      <Label t={t}>Takeoff</Label>
      <Bubble>3×9 Puget Sound gloss. Here's the takeoff.</Bubble>
      <div style={{ position: "relative" }}>
        <div
          style={{
            height: 600 * (1 - collapse) + 46 * collapse,
            overflow: "hidden",
            marginTop: 14,
          }}
        >
          <Enter t={t}>
            <div
              style={{
                opacity: 1 - clamp(t, 10.55, 10.85),
                transform: `scale(${1 - 0.04 * collapse})`,
                transformOrigin: "top",
              }}
            >
              <Card title="Takeoff · Bathroom floor">
                <svg width="100%" height="130" viewBox="0 0 360 146">
                  <defs>
                    <pattern
                      id="straight"
                      width="42"
                      height="16"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M0 0H42V16H0Z"
                        fill="#f4f6f6"
                        stroke="#b9c4c7"
                        strokeWidth=".8"
                      />
                    </pattern>
                    <pattern
                      id="herring"
                      width="28"
                      height="28"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <path
                        d="M0 0H28V14H0Z M14 14H28V28H14Z"
                        fill="#f4f6f6"
                        stroke="#b9c4c7"
                        strokeWidth=".8"
                      />
                    </pattern>
                  </defs>
                  <rect
                    x="78"
                    y="21"
                    width="200"
                    height="102"
                    fill={`url(#${herring ? "herring" : "straight"})`}
                    stroke="#808d91"
                  />
                  <path
                    d="M78 13V7H278V13 M64 21H58V123H64"
                    fill="none"
                    stroke="#90999c"
                  />
                  <text
                    x="178"
                    y="143"
                    textAnchor="middle"
                    fill="#747b7e"
                    fontSize="13"
                  >
                    2.7 m
                  </text>
                  <text
                    x="39"
                    y="75"
                    textAnchor="middle"
                    transform="rotate(-90 39 75)"
                    fill="#747b7e"
                    fontSize="13"
                  >
                    2.1 m
                  </text>
                </svg>
                <div className="facts">
                  <div>
                    <span>Area</span>
                    <b>61 ft²</b>
                  </div>
                  <div>
                    <span>Layout</span>
                    <b>{herring ? "Herringbone" : "Straight"}</b>
                  </div>
                  <div>
                    <span>Waste</span>
                    <b>
                      <Roll
                        t={t}
                        initial="10%"
                        events={[
                          { at: 3.3, value: "15%" },
                          { at: 7.4, value: "10%" },
                        ]}
                      />
                    </b>
                  </div>
                  <div>
                    <span>Order</span>
                    <b>
                      <Roll
                        t={t}
                        initial="67 ft²"
                        events={[
                          { at: 3.3, value: "70.15 ft²" },
                          { at: 7.4, value: "67 ft²" },
                        ]}
                      />
                    </b>
                  </div>
                </div>
                <div className="result">
                  <Roll
                    t={t}
                    initial="7 boxes"
                    events={[
                      { at: 4.2, value: "8 boxes" },
                      { at: 8.3, value: "7 boxes" },
                    ]}
                  />
                  <span className="result-area">
                    {" "}
                    ·{" "}
                    <Roll
                      t={t}
                      initial="73.5 ft²"
                      events={[
                        { at: 4.2, value: "84 ft²" },
                        { at: 8.3, value: "73.5 ft²" },
                      ]}
                    />
                  </span>
                </div>
                <div className="price">
                  <Roll
                    t={t}
                    initial="$1,397"
                    events={[
                      { at: 5.1, value: "$1,596" },
                      { at: 9.2, value: "$1,397" },
                    ]}
                  />
                </div>
                <div className="small-note" style={{ color: C.orange }}>
                  Waste shown, not hidden.
                </div>
                <div className="allowance" style={{ opacity: herring ? 1 : 0 }}>
                  +1 box layout allowance · separate from waste
                </div>
                <div
                  className="segments"
                  style={{
                    height: 38 * expansion,
                    opacity: clamp(t, 2.25, 2.45),
                    overflow: "hidden",
                    marginBottom: 12 * expansion,
                  }}
                >
                  {["Straight", "Herringbone", "Diagonal"].map((s, i) => (
                    <div
                      key={s}
                      className={i === (herring ? 1 : 0) ? "selected" : ""}
                    >
                      {s}
                      {i === 1 ? (
                        <Tap t={t} at={3.3} />
                      ) : i === 0 ? (
                        <Tap t={t} at={7.4} />
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <Action secondary t={t} at={2}>
                    Change layout
                  </Action>
                  <Action t={t} at={10.3}>
                    Add to plan
                  </Action>
                </div>
              </Card>
            </div>
          </Enter>
        </div>
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto",
            opacity: clamp(t, 10.8, 11.05),
          }}
        >
          <Chip>Tile · 7 boxes · Added</Chip>
        </div>
      </div>
    </>
  );
}
