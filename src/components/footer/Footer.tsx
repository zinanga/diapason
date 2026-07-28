import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";

import ModelSelector from "../model-selector";
import UpdateChecker from "../update-checker";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [version, setVersion] = useState("");

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const appVersion = await getVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error("Failed to get app version:", error);
        setVersion("0.1.2");
      }
    };

    fetchVersion();
  }, []);

  return (
    <div className="w-full border-t border-mid-gray/20 pt-3">
      <div className="flex justify-between items-center text-xs px-4 pb-3 text-text/60">
        <div className="flex items-center gap-4">
          <ModelSelector />
        </div>

        {/* Estado y firma. La insignia "todo local" es el pitch metido en el
            cromo: sale en cada plano del vídeo sin que nadie tenga que decirlo.
            En el diseño va arriba a la derecha, pero la barra de título de macOS
            es nativa y no admite contenido, así que vive aquí. */}
        <div className="flex items-center gap-1">
          <UpdateChecker />
          <span>•</span>
          <span className="font-mono tracking-[0.08em] text-fg-muted">
            {t("brand.localBadge")}
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <span> · v{version}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
