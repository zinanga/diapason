import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TranscriptionProfile } from "@/bindings";
import { useSettings } from "../../../hooks/useSettings";
import { Input } from "../../ui/Input";
import { ToggleSwitch } from "../../ui/ToggleSwitch";
import { Dropdown, DropdownOption } from "../../ui/Dropdown";
import { ShortcutInput } from "../ShortcutInput";
import { SELECTABLE_LANGUAGES } from "../../../lib/constants/languages";

/**
 * Perfiles: maestro-detalle a sangre.
 *
 * Con la barra lateral, la pantalla son tres columnas pegadas y separadas por
 * líneas de 1 px — no tarjetas flotantes. El diseño no usa sombras: la jerarquía
 * la dan los bordes y los cambios de superficie (ver src/styles/theme.css).
 *
 * Solo se muestran campos con datos reales detrás. El mockup incluía métricas
 * por perfil (dictados, WER) que hoy no existen en el backend, así que no se
 * pintan: una cifra inventada en una demo es peor que un hueco.
 */

/** Etiqueta corta que resume el perfil en la lista: idioma y qué hace. */
const useProfileSummary = () => {
  const { t } = useTranslation();
  return (profile: TranscriptionProfile) => {
    const lang = profile.language
      ? profile.language.toUpperCase()
      : t("settings.profiles.badgeGlobal");
    const flags: string[] = [];
    if (profile.translate_to_english)
      flags.push(t("settings.profiles.badgeTranslate"));
    if (profile.post_process)
      flags.push(t("settings.profiles.badgePostProcess"));
    return [lang, ...flags].join(" · ");
  };
};

interface RowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

/** Fila del detalle: etiqueta a un lado, control al otro, separadas por línea. */
const Row: React.FC<RowProps> = ({ label, description, children }) => (
  <div className="flex items-start justify-between gap-6 border-b border-border px-6 py-4">
    <div className="min-w-0 max-w-[46%]">
      <p className="text-[13px] text-fg">{label}</p>
      {description && (
        <p className="mt-1 text-[11.5px] leading-snug text-fg-muted">
          {description}
        </p>
      )}
    </div>
    <div className="flex shrink-0 items-center gap-3">{children}</div>
  </div>
);

interface ProfileDetailProps {
  profile: TranscriptionProfile;
  onChange: (profile: TranscriptionProfile) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({
  profile,
  onChange,
  onDelete,
  isUpdating,
}) => {
  const { t } = useTranslation();
  const { getSetting } = useSettings();
  const prompts = getSetting("post_process_prompts") ?? [];
  const [name, setName] = useState(profile.name);
  const summary = useProfileSummary();

  useEffect(() => setName(profile.name), [profile.name, profile.id]);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) return setName(profile.name);
    if (trimmed !== profile.name) onChange({ ...profile, name: trimmed });
  };

  const languageOptions: DropdownOption[] = [
    { value: "", label: t("settings.profiles.useGlobalLanguage") },
    ...SELECTABLE_LANGUAGES.map((l) => ({ value: l.value, label: l.label })),
  ];

  const promptOptions: DropdownOption[] = [
    { value: "", label: t("settings.profiles.defaultPrompt") },
    ...prompts.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-6 py-5">
        <h2 className="text-[17px] font-medium tracking-tight text-fg">
          {profile.name}
        </h2>
        <p className="mt-1.5 font-mono text-[10.5px] tracking-[0.08em] text-fg-muted">
          {summary(profile)}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto">
        <Row label={t("settings.profiles.name")}>
          <Input
            type="text"
            variant="compact"
            className="min-w-[240px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            disabled={isUpdating}
          />
        </Row>

        <div className="border-b border-border">
          <ShortcutInput grouped={true} shortcutId={`profile:${profile.id}`} />
        </div>

        <Row label={t("settings.profiles.language")}>
          <Dropdown
            options={languageOptions}
            selectedValue={profile.language}
            onSelect={(value) => onChange({ ...profile, language: value })}
            placeholder={t("settings.profiles.useGlobalLanguage")}
            disabled={isUpdating}
          />
        </Row>

        <Row
          label={t("settings.profiles.translateToEnglish")}
          description={t("settings.profiles.translateToEnglishDescription")}
        >
          <ToggleSwitch
            checked={profile.translate_to_english}
            onChange={(checked) =>
              onChange({ ...profile, translate_to_english: checked })
            }
            isUpdating={isUpdating}
            label=""
            description=""
          />
        </Row>

        <Row
          label={t("settings.profiles.postProcess")}
          description={t("settings.profiles.postProcessDescription")}
        >
          <ToggleSwitch
            checked={profile.post_process}
            onChange={(checked) =>
              onChange({ ...profile, post_process: checked })
            }
            isUpdating={isUpdating}
            label=""
            description=""
          />
        </Row>

        {profile.post_process && (
          <Row
            label={t("settings.profiles.prompt")}
            description={t("settings.profiles.promptDescription")}
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
          </Row>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-border px-6 py-4">
        <button
          type="button"
          className="cursor-pointer text-[13px] text-danger transition-opacity hover:opacity-70 disabled:opacity-40"
          onClick={() => onDelete(profile.id)}
          disabled={isUpdating}
        >
          {t("settings.profiles.delete")}
        </button>
        <p className="text-[11.5px] text-fg-muted">
          {t("settings.profiles.savedOnType")}
        </p>
      </footer>
    </div>
  );
};

export const ProfilesSettings: React.FC = () => {
  const { t } = useTranslation();
  const { getSetting, updateSetting, refreshSettings, isUpdating } =
    useSettings();
  const profiles = getSetting("transcription_profiles") ?? [];
  const updating = isUpdating("transcription_profiles");
  const summary = useProfileSummary();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    profiles.find((p) => p.id === selectedId) ?? profiles[0] ?? null;

  // Añadir o borrar un perfil también muta el mapa de atajos en el backend
  // (cada perfil tiene su binding `profile:<id>`), así que hay que refrescar.
  const saveProfiles = async (
    newProfiles: TranscriptionProfile[],
    refetch = false,
  ) => {
    await updateSetting("transcription_profiles", newProfiles);
    if (refetch) await refreshSettings();
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
    setSelectedId(newProfile.id);
    saveProfiles([...profiles, newProfile], true);
  };

  const handleChange = (updated: TranscriptionProfile) =>
    saveProfiles(profiles.map((p) => (p.id === updated.id ? updated : p)));

  const handleDelete = (id: string) => {
    if (selectedId === id) setSelectedId(null);
    saveProfiles(
      profiles.filter((p) => p.id !== id),
      true,
    );
  };

  return (
    <div className="flex h-full">
      {/* Columna: lista de perfiles */}
      <div className="flex w-72 shrink-0 flex-col border-e border-border">
        <header className="border-b border-border px-5 py-5">
          <h2 className="text-[15px] font-medium tracking-tight text-fg">
            {t("settings.profiles.title")}
          </h2>
          <p className="mt-1.5 text-[12px] leading-snug text-fg-muted">
            {t("settings.profiles.description")}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          {profiles.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12.5px] text-fg-muted">
              {t("settings.profiles.empty")}
            </p>
          ) : (
            profiles.map((profile) => {
              const isActive = selected?.id === profile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedId(profile.id)}
                  className={`flex w-full cursor-pointer items-start gap-2.5 border-b border-border px-5 py-3.5 text-start transition-colors ${
                    isActive ? "bg-bg-selected" : "hover:bg-bg-surface"
                  }`}
                >
                  <span
                    className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                      isActive ? "bg-accent" : "bg-fg-muted/40"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-fg">
                      {profile.name}
                    </span>
                    <span className="mt-1 block truncate font-mono text-[10px] tracking-[0.08em] text-fg-muted">
                      {summary(profile)}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={updating}
            className="w-full cursor-pointer border border-border bg-bg-surface px-3 py-2 text-[12.5px] text-fg transition-colors hover:border-accent disabled:opacity-40"
          >
            {t("settings.profiles.add")}
          </button>
        </div>
      </div>

      {/* Columna: detalle del perfil seleccionado */}
      <div className="min-w-0 flex-1">
        {selected ? (
          <ProfileDetail
            key={selected.id}
            profile={selected}
            onChange={handleChange}
            onDelete={handleDelete}
            isUpdating={updating}
          />
        ) : (
          <p className="px-6 py-10 text-[12.5px] text-fg-muted">
            {t("settings.profiles.selectPrompt")}
          </p>
        )}
      </div>
    </div>
  );
};
