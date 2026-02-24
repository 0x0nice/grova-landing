"use client";

import { useContext } from "react";
import { TrackContext } from "@/providers/track-provider";

export function useTrack() {
  return useContext(TrackContext);
}
