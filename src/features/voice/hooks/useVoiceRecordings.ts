import { useQuery } from "@tanstack/react-query";

import { voiceRecordingsListQueryOptions } from "../api/voiceQueries";
import type { VoiceRecordingListParams } from "../types/voice.types";

export const useVoiceRecordings = (params: VoiceRecordingListParams) =>
  useQuery(voiceRecordingsListQueryOptions(params));
