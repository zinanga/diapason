import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TranscriptionProfile } from "@/bindings";
import { useSettings } from "../../../hooks/useSettings";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { SettingContainer } from "../../ui/SettingContainer";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { ToggleSwitch } from "../../ui/ToggleSwitch";
import { Dropdown, DropdownOption } from "../../ui/Dropdown";
import { ShortcutInput } from "../ShortcutInput";
import { SELECTABLE_LANGUAGES } from "../../../lib/constants/languages";

interface ProfileCardProps {
  profile: TranscriptionProfile;
  onChange: (profile: TranscriptionProfile) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onChange,
  onDelete,
  isUpdating,
}) => {
  const { t } = useTranslation();
  const { getSetting } = useSettings();
  const prompts = getSetting("post_process_prompts") ?? [];
  const [name, setName] = useState(profile.name);

  // Keep the local name in sync if the profile changes externally
  // (e.g. settings refresh from the backend).
  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(profile.name);
      return;
    }
    if (trimmed !== profile.name) {
      onChange({ ...profile, name: trimmed });
    }
  };

  const languageOptions: DropdownOption[] = [
    { value: "", label: t("settings.profiles.useGlobalLanguage") },
    ...SELECTABLE_LANGUAGES.map((language) => ({
      value: language.value,
      label: language.label,
    })),
  ];

  const promptOptions: DropdownOption[] = [
    { value: "", label: t("settings.profiles.defaultPrompt") },
    ...prompts.map((prompt) => ({ value: prompt.id, label: prompt.name })),
  ];

  return (
    <SettingsGroup title={profile.name}>
      <SettingContainer
        title={t("settings.profiles.name")}
        description={t("settings.profiles.nameDescription")}
        descriptionMode="tooltip"
        grouped={true}
      >
        <Input
          type="text"
          variant="compact"
          className="min-w-[200px]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          disabled={isUpdating}
        />
      </SettingContainer>

      <SettingContainer
        title={t("settings.profiles.language")}
        description={t("settings.profiles.languageDescription")}
        descriptionMode="tooltip"
        grouped={true}
      >
        <Dropdown
          options={languageOptions}
          selectedValue={profile.language}
          onSelect={(value) => onChange({ ...profile, language: value })}
          placeholder={t("settings.profiles.useGlobalLanguage")}
          disabled={isUpdating}
        />
      </SettingContainer>

      <ToggleSwitch
        checked={profile.post_process}
        onChange={(checked) => onChange({ ...profile, post_process: checked })}
        isUpdating={isUpdating}
        label={t("settings.profiles.postProcess")}
        description={t("settings.profiles.postProcessDescription")}
        descriptionMode="tooltip"
        grouped={true}
      />

      {profile.post_process && (
        <SettingContainer
          title={t("settings.profiles.prompt")}
          description={t("settings.profiles.promptDescription")}
          descriptionMode="tooltip"
          grouped={true}
        >
          <Dropdown
            options={promptOptions}
            selectedValue={profile.prompt_id ?? ""}
            onSelect={(value) =>
              onChange({ ...profile, prompt_id: value === "" ? null : value })
            }
            placeholder={t("settings.profiles.defaultPrompt")}
            disabled={isUpdating}
          />
        </SettingContainer>
      )}

      <ToggleSwitch
        checked={profile.translate_to_english}
        onChange={(checked) =>
          onChange({ ...profile, translate_to_english: checked })
        }
        isUpdating={isUpdating}
        label={t("settings.profiles.translateToEnglish")}
        description={t("settings.profiles.translateToEnglishDescription")}
        descriptionMode="tooltip"
        grouped={true}
      />

      <ShortcutInput
        descriptionMode="tooltip"
        grouped={true}
        shortcutId={`profile:${profile.id}`}
      />

      <div className="flex justify-end px-4 p-2">
        <Button
          variant="danger-ghost"
          size="sm"
          onClick={() => onDelete(profile.id)}
          disabled={isUpdating}
        >
          {t("settings.profiles.delete")}
        </Button>
      </div>
    </SettingsGroup>
  );
};

export const ProfilesSettings: React.FC = () => {
  const { t } = useTranslation();
  const { getSetting, updateSetting, refreshSettings, isUpdating } =
    useSettings();
  const profiles = getSetting("transcription_profiles") ?? [];
  const updating = isUpdating("transcription_profiles");

  // Adding or removing a profile also mutates the bindings map on the
  // backend (each profile gets a `profile:<id>` shortcut binding), so we
  // refetch settings after the write to pick up the new bindings.
  const saveProfiles = async (
    newProfiles: TranscriptionProfile[],
    refetch = false,
  ) => {
    await updateSetting("transcription_profiles", newProfiles);
    if (refetch) {
      await refreshSettings();
    }
  };

  const handleAdd = () => {
    const newProfile: TranscriptionProfile = {
      id: crypto.randomUUID(),
      name: t("settings.profiles.defaultName"),
      language: "",
      post_process: false,
      prompt_id: null,
      translate_to_english: false,
    };
    saveProfiles([...profiles, newProfile], true);
  };

  const handleChange = (updated: TranscriptionProfile) => {
    saveProfiles(
      profiles.map((profile) =>
        profile.id === updated.id ? updated : profile,
      ),
    );
  };

  const handleDelete = (id: string) => {
    saveProfiles(
      profiles.filter((profile) => profile.id !== id),
      true,
    );
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <div className="px-4">
        <p className="text-sm text-mid-gray">
          {t("settings.profiles.description")}
        </p>
      </div>

      {profiles.length === 0 && (
        <div className="px-4 py-8 text-sm text-mid-gray text-center border border-mid-gray/20 rounded-lg">
          {t("settings.profiles.empty")}
        </div>
      )}

      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onChange={handleChange}
          onDelete={handleDelete}
          isUpdating={updating}
        />
      ))}

      <div className="flex justify-center">
        <Button
          variant="primary"
          size="md"
          onClick={handleAdd}
          disabled={updating}
        >
          {t("settings.profiles.add")}
        </Button>
      </div>
    </div>
  );
};
