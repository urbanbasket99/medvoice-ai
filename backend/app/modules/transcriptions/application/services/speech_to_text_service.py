from app.modules.ai.application.interfaces.ai_provider_registry_port import AIProviderRegistryPort
from app.modules.ai.application.interfaces.ai_settings_repository import AiSettingsRepository
from app.modules.ai.domain.entities.ai_entities import SpeechToTextRequest
from app.modules.transcriptions.domain.entities.transcription import TranscriptSegment
from app.modules.transcriptions.domain.exceptions import TranscriptionProcessingError


class SpeechToTextService:
    """Orchestrates speech-to-text through the AI Engine provider abstraction."""

    def __init__(
        self,
        provider_registry: AIProviderRegistryPort,
        settings_repository: AiSettingsRepository,
    ) -> None:
        self._providers = provider_registry
        self._settings = settings_repository

    async def transcribe_file(
        self,
        *,
        file_path: str,
        file_name: str | None,
        audio_format: str | None,
        language: str | None,
    ) -> tuple[str, str, float | None, tuple[TranscriptSegment, ...]]:
        settings = await self._settings.get()
        provider = self._providers.require(settings.active_provider)

        try:
            result = await provider.speech_to_text(
                SpeechToTextRequest(
                    file_path=file_path,
                    file_name=file_name,
                    audio_format=audio_format,
                    language=language,
                    model=settings.whisper_model,
                )
            )
        except Exception as exc:
            raise TranscriptionProcessingError(str(exc)) from exc

        segments = tuple(
            TranscriptSegment(
                index=int(item.get("index", idx)),
                start_seconds=float(item.get("start_seconds") or 0),
                end_seconds=float(item.get("end_seconds") or 0),
                text=str(item.get("text") or ""),
                speaker_label=str(item.get("speaker_label") or "Speaker 1"),
                confidence=item.get("confidence"),
            )
            for idx, item in enumerate(result.segments)
        )
        return result.text, result.model, result.duration_seconds, segments
