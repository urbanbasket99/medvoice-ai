from pathlib import Path
from uuid import UUID

from app.core.config import get_settings
from app.modules.transcriptions.application.services.audio_storage_service import AudioStorageService


class FileAudioStorageService(AudioStorageService):
    def __init__(self, base_dir: Path | None = None) -> None:
        settings = get_settings()
        self._base_dir = base_dir or Path(settings.transcription_audio_dir)
        self._base_dir.mkdir(parents=True, exist_ok=True)

    def _build_path(self, transcription_id: UUID, file_name: str) -> Path:
        safe_name = file_name.replace("\\", "_").replace("/", "_")
        return self._base_dir / f"{transcription_id}_{safe_name}"

    async def save(self, transcription_id: UUID, file_name: str, content: bytes) -> tuple[str, int]:
        path = self._build_path(transcription_id, file_name)
        path.write_bytes(content)
        return str(path.resolve()), len(content)

    def resolve(self, storage_path: str) -> str:
        path = Path(storage_path)
        if not path.is_file():
            raise FileNotFoundError(storage_path)
        return str(path.resolve())

    def delete(self, storage_path: str) -> None:
        path = Path(storage_path)
        if path.is_file():
            path.unlink(missing_ok=True)
