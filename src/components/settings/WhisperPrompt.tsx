import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../hooks/useSettings";
import { useModelIsWhisper } from "../../hooks/useModelIsWhisper";
import { SettingContainer } from "../ui/SettingContainer";
import { Textarea } from "../ui/Textarea";

interface WhisperPromptProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const WhisperPrompt: React.FC<WhisperPromptProps> = ({
  descriptionMode = "tooltip",
  grouped = false,
}) => {
  const { t } = useTranslation();
  const { getSetting, updateSetting, isUpdating } = useSettings();
  const storedPrompt = getSetting("whisper_initial_prompt") ?? "";
  const [prompt, setPrompt] = useState(storedPrompt);
  const isWhisper = useModelIsWhisper();

  // Keep local state in sync when the setting changes externally
  // (e.g. backend refresh or reset).
  useEffect(() => {
    setPrompt(storedPrompt);
  }, [storedPrompt]);

  const handleBlur = () => {
    if (prompt !== storedPrompt) {
      updateSetting("whisper_initial_prompt", prompt);
    }
  };

  // `null` = todavía no se sabe (modelo aún sin cargar). Solo se desactiva ante
  // un `false` explícito, para no bloquear el campo durante el arranque.
  const unsupported = isWhisper === false;

  return (
    <SettingContainer
      title={t("settings.advanced.whisperPrompt.title")}
      description={
        unsupported
          ? t("settings.advanced.whisperOnly")
          : t("settings.advanced.whisperPrompt.description")
      }
      descriptionMode={unsupported ? "inline" : descriptionMode}
      grouped={grouped}
      layout="stacked"
    >
      <Textarea
        className="w-full"
        variant="compact"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onBlur={handleBlur}
        placeholder={t("settings.advanced.whisperPrompt.placeholder")}
        disabled={unsupported || isUpdating("whisper_initial_prompt")}
      />
    </SettingContainer>
  );
};
