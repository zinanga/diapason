import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "./Tooltip";

interface SettingContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  descriptionMode?: "inline" | "tooltip";
  /**
   * Se acepta por compatibilidad con las decenas de llamadas que lo pasan, pero
   * ya no cambia nada: ningún ajuste se encajona, agrupado o no.
   */
  grouped?: boolean;
  layout?: "horizontal" | "stacked";
  disabled?: boolean;
  tooltipPosition?: "top" | "bottom";
}

export const SettingContainer: React.FC<SettingContainerProps> = ({
  title,
  description,
  children,
  descriptionMode = "tooltip",
  layout = "horizontal",
  disabled = false,
  tooltipPosition = "top",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTooltip]);

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  // Sin texto no hay icono. Antes se pintaba siempre, así que una descripción
  // vacía —o una traducción que faltase— dejaba la ⓘ colgada y, al pasar por
  // encima, un bocadillo de 200 px sin nada dentro.
  const hasDescription = description.trim().length > 0;

  // Agrupado o suelto, el ajuste ya no se encajona: la separación la ponen las
  // líneas del grupo que lo contiene. El px-6 iguala la sangría del detalle de
  // Perfiles, para que al cambiar de pestaña no se mueva el margen del texto.
  const containerClasses = "px-6 py-2";

  /** Se pinta dentro del <h3>, en el flujo del texto. Ver el comentario de uso. */
  const InfoIcon: React.FC<{ position: "top" | "bottom" }> = ({ position }) =>
    !hasDescription ? null : (
      <span
        ref={tooltipRef}
        className="relative ms-1.5 inline-flex align-middle"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={toggleTooltip}
      >
        <svg
          className="w-4 h-4 text-mid-gray cursor-help hover:text-logo-primary transition-colors duration-200 select-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="More information"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleTooltip();
            }
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {showTooltip && (
          <Tooltip targetRef={tooltipRef} position={position}>
            <p className="text-sm text-center leading-relaxed">{description}</p>
          </Tooltip>
        )}
      </span>
    );

  if (layout === "stacked") {
    if (descriptionMode === "tooltip") {
      return (
        <div className={containerClasses}>
          <div className="mb-2">
            <h3
              className={`text-sm font-medium ${disabled ? "opacity-50" : ""}`}
            >
              {title}
              {/* El icono va DENTRO del título, no al lado. Como hermano en un
                  flex, cuando el título se parte en dos líneas el bloque de
                  texto crece hasta el ancho disponible y el icono acaba en el
                  borde derecho, lejos de la palabra. Dentro del flujo de texto
                  sigue siempre a la última palabra, quepa en una línea o no. */}
              <InfoIcon position="top" />
            </h3>
          </div>
          <div className="w-full">{children}</div>
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <div className="mb-2">
          <h3 className={`text-sm font-medium ${disabled ? "opacity-50" : ""}`}>
            {title}
          </h3>
          <p className={`text-sm ${disabled ? "opacity-50" : ""}`}>
            {description}
          </p>
        </div>
        <div className="w-full">{children}</div>
      </div>
    );
  }

  // Horizontal layout (default)
  const horizontalContainerClasses =
    "flex items-center justify-between min-h-12 px-6 py-2";

  if (descriptionMode === "tooltip") {
    return (
      <div className={horizontalContainerClasses}>
        <div className="max-w-2/3">
          <h3 className={`text-sm font-medium ${disabled ? "opacity-50" : ""}`}>
            {title}
            <InfoIcon position={tooltipPosition} />
          </h3>
        </div>
        <div className="relative">{children}</div>
      </div>
    );
  }

  return (
    <div className={horizontalContainerClasses}>
      <div className="max-w-2/3">
        <h3 className={`text-sm font-medium ${disabled ? "opacity-50" : ""}`}>
          {title}
        </h3>
        <p className={`text-sm ${disabled ? "opacity-50" : ""}`}>
          {description}
        </p>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
};
