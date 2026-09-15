import {useCurrentFrame,useVideoConfig} from 'remotion';
import {concepts,directions} from './shared';
import {Conversation} from './Conversation';
import {Canvas} from './Canvas';
import {Guide} from './Guide';
import {Workspace} from './Workspace';
import {Notebook} from './Notebook';
const scenes=[Conversation,Canvas,Guide,Workspace,Notebook];
export const variantCompositions=directions.flatMap((d,directionIndex)=>concepts.map((c,conceptIndex)=>({id:`${d.id}-${c.id}`,directionIndex,conceptIndex,seconds:c.seconds})));
export function VariantFilm({directionIndex,conceptIndex}:{directionIndex:number;conceptIndex:number}){const t=useCurrentFrame()/useVideoConfig().fps;const Scene=scenes[directionIndex];return <Scene concept={concepts[conceptIndex]} t={t}/>;}
