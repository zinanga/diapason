import { useTranslation } from "react-i18next";

interface DiapasonLogoProps {
  className?: string;
  /** Solo el glifo, sin el texto. Para la bandeja o espacios estrechos. */
  markOnly?: boolean;
  /** Lado del glifo en px. El texto no escala con él. */
  size?: number;
}

/**
 * Marca de Diapasón: el glifo del diapasón más el logotipo en dos líneas.
 *
 * El glifo sale tal cual del sistema de diseño ("Diapasón UI"): horquilla y caña
 * del MISMO color, el del texto. Es monocromo a propósito — en las pantallas del
 * diseño no aparece el ámbar de marca por ningún lado. El ámbar solo existe en el
 * icono de la app; aquí no.
 *
 * El lema va en monoespaciada con mucho tracking, también según el diseño: es lo
 * que le da el aire de instrumento de precisión frente a una tipografía de UI.
 */
export const DiapasonLogo = ({
  className = "",
  markOnly = false,
  size = 28,
}: DiapasonLogoProps) => {
  const { t } = useTranslation();

  const mark = (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M20 8 L20 34 A12 12 0 0 0 44 34 L44 8"
        fill="none"
        stroke="var(--fg)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M32 46 L32 58"
        fill="none"
        stroke="var(--fg)"
        strokeWidth={7}
        strokeLinecap="round"
      />
    </svg>
  );

  if (markOnly) {
    return (
      <span className={className} role="img" aria-label={t("brand.name")}>
        {mark}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      role="img"
      aria-label={t("brand.name")}
    >
      {mark}
      {/* min-w-0 deja que el texto se trunque antes que envolver: el logotipo
          debe ocupar dos líneas exactas, nunca tres. */}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[15px] font-medium tracking-[-0.02em] text-fg">
          {t("brand.name")}
        </span>
        <span className="mt-[5px] truncate font-mono text-[9px] tracking-[0.14em] text-fg-muted">
          {t("brand.tagline")}
        </span>
      </span>
    </div>
  );
};

export default DiapasonLogo;
