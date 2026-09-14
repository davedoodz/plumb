import { Bubble, Enter, Tap, TileImage, clamp } from "../ui";
const question = "how much tile do i need for the bathroom floor";
export function Ask({ t }: { t: number }) {
  return (
    <>
      <div className="prior-thread">
        <Bubble>The bathroom plan is saved.</Bubble>
        <div className="thread-date">14 September</div>
      </div>
      {t >= 1.7 ? (
        <Enter t={t} at={1.7}>
          <Bubble user>{question}</Bubble>
        </Enter>
      ) : null}
      {t >= 2.5 ? (
        <Enter t={t} at={2.5}>
          <Bubble>I have the room from your plan. Which tile?</Bubble>
        </Enter>
      ) : null}
      {t >= 4.4 ? (
        <Enter t={t} at={4.4}>
          <div className="photo-bubble">
            <TileImage height={125} />
          </div>
        </Enter>
      ) : null}
      {t >= 5.2 ? (
        <Enter t={t} at={5.2}>
          <Bubble>3×9 Puget Sound gloss. Here's the takeoff.</Bubble>
        </Enter>
      ) : null}
    </>
  );
}
export function Composer({ t, ask }: { t: number; ask: boolean }) {
  const keyboard = ask && t < 2.2;
  const typing = ask && t < 1.7;
  const picker = ask && t >= 3.1 && t < 4.5;
  return (
    <div className="composer-area" style={{ bottom: keyboard ? 270 : 0 }}>
      {picker ? (
        <div className="photo-picker">
          <TileImage height={95} />
          <Tap t={t} at={3.7} />
          <span>Recent</span>
        </div>
      ) : null}
      <div className="composer">
        <div className="attach">+{ask ? <Tap t={t} at={3.1} /> : null}</div>
        <div className="input-text">
          {typing ? (
            question.slice(0, Math.floor(clamp(t, 0.1, 1.4) * question.length))
          ) : (
            <span>Message</span>
          )}
        </div>
        <div className={`send ${typing || picker ? "ready" : ""}`}>
          ↑
          {ask ? (
            <>
              <Tap t={t} at={1.7} />
              <Tap t={t} at={4.4} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export function Keyboard({ t }: { t: number }) {
  if (t >= 2.2) return null;
  return (
    <div className="keyboard">
      <div className="suggestions">
        <span>tile</span>
        <span>bathroom</span>
        <span>floor</span>
      </div>
      {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((r, i) => (
        <div className="key-row" key={r}>
          {i === 2 ? <span className="key extra">⇧</span> : null}
          {r.split("").map((k) => (
            <span className="key" key={k}>
              {k}
            </span>
          ))}
          {i === 2 ? <span className="key extra">⌫</span> : null}
        </div>
      ))}
      <div className="key-row">
        <span className="key extra">123</span>
        <span className="key space">space</span>
        <span className="key extra">return</span>
      </div>
    </div>
  );
}
