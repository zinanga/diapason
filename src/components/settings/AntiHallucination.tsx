import React from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useSettings } from "../../hooks/useSettings";
import { useModelIsWhisper } from "../../hooks/useModelIsWhisper";

interface AntiHallucinationProps {
  descriptionMode?: "tooltip" | "inline";
  grouped?: boolean;
}

export const AntiHallucination: React.FC<AntiHallucinationProps> = ({
  descriptionMode = "tooltip",
  grouped = false,
}) => {
  const { t } = useTranslation();
  const { getSetting, updateSetting, isUpdating } = useSettings();
  const enabled = getSetting("anti_hallucination") ?? true;
  const isWhisper = useModelIsWhisper();

  // `null` = todavía no se sabe (modelo aún sin cargar). Solo se desactiva ante
  // un `false` explícito, para no bloquear el ajuste durante el arranque.
  const unsupported = isWhisper === false;

  return (
    <ToggleSwitch
      checked={enabled}
      onChange={(enabled) => updateSetting("anti_hallucination", enabled)}
      isUpdating={isUpdating("anti_hallucination")}
      disabled={unsupported}
      label={t("settings.advanced.antiHallucination.title")}
      description={
        unsupported
          ? t("settings.advanced.whisperOnly")
          : t("settings.advanced.antiHallucination.description")
      }
      descriptionMode={unsupported ? "inline" : descriptionMode}
      grouped={grouped}
    />
  );
};
