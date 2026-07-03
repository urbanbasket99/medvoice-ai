from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import shutil
import os

app = FastAPI(title="MedVoice AI")

print("Loading Whisper Model...")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

print("Whisper Loaded Successfully!")

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "MedVoice AI Running"
    }


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):

    filepath = os.path.join(UPLOAD_FOLDER, audio.filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    segments, info = model.transcribe(
        filepath,
        language="en",
        beam_size=5
    )

    transcript = ""

    for segment in segments:
        transcript += segment.text + " "

    return {
        "language": info.language,
        "transcript": transcript.strip()
    }