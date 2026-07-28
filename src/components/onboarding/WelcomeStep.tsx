import React from "react";
import { useTranslation } from "react-i18next";
import DiapasonLogo from "../icons/DiapasonLogo";

interface WelcomeStepProps {
  onStart: () => void;
}

/**
 * Primer paso del onboarding (bloque 1c del sistema de diseño).
 *
 * Es la primerísima pantalla tras instalar, así que hace tres trabajos:
 *
 * 1. Presenta la marca.
 * 2. Dice el argumento del producto con todas las letras — que nada sale del
 *    equipo. Es lo que diferencia a Diapasón y conviene decirlo antes que nada.
 * 3. Avisa de que la app no está firmada por Apple y de cómo abrirla.
 *    Parece raro decirlo DENTRO de la app —si la estás viendo, ya la abriste—
 *    pero convierte un susto ("macOS dice que está dañada") en una decisión
 *    informada, y le da al usuario la frase exacta para pasársela a otro.
 */
export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-7 px-8">
      <DiapasonLogo size={40} />

      <p className="max-w-[420px] text-center text-[13.5px] leading-relaxed text-fg">
        {t("onboarding.welcomePitch")}
      </p>

      {/* Las etiquetas técnicas van en monoespaciada: el diseño reserva esa
          tipografía para todo lo medido o declarativo (estados, atajos, cifras). */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.12em] text-fg-muted">
          {t("onboarding.welcomePlatform")}
        </span>
        <span className="border border-border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-fg-muted">
          {t("onboarding.welcomeUnsigned")}
        </span>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="cursor-pointer bg-accent px-6 py-2 text-[13px] text-white transition-opacity hover:opacity-90"
      >
        {t("onboarding.welcomeStart")}
      </button>
    </div>
  );
};

export default WelcomeStep;
