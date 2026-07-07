import { useCallback, useEffect, useRef, useState } from "react";

import type { RecorderPhase } from "../types/voice.types";

const MIME_TYPE = "audio/webm;codecs=opus";
const WAVEFORM_BAR_COUNT = 48;

const pickMimeType = (): string => {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(MIME_TYPE)) {
    return MIME_TYPE;
  }
  return "audio/webm";
};

export const useVoiceRecorder = () => {
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState<number[]>(() => Array(WAVEFORM_BAR_COUNT).fill(0.08));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const accumulatedMsRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopAnalyser = () => {
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setWaveformLevels(Array(WAVEFORM_BAR_COUNT).fill(0.08));
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const revokePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setLocalPreviewUrl(null);
  };

  const cleanup = useCallback(() => {
    clearTimer();
    stopAnalyser();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    stopStream();
    chunksRef.current = [];
    startedAtRef.current = 0;
    accumulatedMsRef.current = 0;
  }, []);

  useEffect(() => () => {
    cleanup();
    revokePreview();
  }, [cleanup]);

  const refreshElapsed = () => {
    const runningMs =
      phase === "recording" && startedAtRef.current > 0 ? performance.now() - startedAtRef.current : 0;
    setElapsedSeconds(Math.floor((accumulatedMsRef.current + runningMs) / 1000));
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = window.setInterval(refreshElapsed, 250);
  };

  const startAnalyser = (stream: MediaStream) => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioContextRef.current = context;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const sliceSize = Math.floor(data.length / WAVEFORM_BAR_COUNT);
      const levels = Array.from({ length: WAVEFORM_BAR_COUNT }, (_, index) => {
        const start = index * sliceSize;
        const end = start + sliceSize;
        let sum = 0;
        for (let i = start; i < end; i += 1) sum += data[i] ?? 0;
        const avg = sum / sliceSize / 255;
        return Math.max(0.08, Math.min(1, avg * 1.8));
      });
      setWaveformLevels(levels);
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
  };

  const beginCapture = async () => {
    setErrorMessage(null);
    revokePreview();
    setAudioBlob(null);
    chunksRef.current = [];
    accumulatedMsRef.current = 0;
    setElapsedSeconds(0);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    startAnalyser(stream);

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setLocalPreviewUrl(url);
      stopAnalyser();
      stopStream();
    };

    recorder.start(250);
    startedAtRef.current = performance.now();
    startTimer();
    setPhase("recording");
  };

  const pauseCapture = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    accumulatedMsRef.current += performance.now() - startedAtRef.current;
    startedAtRef.current = 0;
    clearTimer();
    stopAnalyser();
    refreshElapsed();
    setPhase("paused");
  };

  const resumeCapture = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    if (streamRef.current) startAnalyser(streamRef.current);
    startedAtRef.current = performance.now();
    startTimer();
    setPhase("recording");
  };

  const stopCapture = async (): Promise<{ blob: Blob | null; durationSeconds: number }> => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      if (recorder.state === "recording") {
        accumulatedMsRef.current += performance.now() - startedAtRef.current;
      }
      recorder.stop();
    } else {
      stopAnalyser();
      stopStream();
    }

    clearTimer();
    startedAtRef.current = 0;
    const durationSeconds = Math.max(1, Math.floor(accumulatedMsRef.current / 1000));
    setElapsedSeconds(durationSeconds);
    setPhase("stopped");

    return new Promise((resolve) => {
      window.setTimeout(() => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: pickMimeType() })
          : audioBlob;
        resolve({ blob, durationSeconds });
      }, 150);
    });
  };

  const reset = () => {
    cleanup();
    revokePreview();
    setAudioBlob(null);
    setElapsedSeconds(0);
    setErrorMessage(null);
    setPhase("idle");
  };

  const markUploading = () => setPhase("uploading");
  const markCompleted = () => setPhase("completed");
  const markError = (message: string) => {
    setErrorMessage(message);
    setPhase("error");
  };

  return {
    phase,
    elapsedSeconds,
    waveformLevels,
    errorMessage,
    localPreviewUrl,
    audioBlob,
    beginCapture,
    pauseCapture,
    resumeCapture,
    stopCapture,
    reset,
    markUploading,
    markCompleted,
    markError,
    isRecording: phase === "recording",
    isPaused: phase === "paused",
    isActive: phase === "recording" || phase === "paused",
  };
};
