import { useTranslation } from "react-i18next";

interface DiapasonLogoProps {
  /** Ancho total del bloque en px. La tipografía no escala con él. */
  width?: number;
  className?: string;
  /** Solo el glifo, sin el texto. Para la bandeja o espacios estrechos. */
  markOnly?: boolean;
}

/**
 * Marca de Diapasón: el glifo del diapasón más el logotipo.
 *
 * El glifo viene del sistema de diseño: horquilla en U con el color del texto y
 * caña en ámbar. El ámbar es el ÚNICO sitio de la app donde ese color aparece —
 * es color de marca, no de interfaz (ver src/styles/theme.css).
 */
export const DiapasonLogo = ({
  width = 160,
  className = "",
  markOnly = false,
}: DiapasonLogoProps) => {
  const { t } = useTranslation();
  const mark = (
    <svg
      viewBox="0 0 64 64"
      width={28}
      height={28}
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M20 14 L20 34 A12 12 0 0 0 44 34 L44 14"
        fill="none"
        stroke="var(--fg)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M32 46 L32 54"
        fill="none"
        stroke="var(--brand)"
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
      className={`flex items-center gap-2.5 ${className}`}
      style={{ width }}
      role="img"
      aria-label={t("brand.name")}
    >
      {mark}
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-medium tracking-tight text-fg">
          {t("brand.name")}
        </span>
        <span className="mt-[3px] text-[9px] font-medium tracking-[0.14em] text-fg-muted">
          {t("brand.tagline")}
        </span>
      </span>
    </div>
  );
};

export default DiapasonLogo;
