import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../hooks/useSettings";
import { formatKeyCombination } from "../../lib/utils/keyboard";

interface ReadyStepProps {
  onFinish: () => void;
}

/**
 * Último paso del onboarding (bloque 1c del sistema de diseño, paso 3 de 3).
 *
 * Enseña CÓMO se usa la app, que es lo que faltaba: hasta ahora el onboarding
 * terminaba tras conceder permisos y el usuario se quedaba sin saber qué tecla
 * pulsar. Muestra el atajo real (leído de los ajustes, no escrito a mano) y una
 * réplica de la píldora del overlay, para que reconozca lo que va a ver abajo en
 * la pantalla en vez de asustarse la primera vez.
 */
export const ReadyStep: React.FC<ReadyStepProps> = ({ onFinish }) => {
  const { t } = useTranslation();
  const { getSetting } = useSettings();

  // El atajo se lee de los bindings: si el usuario ya lo cambió, aquí sale el
  // suyo. Escribirlo a mano sería mentir en cuanto alguien lo reasigne.
  const bindings = getSetting("bindings");
  const binding = bindings?.["transcribe"]?.current_binding ?? "";
  const shortcut = formatKeyCombination(binding, "macos");

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-7 px-8">
      <p className="text-[15px] font-medium text-fg">
        {t("onboarding.readyTitle")}
      </p>

      {shortcut && (
        <kbd className="border border-border bg-bg-surface px-4 py-2 font-mono text-[15px] tracking-[0.06em] text-fg">
          {shortcut}
        </kbd>
      )}

      <p className="max-w-[440px] text-center text-[13px] leading-relaxed text-fg-muted">
        {t("onboarding.readyBody")}
      </p>

      {/* Réplica estática de la píldora del overlay: mismas piezas (punto ámbar,
          estado en monoespaciada, ondas) para que reconozca lo que verá al
          dictar. No se reutiliza el componente real porque ese vive en otra
          ventana y depende de eventos del backend. */}
      <div className="flex h-10 items-center gap-3 border border-border bg-bg-surface-alt px-3.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="font-mono text-[11px] tracking-[0.12em] text-fg">
          {t("overlay.listening")}
        </span>
        <span className="flex h-[18px] items-end gap-[2px]">
          {[8, 14, 18, 11, 16, 6, 13, 18, 9].map((h, i) => (
            <span
              key={i}
              className="w-[2px] rounded-[1px] bg-brand"
              style={{ height: `${h}px` }}
            />
          ))}
        </span>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="cursor-pointer bg-accent px-6 py-2 text-[13px] text-white transition-opacity hover:opacity-90"
      >
        {t("onboarding.readyFinish")}
      </button>
    </div>
  );
};

export default ReadyStep;
