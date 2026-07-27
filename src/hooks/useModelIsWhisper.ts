import { useEffect, useState } from "react";
import { commands } from "@/bindings";
import { useSettings } from "./useSettings";

/**
 * ¿El modelo cargado es de la familia Whisper?
 *
 * La antialucinación (M1) y el prompt de vocabulario (M2) solo se aplican con
 * modelos whisper: adjuntar la extensión a otra arquitectura la rechaza con
 * INVALID_ARG, así que el motor la omite. Sin esta consulta, la interfaz
 * mostraría esos ajustes como activos mientras se ignoran en silencio — justo
 * lo contrario de M3, que existe para que los fallos se vean.
 *
 * Devuelve `null` mientras no se sabe (aún no hay modelo cargado o la consulta
 * está en vuelo). Quien lo use debe tratar `null` como "no lo sé todavía" y NO
 * desactivar nada: dar por hecho que no es whisper desactivaría los ajustes
 * durante el arranque de cada sesión.
 *
 * No se deduce del nombre del modelo a propósito: `Breeze-ASR-25` es
 * whisper-family y no lleva "whisper" en el id, así que mirar la cadena daría
 * un falso negativo. La arquitectura la reporta el motor cargado.
 */
export const useModelIsWhisper = (): boolean | null => {
  const { getSetting } = useSettings();
  const selectedModel = getSetting("selected_model");
  const [isWhisper, setIsWhisper] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    commands
      .loadedModelIsWhisper()
      .then((result) => {
        if (!cancelled) setIsWhisper(result);
      })
      .catch(() => {
        // Si la consulta falla, se deja en "no lo sé" para no desactivar
        // ajustes por un error de transporte.
        if (!cancelled) setIsWhisper(null);
      });
    return () => {
      cancelled = true;
    };
    // Se reconsulta al cambiar de modelo: la carga es asíncrona, así que el
    // valor puede pasar de null a true/false sin que cambie nada más.
  }, [selectedModel]);

  return isWhisper;
};
