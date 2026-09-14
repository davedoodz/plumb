import "./index.css";
import { Composition } from "remotion";
import { TakeoffFilm, SubstitutionFilm } from "./Composition";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Takeoff"
      component={TakeoffFilm}
      durationInFrames={2250}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="Substitution"
      component={SubstitutionFilm}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
