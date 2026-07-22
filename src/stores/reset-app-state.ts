import { useArchiveStore } from "./archive-store";
import { useBizStore } from "./biz-store";
import { useDoneStore } from "./done-store";
import { useInboxStore } from "./inbox-store";
import { useProjectStore } from "./project-store";

/** Clear every tenant-owned client cache at an authentication boundary. */
export function resetAppState() {
  useInboxStore.getState().reset();
  useDoneStore.getState().reset();
  useArchiveStore.getState().reset();
  useBizStore.getState().reset();
  useProjectStore.getState().reset();
}
