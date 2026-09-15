import type {CSSProperties,ReactNode} from 'react';
import {AbsoluteFill,Freeze,Img,OffthreadVideo,staticFile} from 'remotion';
import {settle,clamp} from '../ui';
import catalog from './catalog.json';
import './shared.css';
export {settle,clamp};
export type Asset='room'|'sample'|'entry'|'pendant';
export type Direction='conversation'|'canvas'|'guide'|'workspace'|'notebook';
export type Concept={id:string;index:number;slug:string;title:string;question:string;asset:Asset;video?:'room'|'sample';source:string;rows:{label:string;value:string}[];action:string;result:string;detail:string;status:'confirmed'|'pending'|'draft';ux:string[];seconds:number};
export const concepts=catalog.concepts as Concept[];
export const directions=catalog.directions;
export type SceneProps={concept:Concept;t:number};
export type Point={at:number;x:number;y:number;press?:boolean;hold?:number};
export function move(t:number,start:number,duration:number){const p=clamp(t,start,start+duration);return p*p*(3-2*p);}
export function Pointer({t,path}:{t:number;path:Point[]}){let i=0;while(i<path.length-1&&t>=path[i+1].at)i++;const a=path[i],b=path[Math.min(i+1,path.length-1)],p=a===b?1:move(t,a.at,b.at-a.at);const down=path.some(k=>k.press&&t>=k.at&&t<k.at+(k.hold??.2));return <div className="variant-pointer" data-cursor="true" data-pressed={down} style={{left:a.x+(b.x-a.x)*p,top:a.y+(b.y-a.y)*p,transform:`translate(-50%,-50%) scale(${down?.8:1})`,background:down?'rgba(39,48,58,.55)':'rgba(255,255,255,.6)'}}/>;}
export function Frame({direction,concept,t,path,children}:{direction:Direction;concept:Concept;t:number;path:Point[];children:ReactNode}){return <AbsoluteFill className={`variant-root v-${direction}`} data-concept={concept.id} data-direction={direction} data-time={t}><div className="variant-label"><span>TAKEOFF / {directions.find(d=>d.id===direction)?.name}</span><span>{String(concept.index+1).padStart(2,'0')} / {concept.title}</span></div>{children}<div className="variant-disclosure">INTERACTION STUDY · SYNTHETIC PROJECT CONTENT</div><Pointer t={t} path={path}/></AbsoluteFill>;}
export function Reveal({t,at=0,children,style,className}:{t:number;at?:number;children:ReactNode;style?:CSSProperties;className?:string}){const p=settle(t,at,.32);return <div className={className} style={{opacity:p,transform:`translateY(${(1-p)*12}px)`,...style}}>{children}</div>;}
export function Media({asset,video,t=0,width='100%',height=220,style}:{asset:Asset;video?:'room'|'sample';t?:number;width?:number|string;height?:number;style?:CSSProperties}){const css:CSSProperties={width,height,display:'block',objectFit:'cover',borderRadius:12,...style};return video?<div style={{width,height,overflow:'hidden',borderRadius:css.borderRadius}}><Freeze frame={Math.min(145,Math.max(0,Math.round(t*30)))}><OffthreadVideo muted src={staticFile(`prototype-assets/${video}.mp4`)} style={css}/></Freeze></div>:<Img src={staticFile(`prototype-assets/${asset}.png`)} style={css}/>;}
export function Unknown({label='Not confirmed'}:{label?:string}){return <span className="variant-unknown" aria-label={label}/>;}
export function Action({children,style,active=false,target}:{children:ReactNode;style?:CSSProperties;active?:boolean;target?:string}){return <div className={`variant-action${active?' is-active':''}`} data-target={target} style={style}>{children}</div>;}
export function Facts({rows,style}:{rows:Concept['rows'];style?:CSSProperties}){return <div className="variant-facts" style={style}>{rows.map(row=><div className="variant-fact" key={row.label}><span>{row.label}</span><strong>{row.value||<Unknown/>}</strong></div>)}</div>;}
