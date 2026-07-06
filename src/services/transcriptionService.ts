export const transcribeAudio = async (audioBlob: Blob) => {
  const formData = new FormData();

  formData.append("audio", audioBlob, "doctor-recording.webm");

  const response = await fetch("http://127.0.0.1:8000/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Transcription failed");
  }

  return await response.json();
};