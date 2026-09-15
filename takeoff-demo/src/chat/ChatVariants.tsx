import { Sequence, useCurrentFrame } from "remotion";
import { ChatMessage, ChatShell, type ChatVariant } from "./ChatShell";
import { PurchaseCard } from "./PurchaseCards";
import { settle, TileImage } from "../ui";

const SCENES = [
  { at: 0, end: 4, name: "", scene: "ask", reply: "" },
  {
    at: 4,
    end: 13,
    name: "Takeoff",
    scene: "takeoff",
    reply: "3×9 Puget Sound gloss. Here's the takeoff.",
  },
  {
    at: 13,
    end: 19,
    name: "Sample",
    scene: "sample",
    reply: "Yes. One sample, arrives Wednesday.",
  },
  {
    at: 19,
    end: 28,
    name: "Lead time",
    scene: "lead",
    reply: "Tile is close. Pendant is not.",
  },
  {
    at: 28,
    end: 38,
    name: "Substitution",
    scene: "substitution",
    reply: "This pendant is delayed. Here's one that's in stock.",
  },
  {
    at: 38,
    end: 47,
    name: "Sign-off",
    scene: "signoff",
    reply: "Needs Dev to confirm the drop, Sam to approve $412.",
  },
  {
    at: 47,
    end: 58,
    name: "Order thread",
    scene: "orders",
    reply: "Four of eleven ordered. Mirror waits on the vanity.",
  },
] as const;

function ConversationScene({
  variant,
  index,
}: {
  variant: ChatVariant;
  index: number;
}) {
  const t = Math.min(useCurrentFrame() / 30, index === 6 ? 8 : 100);
  const beat = SCENES[index];
  if (beat.scene === "ask") {
    return (
      <>
        <ChatMessage variant={variant} t={t} staticText>
          The bathroom plan is saved.
        </ChatMessage>
        <ChatMessage variant={variant} t={t} at={0.5} user>
          how much tile do i need for the bathroom floor
        </ChatMessage>
        <ChatMessage variant={variant} t={t} at={1.25}>
          I have the room from your plan. Which tile?
        </ChatMessage>
        {t >= 2.25 ? (
          <div
            style={{
              width: 180,
              margin: "18px 0 18px auto",
              opacity: settle(t, 2.25, 0.25),
              transform: `translateY(${6 * (1 - settle(t, 2.25, 0.25))}px)`,
            }}
          >
            <TileImage height={112} />
          </div>
        ) : null}
        <ChatMessage variant={variant} t={t} at={3.2}>
          3×9 Puget Sound gloss. Here's the takeoff.
        </ChatMessage>
      </>
    );
  }
  return (
    <>
      {beat.scene === "sample" ? (
        <ChatMessage variant={variant} t={t} staticText user>
          can i see it first
        </ChatMessage>
      ) : null}
      {beat.scene === "lead" ? (
        <ChatMessage variant={variant} t={t} staticText user>
          plumber comes oct 12. will everything be here
        </ChatMessage>
      ) : null}
      <ChatMessage
        variant={variant}
        t={t}
        at={beat.scene === "sample" || beat.scene === "lead" ? 0.5 : 0}
        staticText={beat.scene === "takeoff"}
      >
        {beat.reply}
      </ChatMessage>
      <PurchaseCard scene={beat.scene} t={t} />
    </>
  );
}

export function ChatVariantFilm({ variant }: { variant: ChatVariant }) {
  const frame = useCurrentFrame();
  let index = SCENES.length - 1;
  while (index > 0 && frame < SCENES[index].at * 30) index--;
  const beat = SCENES[index];
  return (
    <ChatShell
      variant={variant}
      label={beat.name}
      labelTime={(frame - beat.at * 30) / 30}
    >
      {SCENES.map((s, i) => (
        <Sequence
          key={s.scene}
          from={s.at * 30}
          durationInFrames={(s.end - s.at) * 30}
          layout="none"
          name={s.name || "Ask"}
        >
          <ConversationScene variant={variant} index={i} />
        </Sequence>
      ))}
    </ChatShell>
  );
}
