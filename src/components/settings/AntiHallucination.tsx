import React from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useSettings } from "../../hooks/useSettings";

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

  return (
    <ToggleSwitch
      checked={enabled}
      onChange={(enabled) => updateSetting("anti_hallucination", enabled)}
      isUpdating={isUpdating("anti_hallucination")}
      label={t("settings.advanced.antiHallucination.title")}
      description={t("settings.advanced.antiHallucination.description")}
      descriptionMode={descriptionMode}
      grouped={grouped}
    />
  );
};
