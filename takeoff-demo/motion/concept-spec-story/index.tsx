import React from "react";
import { Composition, registerRoot } from "remotion";
import { SpecStory, SPEC_STORY_TOTAL_FRAMES } from "./SpecStory";

const FPS = 30;

const Root: React.FC = () => (
  <Composition
    id="SpecStory"
    component={SpecStory}
    durationInFrames={SPEC_STORY_TOTAL_FRAMES}
    fps={FPS}
    width={1280}
    height={720}
  />
);

registerRoot(Root);
