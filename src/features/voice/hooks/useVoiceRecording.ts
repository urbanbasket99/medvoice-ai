import { useQuery } from "@tanstack/react-query";

import { voiceRecordingDetailQueryOptions } from "../api/voiceQueries";

export const useVoiceRecording = (id: string | undefined) => useQuery(voiceRecordingDetailQueryOptions(id));
