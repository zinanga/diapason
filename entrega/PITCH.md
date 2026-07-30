# Diapasón — pitch del hackathon

> **Diapasón**: tu voz, afinada. Dictado 100 % local, español-first.
> Fork declarado de [Handy](https://github.com/cjpais/handy) (MIT) con una capa propia de calidad e IA.

## El problema

Dictar en español con las herramientas actuales significa mandar tu voz a la nube
y, sobre todo, **pelearte con tu propio vocabulario**: tus marcas, tus
herramientas, los tecnicismos que dices medio en inglés y medio en castellano.

Y no es cuestión de acento. Dictamos la misma lista de 53 términos técnicos
cuatro veces, el mismo día, con el mismo micrófono. Veintiocho no fallaron nunca
— son léxico universal, el modelo los tiene de sobra. Y doce no salieron bien
casi ninguna vez: justo los nuestros. Un mismo término se transcribió
`Tachygraf`, `Taquígrafe` y `Tachygraph` en tres tomas seguidas.

**Lo universal ya lo resuelve el modelo. Lo tuyo no lo va a resolver nadie por ti.**

## El vídeo (2 minutos)

1. **Local de verdad** — se apaga el WiFi en pantalla y se dicta igual.
   14 veces más rápido que tiempo real, medido sobre el build de release.
2. **El dolor, enseñado** — el historial con la misma palabra transcrita de tres
   formas distintas. Mismo texto, mismo micro, misma persona.
3. **La capa personal** — las correcciones aprendidas se aplican siempre.
   Se dicta lo mismo y ahora sale bien.
4. **Perfiles con atajo** — un atajo dicta en español; otro, hablas español y
   aparece inglés. Sin abrir ajustes y sin encender el WiFi: el post-proceso es
   on-device.
5. **Cierre** — no importa de dónde seas; importa cómo pronuncias tú y a qué hora
   estás dictando.

## Qué construimos nosotros (sobre el fork declarado)

| Capa | Qué | Dónde |
|---|---|---|
| Feature ⭐ | **Correcciones personales**: tabla determinista aplicada al texto ya transcrito — exacta y sensible a mayúsculas, sin distancias ni fonética. Medido en la app: **37 → 43 aciertos de 53** | `audio_toolkit/text.rs`, `managers/transcription.rs` |
| Feature ⭐ | **Perfiles de transcripción**: presets {idioma, post-proceso, prompt, traducción}, cada uno con su atajo global (`profile:<id>` sobre el sistema de bindings existente) | `actions.rs`, `shortcut/`, sección nueva de Settings |
| Robustez | Errores de post-procesado **visibles** (evento `post-process-error` → aviso) en vez de fallo silencioso | `actions.rs` + `App.tsx` |
| Robustez | Fallos de restauración del portapapeles registrados con causa (antes: descartados) | `clipboard.rs` |
| Identidad | Rebrand completo: sistema de diseño en tres capas, interfaz sin tarjetas —líneas separadoras y misma sangría en todas las pantallas—, iconos propios de barra de menú, onboarding | `styles/theme.css`, `components/`, `resources/` |

## Lo que medimos y retiramos

Prometimos un modo antialucinación. Lo medimos con audio real y con audio
forzado: **el texto sale idéntico con la función encendida y apagada**. Una de
sus dos perillas se fijaba al valor que ya traía el backend por defecto — se
escribía encima de sí misma. Lo que de verdad evita la basura en los silencios es
el detector de voz, que los descarta antes de que lleguen al modelo.

Lo retiramos del producto y lo dejamos documentado en el repo, con los hashes de
cada prueba. Preferimos entregar una función menos y una medición más.

Por el mismo camino descartamos vender el prompt de contexto como función de
calidad: medido sobre el mismo audio, poner el mejor prompt frente a no poner
ninguno cambia **una coma** en 926 caracteres.

## Por qué un fork (transparencia)

Handy resuelve lo caro y aburrido —pipeline de audio, VAD, motores ASR, pegado
universal multiplataforma— y se autodefine como *"the most forkable
speech-to-text app"*. Nuestra capa es exactamente la que el upstream no puede
priorizar, porque está en *feature freeze*: vocabulario personal, perfiles de
uso, visibilidad de errores e identidad propia.

## Stack

Tauri 2 · Rust (whisper.cpp vía transcribe-cpp, Metal) · React + TypeScript ·
SQLite · Whisper Large v3 en local.

El *phraser* que las bases dan por hecho con tu propia API key aquí es
**Apple Intelligence on-device**: sin clave, sin nube y sin coste por uso.

Única llamada de red: la descarga del modelo en el primer arranque (~1 GB). A
partir de ahí, nunca más.
