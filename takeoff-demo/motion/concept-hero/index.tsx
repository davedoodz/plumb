import React from "react";
import { Composition, registerRoot } from "remotion";
import { Hero } from "./Hero";

const FPS = 30;
const DURATION_SECONDS = 6;

const Root: React.FC = () => (
  <Composition
    id="Hero"
    component={Hero}
    durationInFrames={FPS * DURATION_SECONDS}
    fps={FPS}
    width={1280}
    height={720}
  />
);

registerRoot(Root);
