import { useCurrentFrame, useVideoConfig } from "remotion";
import { Capture, NextPrompt, Recall, SiteWalk } from "./ContextScenes";
import { Quantity, Sample, Quote, Clearance, LeadTime } from "./DecisionScenes";
import {
  Substitution,
  Signoff,
  Delivery,
  InstallerPack,
  Receipt,
} from "./HandoffScenes";
export const prototypes = [
  {
    id: "RoomToSpec",
    slug: "01-room-to-spec",
    title: "A room becomes a Spec",
    seconds: 12,
    scene: Capture,
  },
  {
    id: "NextPrompt",
    slug: "02-next-useful-question",
    title: "The next useful question",
    seconds: 9,
    scene: NextPrompt,
  },
  {
    id: "Recall",
    slug: "03-recall-the-decision",
    title: "Recall the decision",
    seconds: 10,
    scene: Recall,
  },
  {
    id: "SiteWalk",
    slug: "04-walkthrough-in-context",
    title: "Keep the walkthrough in context",
    seconds: 10,
    scene: SiteWalk,
  },
  {
    id: "Quantity",
    slug: "05-layout-changes-the-order",
    title: "Layout changes the order",
    seconds: 12,
    scene: Quantity,
  },
  {
    id: "Sample",
    slug: "06-sample-in-daylight",
    title: "Judge the sample in daylight",
    seconds: 10,
    scene: Sample,
  },
  {
    id: "Quote",
    slug: "07-words-become-a-field",
    title: "Installer words become a field",
    seconds: 10,
    scene: Quote,
  },
  {
    id: "Clearance",
    slug: "08-confirm-the-clearance",
    title: "Confirm—not guess—the clearance",
    seconds: 10,
    scene: Clearance,
  },
  {
    id: "LeadTime",
    slug: "09-see-the-schedule-risk",
    title: "See the schedule risk",
    seconds: 12,
    scene: LeadTime,
  },
  {
    id: "SubstitutionShort",
    slug: "10-compare-with-an-unknown",
    title: "Compare with an honest unknown",
    seconds: 12,
    scene: Substitution,
  },
  {
    id: "Signoff",
    slug: "11-two-kinds-of-approval",
    title: "Two kinds of approval",
    seconds: 12,
    scene: Signoff,
  },
  {
    id: "Delivery",
    slug: "12-the-last-four-steps",
    title: "The last four steps",
    seconds: 10,
    scene: Delivery,
  },
  {
    id: "InstallerPack",
    slug: "13-handoff-with-evidence",
    title: "Handoff with the evidence",
    seconds: 10,
    scene: InstallerPack,
  },
  {
    id: "Receipt",
    slug: "14-after-the-order",
    title: "Keep evidence after the order",
    seconds: 12,
    scene: Receipt,
  },
];
export function PrototypeFilm({ index }: { index: number }) {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const Scene = prototypes[index].scene;
  return <Scene t={t} />;
}
