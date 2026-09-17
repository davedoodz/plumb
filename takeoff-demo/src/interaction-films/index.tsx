import { Composition, registerRoot } from "remotion";
import { CaptureFilm, PromptFilm, WalkthroughFilm } from "./CaptureFilms";
import {
  RecallFilm,
  QuoteFilm,
  LeadtimeFilm,
  SignoffFilm,
} from "./DecisionFilms";
import {
  SampleFilm,
  DeliveryFilm,
  InstallerpackFilm,
  ReceiptFilm,
} from "./HandoffFilms";
import { QuantityFilm, ClearanceFilm, SubstitutionFilm } from "./SpatialFilms";
const films = {
  capture: CaptureFilm,
  prompt: PromptFilm,
  recall: RecallFilm,
  walkthrough: WalkthroughFilm,
  quantity: QuantityFilm,
  sample: SampleFilm,
  quote: QuoteFilm,
  clearance: ClearanceFilm,
  leadtime: LeadtimeFilm,
  substitution: SubstitutionFilm,
  signoff: SignoffFilm,
  delivery: DeliveryFilm,
  installerpack: InstallerpackFilm,
  receipt: ReceiptFilm,
};
function FilmRoot() {
  return (
    <>
      {Object.entries(films).map(([id, component]) => (
        <Composition
          key={id}
          id={`Interaction-${id}`}
          component={component}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
    </>
  );
}
registerRoot(FilmRoot);
