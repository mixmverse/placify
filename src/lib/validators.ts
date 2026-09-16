// src/lib/validators.ts
import { z } from "zod";

export const pitchSchema = z.object({
  trackId: z.string().cuid(),
  playlistId: z.string().cuid(),
  message: z.string().optional(),
});

export const decisionSchema = z.object({
  outcome: z.enum(["ACCEPTED", "DECLINED"]),
  feedbackText: z.string().min(10),
});

export const trackSchema = z.object({
  spotifyTrackId: z.string(),
  artistName: z.string(),
  title: z.string(),
});

export const playlistSchema = z.object({
  spotifyPlaylistId: z.string(),
  name: z.string(),
  description: z.string().optional(),
});
