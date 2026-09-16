import "./index.css";
import { Composition } from "remotion";
import { TakeoffFilm, SubstitutionFilm } from "./Composition";
import { ChatVariantFilm } from "./chat/ChatVariants";
import { PrototypeFilm, prototypes } from "./prototypes/Collection";
import {VariantFilm,variantCompositions} from "./variants/Variants";
import {ConversationStudy, conversationStudies} from './chatgpt-studies/ConversationStudy';

export const RemotionRoot: React.FC = () => (
  <>
    {conversationStudies.map(study=><Composition key={study.id} id={study.id} component={ConversationStudy} durationInFrames={480} fps={30} width={1080} height={1920} defaultProps={{study}}/>)}
    {variantCompositions.map(v=><Composition key={v.id} id={v.id} component={VariantFilm} defaultProps={{directionIndex:v.directionIndex,conceptIndex:v.conceptIndex}} durationInFrames={v.seconds*30} fps={30} width={1080} height={1080}/>)}
    {prototypes.map((p, index) => (
      <Composition
        key={p.id}
        id={p.id}
        component={PrototypeFilm}
        defaultProps={{ index }}
        durationInFrames={p.seconds * 30}
        fps={30}
        width={1080}
        height={1080}
      />
    ))}
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
    <Composition
      id="TakeoffChatGPT"
      component={ChatVariantFilm}
      defaultProps={{ variant: "chatgpt" as const }}
      durationInFrames={1740}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="TakeoffClaude"
      component={ChatVariantFilm}
      defaultProps={{ variant: "claude" as const }}
      durationInFrames={1740}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
