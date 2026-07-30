import React from "react";

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="space-y-2">
      {title && (
        <div className="px-6">
          <h2 className="text-xs font-medium text-mid-gray uppercase tracking-wide">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-mid-gray mt-1">{description}</p>
          )}
        </div>
      )}
      {/* Sin caja: el grupo se lee por su título y por las líneas que separan
          sus filas, la misma gramática que el detalle de Perfiles. Encajonar
          cada grupo hacía que la vista saltara al cambiar de pestaña. */}
      <div className="divide-y divide-border border-y border-border">
        {children}
      </div>
    </div>
  );
};
