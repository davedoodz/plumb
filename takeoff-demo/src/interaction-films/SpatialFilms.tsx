import {
  Film,
  Scene,
  Message,
  Card,
  Label,
  Chip,
  Photo,
  Touch,
  Outcome,
  useTime,
  ease,
  appear,
} from "./shared";
import { Pendant } from "./Pendant";
export function QuantityFilm() {
  const t = useTime(),
    cut = ease(t, 3.3, 0.6) * 1.2,
    waste = Math.round(ease(t, 5.1, 1.2) * 10),
    area = 18 - cut,
    needed = area * (1 + waste / 100),
    boxes = Math.ceil(needed / 1.44);
  return (
    <Film t={t} title="Let the assumptions change the number" category="Tiles">
      <Scene t={t} from={0} to={2.1}>
        <Message user>How many boxes for this room?</Message>
        <Photo name="tiles-layout.png" height={270} />
        <Message style={{ marginTop: 18 }}>
          Start with your measurements. Keep the assumptions attached.
        </Message>
      </Scene>
      <Scene t={t} from={2.1} to={8.7}>
        <Label>ENTERED DIMENSIONS · NOT PHOTO MEASUREMENTS</Label>
        <h2 className="mf-section-title" style={{ marginTop: 8 }}>
          A quantity you can explain.
        </h2>
        <svg width="353" height="260" viewBox="0 0 353 260">
          <defs>
            <pattern
              id="tile-grid"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <rect width="22" height="22" fill="#eae8e1" stroke="white" />
            </pattern>
          </defs>
          <rect
            x="36"
            y="20"
            width="282"
            height="204"
            fill="url(#tile-grid)"
            stroke="#777"
          />
          <rect
            x="36"
            y="20"
            width="78"
            height="58"
            fill="#fff"
            stroke="#555"
            strokeDasharray="4 3"
            opacity={ease(t, 3.3, 0.6)}
          />
          <text x="177" y="248" textAnchor="middle" fontSize="13" fill="#666">
            5.0 m
          </text>
          <text
            x="15"
            y="124"
            textAnchor="middle"
            transform="rotate(-90 15 124)"
            fontSize="13"
            fill="#666"
          >
            3.6 m
          </text>
          <g opacity={ease(t, 3.3, 0.6)}>
            <text x="75" y="45" fontSize="10" fill="#666" textAnchor="middle">
              Cabinet
            </text>
            <text x="75" y="62" fontSize="11" fill="#222" textAnchor="middle">
              −1.2 m²
            </text>
          </g>
        </svg>
        <div className="mf-row" style={{ marginTop: 8 }}>
          <Chip active={t >= 3.3}>Exclude fixed cabinet</Chip>
          <Label>{area.toFixed(2)} m² net</Label>
        </div>
        <div style={{ marginTop: 25 }}>
          <div className="mf-row">
            <Label>Cutting allowance</Label>
            <strong style={{ fontSize: 16 }}>{waste}%</strong>
          </div>
          <div
            style={{
              height: 4,
              background: "#e5e5e5",
              borderRadius: 4,
              marginTop: 17,
              position: "relative",
            }}
          >
            <div
              style={{ height: 4, width: `${waste * 7}%`, background: "#222" }}
            />
            <div
              style={{
                position: "absolute",
                left: `${waste * 7}%`,
                top: -6,
                width: 16,
                height: 16,
                borderRadius: 20,
                background: "#222",
              }}
            />
          </div>
        </div>
        <Card style={{ marginTop: 27 }}>
          <div className="mf-row">
            <div>
              <div className="mf-number">
                {boxes}{" "}
                <span style={{ fontSize: 18, letterSpacing: 0 }}>boxes</span>
              </div>
              <Label style={{ marginTop: 6 }}>
                {needed.toFixed(2)} m² ÷ 1.44 m² per box
              </Label>
            </div>
            <Label>
              Round up
              <br />
              to whole boxes
            </Label>
          </div>
        </Card>
        <Touch t={t} at={3.25} x={110} y={358} />
        <Touch
          t={t}
          at={5.05}
          x={9}
          y={433}
          to={{ x: 247, y: 433 }}
          duration={1.2}
        />
      </Scene>
      <Scene t={t} from={8.7}>
        <Message user>Keep the calculation with the spec.</Message>
        <Outcome
          t={t}
          at={8.7}
          title="13 boxes. Assumptions included."
          detail="18.00 − 1.20 = 16.80 m². Add 10% for cutting, then round up to whole boxes."
        />
        <Card style={{ marginTop: 18 }}>
          <Label>TAKEOFF ATTACHMENT</Label>
          <div className="mf-row" style={{ marginTop: 14 }}>
            <strong style={{ fontSize: 24 }}>18.48 m²</strong>
            <Chip>13 × 1.44 m²</Chip>
          </div>
          <Label style={{ marginTop: 14 }}>
            Site dimensions supplied by you. Installer review still required.
          </Label>
        </Card>
      </Scene>
    </Film>
  );
}
export function ClearanceFilm() {
  const t = useTime(),
    move = ease(t, 3.15, 1.25),
    drop = ease(t, 5.3, 1.0),
    mm = Math.round(1800 - drop * 200);
  return (
    <Film t={t} title="Place it, then question the fit" category="Lighting">
      <Scene t={t} from={0} to={2}>
        <Message user>Would this pendant hang too low?</Message>
        <Photo name="lighting-room.png" height={300} />
        <Message style={{ marginTop: 20 }}>
          Try the position first. Then check the measured clearance.
        </Message>
      </Scene>
      <Scene t={t} from={2} to={8.7}>
        <div className="mf-row" style={{ marginBottom: 14 }}>
          <h2 className="mf-section-title" style={{ margin: 0 }}>
            Place in the room
          </h2>
          <Chip>AR concept</Chip>
        </div>
        <div
          style={{
            height: 375,
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <Photo name="lighting-room.png" height={375} />
          <div
            style={{
              position: "absolute",
              left: 20 + move * 70,
              top: 18 + drop * 25,
              transform: `scale(${0.8 + move * 0.12})`,
              transformOrigin: "50% 0%",
            }}
          >
            <Pendant width={210} height={225} pitch={-0.15} />
          </div>
          <svg
            width="353"
            height="375"
            style={{ position: "absolute", inset: 0 }}
          >
            <g opacity={ease(t, 4.7, 0.3)}>
              <path
                d={`M255 ${153 + drop * 25}v137M248 ${153 + drop * 25}h14M248 290h14`}
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <rect
                x="210"
                y="210"
                width="118"
                height="31"
                rx="15"
                fill="#fff"
              />
              <text
                x="269"
                y="230"
                textAnchor="middle"
                fontSize="12"
                fill="#222"
              >
                {mm} mm above floor
              </text>
            </g>
          </svg>
          <span
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              fontSize: 10,
              color: "white",
              background: "#0008",
              padding: "6px 10px",
              borderRadius: 15,
            }}
          >
            Illustrative placement · no depth tracking
          </span>
        </div>
        <div className="mf-row" style={{ marginTop: 22 }}>
          <Label>Entered pendant drop</Label>
          <strong>{Math.round(900 + drop * 200)} mm</strong>
        </div>
        <div
          style={{
            height: 4,
            background: "#eee",
            marginTop: 18,
            position: "relative",
          }}
        >
          <div
            style={{
              height: 4,
              width: `${35 + drop * 35}%`,
              background: "#222",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${35 + drop * 35}%`,
              top: -6,
              width: 16,
              height: 16,
              borderRadius: 20,
              background: "#222",
            }}
          />
        </div>
        <div className="mf-hold" style={{ marginTop: 24, ...appear(t, 6.4) }}>
          Looks placed. Still needs a site measurement.
        </div>
        <Touch
          t={t}
          at={3.1}
          x={108}
          y={190}
          to={{ x: 179, y: 190 }}
          duration={1.25}
        />
        <Touch
          t={t}
          at={5.25}
          x={125}
          y={464}
          to={{ x: 250, y: 464 }}
          duration={1}
        />
      </Scene>
      <Scene t={t} from={8.7}>
        <Message user>Save this position for the electrician.</Message>
        <Outcome
          t={t}
          at={8.7}
          title="A better question, not a false approval."
          detail="At an entered 1,100 mm drop and 2,700 mm ceiling, the lowest point is 1,600 mm above the floor."
          photo="lighting-room.png"
        />
        <Chip>Confirm table and walkway clearance</Chip>
      </Scene>
    </Film>
  );
}
export function SubstitutionFilm() {
  const t = useTime(),
    orbit = ease(t, 2.8, 1.4),
    swap = ease(t, 5.15, 0.8),
    shape = t >= 5.55 ? "cone" : "dome";
  return (
    <Film t={t} title="Change the object, keep the intent" category="Lighting">
      <Scene t={t} from={0} to={2}>
        <Message user>Can the alternative keep the same feel?</Message>
        <Card style={{padding:0,background:"#f4f4f1"}}>
          <Pendant width={353} height={280} pitch={-.35} yaw={.2}/>
        </Card>
        <Message style={{ marginTop: 20 }}>
          Compare the form from more than one angle.
        </Message>
      </Scene>
      <Scene t={t} from={2} to={8.7}>
        <Label>VISUAL COMPARISON · ILLUSTRATIVE 3D MODELS</Label>
        <h2 className="mf-section-title" style={{ marginTop: 9 }}>
          Same view. Different silhouette.
        </h2>
        <div
          style={{
            height: 300,
            borderRadius: 20,
            background: "#f4f4f1",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `translateX(${-swap * 353}px)`,
              position: "absolute",
              inset: 0,
            }}
          >
            <Pendant
              width={353}
              height={290}
              pitch={-0.35 + orbit * 0.65}
              yaw={0.2 + orbit * 1.1}
            />
          </div>
          <div
            style={{
              transform: `translateX(${353 - swap * 353}px)`,
              position: "absolute",
              inset: 0,
            }}
          >
            <Pendant
              width={353}
              height={290}
              pitch={-0.35 + orbit * 0.65}
              yaw={0.2 + orbit * 1.1}
              shape="cone"
            />
          </div>
          <Label
            style={{
              position: "absolute",
              bottom: 13,
              width: "100%",
              textAlign: "center",
            }}
          >
            Drag to orbit · swipe to compare
          </Label>
        </div>
        <div className="mf-row" style={{ marginTop: 18 }}>
          <Chip active={shape === "dome"}>Original · soft dome</Chip>
          <Chip active={shape === "cone"}>Alternative · wide cone</Chip>
        </div>
        <Card style={{ marginTop: 20, ...appear(t, 6.2) }}>
          <Label>DESIGN INTENT KEPT</Label>
          <div style={{ fontSize: 17, marginTop: 9 }}>
            Warm finish. Single pendant.
          </div>
          <div style={{ height: 1, background: "#eee", margin: "13px 0" }} />
          <Label>STILL TO VERIFY</Label>
          <div style={{ fontSize: 14, marginTop: 7 }}>
            Diameter · light output · availability
          </div>
        </Card>
        <Touch
          t={t}
          at={2.75}
          x={120}
          y={240}
          to={{ x: 245, y: 300 }}
          duration={1.4}
        />
        <Touch
          t={t}
          at={5.1}
          x={279}
          y={221}
          to={{ x: 80, y: 221 }}
          duration={0.8}
        />
      </Scene>
      <Scene t={t} from={8.7}>
        <Message user>Keep this as an alternative, not a replacement.</Message>
        <Card style={{ background: "#f4f4f1", padding: 0, marginTop: 16 }}>
          <Pendant width={353} height={230} pitch={0.3} shape="cone" />
        </Card>
        <Outcome
          t={t}
          at={8.7}
          title="The trade-off stays visible."
          detail="A broader silhouette, with the same warm finish. The supplier specification still needs a separate check."
        />
        <Chip>Alternative saved · not approved</Chip>
      </Scene>
    </Film>
  );
}
