from faster_whisper import WhisperModel

print("Loading AI model...")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

print("Model Loaded Successfully!")

segments, info = model.transcribe(
    "doctor-recording.webm",
    language="en",
    beam_size=5
)

print("Detected Language:", info.language)

print("\nTranscript\n")

for segment in segments:
    print(segment.text)