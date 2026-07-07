from app.modules.ai.application.dto.ai_dto import UpdateAiSettingsInput
from app.modules.ai.application.interfaces.ai_settings_repository import AiSettingsRepository
from app.modules.ai.domain.entities.ai_entities import AiRuntimeSettings


class GetAiSettingsUseCase:
    def __init__(self, settings_repository: AiSettingsRepository) -> None:
        self._settings = settings_repository

    async def execute(self) -> AiRuntimeSettings:
        return await self._settings.get()


class UpdateAiSettingsUseCase:
    def __init__(self, settings_repository: AiSettingsRepository) -> None:
        self._settings = settings_repository

    async def execute(self, data: UpdateAiSettingsInput) -> AiRuntimeSettings:
        return await self._settings.save(
            active_provider=data.active_provider,
            model=data.model,
            temperature=data.temperature,
            max_tokens=data.max_tokens,
        )
