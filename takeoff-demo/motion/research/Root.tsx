import { Composition } from "remotion";
import { ResearchSummaryFilm } from "./Film";
import { FILM_DURATION } from "./content";
import { FPS, H, W } from "./theme";

// Standalone Remotion root for the research-summary motion asset.
// Deliberately isolated from src/Root.tsx so this render never touches the
// shared composition registry.
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ResearchSummary"
    component={ResearchSummaryFilm}
    durationInFrames={FILM_DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
