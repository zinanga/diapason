# Diapasón

**Dictado por voz que ocurre entero en tu Mac. Nada sale de este equipo, no hay cuenta y no hay servidor.**

Mantén pulsado un atajo, habla, suelta. El texto aparece donde esté el cursor —en cualquier app— y el audio nunca toca la red.

Diapasón es un **fork declarado de [Handy](https://github.com/cjpais/Handy)** (MIT, de CJ Pais) con una capa propia **español-first**: calidad de reconocimiento, perfiles de transcripción con atajo, y errores visibles en vez de silenciosos.

---

## Instalación

> **Importante: clic derecho sobre la app → Abrir → Abrir.**
>
> Con doble clic, macOS dice que la aplicación _"está dañada"_ y no da segunda oportunidad. No está dañada: **no está firmada con un certificado de desarrollador de Apple ni notarizada**, y ese es el aviso que macOS da en ese caso. Es un proyecto de hackathon, no hay cuenta de pago detrás.

1. Descarga el `.dmg` de la [última release](https://github.com/zinanga/diapason/releases).
2. Arrástralo a Aplicaciones.
3. **Clic derecho → Abrir.**
4. Concede los dos permisos que pide: micrófono (para oírte) y accesibilidad (para escribir por ti).
5. Al primer arranque se descarga el modelo de transcripción (~500 MB - 1 GB según cuál elijas).

**Requisitos:** macOS con Apple Silicon.

---

## Qué añade sobre Handy

|                             | Qué hace                                                     | Por qué                                                       |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| **Correcciones personales** | reemplazos literales sobre el texto ya transcrito            | «Cloud Code» pasa a «Claude Code» y «Diapason» a «Diapasón»    |
| **Perfiles con atajo**      | cada perfil con su idioma, traducción, post-proceso y tecla  | dictar código, correo o traducir sin entrar en ajustes        |
| **Errores visibles**        | los fallos de post-proceso salen en pantalla                 | antes fallaban en silencio y parecía que no habías dictado    |
| **Prompt de vocabulario**   | le pasas nombres propios y jerga antes de transcribir        | existe y se puede usar, pero **medido aporta muy poco** (ver abajo) |

Las correcciones personales son **exactas y sensibles a mayúsculas**: no usan
distancias ni fonética, así que no pueden alterar nada que no case carácter por
carácter. Es a propósito — el corrector difuso que trae Handy multiplica su
puntuación cuando coincide el Soundex, y en castellano acaba tragándose la
palabra funcional de al lado.

El **prompt de vocabulario** solo funciona con modelos de la familia Whisper; con
otros (Parakeet, Canary, Moonshine…) la interfaz lo muestra desactivado y explica
por qué, en vez de aceptarlo y no aplicarlo.

> **Sobre la antialucinación, que estuvo aquí anunciada:** se implementó, se midió
> el 30-jul y **no hace nada** — el texto sale idéntico con la función encendida y
> apagada. Uno de sus dos parámetros se fijaba al valor que ya traía el backend
> por defecto. Se retiró. Lo que evita la basura en los silencios es el detector
> de voz, que los descarta durante la captura. La medición completa, con los
> hashes de cada prueba, está en [`CONFIGURACION-DEMO.md`](CONFIGURACION-DEMO.md).
>
> Por el mismo camino se midió el prompt de vocabulario: sobre el mismo audio,
> ponerlo o no ponerlo cambia **una coma en 926 caracteres**.

### Diferencias de comportamiento respecto a Handy

- **El micrófono queda abierto** mientras la app corre (upstream lo abre al pulsar). Los micros inalámbricos tardan cientos de milisegundos en entregar las primeras muestras, y ese audio no existe: se perdía la primera palabra de cada dictado. Contrapartida: macOS deja encendido el indicador naranja. La app solo **captura** mientras el atajo está pulsado, y nada sale del equipo. Se puede volver al comportamiento anterior en _Debug → Micrófono siempre activo_.
- **El actualizador está desactivado.** El de upstream apuntaba al repo original, así que "actualizar" habría sustituido Diapasón por Handy.
- **Las descargas de modelos van sin credenciales.** Un token de Hugging Face caducado en el sistema provocaba `401` en repositorios públicos.

---

## Uso

- **⌥Space** (por defecto): mantén pulsado, habla, suelta.
- Los perfiles se crean en _Perfiles_ y cada uno lleva su propio atajo.
- Mientras grabas verás una píldora abajo en la pantalla con el estado: `ESCUCHANDO`, `TRANSCRIBIENDO`.

---

## Limitaciones conocidas

Se listan a propósito. Un proyecto que no dice dónde falla obliga a descubrirlo por las malas.

- **Sin firma ni notarización de Apple.** Ver el aviso de instalación.
- **El post-proceso con IA local cuesta ~8 segundos fijos** por invocación, independientemente de la longitud. Compensa en textos largos (un 28 % de recargo en un dictado de 17 s) y no compensa en frases sueltas. Viene desactivado.
- **El canto no se transcribe bien.** Whisper está entrenado con habla; al cantar, el modelo suele considerar el segmento "no voz" y lo descarta.
- **Solo la interfaz en español e inglés está revisada.** Los otros 21 idiomas heredan textos de Handy.
- **Sin build de Windows ni Linux.** El código de upstream los soporta, pero aquí no se han probado.

---

## Desarrollo

```bash
bun install
CMAKE_POLICY_VERSION_MINIMUM=3.5 bun run tauri dev     # desarrollo
CMAKE_POLICY_VERSION_MINIMUM=3.5 bun run tauri build   # .dmg
```

Los tiempos medidos en desarrollo **no son reales**: Rust va sin optimizar. Para cualquier cifra que se vaya a publicar, medir contra el `.dmg`.

**Documentos útiles:**

- [`CONFIGURACION-DEMO.md`](CONFIGURACION-DEMO.md) — los ajustes que Handy esconde tras flags anidados y que una instalación limpia no tiene, con mediciones y las hipótesis que se descartaron por el camino.
- [`src/styles/theme.css`](src/styles/theme.css) — el sistema de diseño en tres capas. Cambiar un color es una línea; los componentes no se tocan.

---

## Créditos y licencia

Diapasón es un fork de **[Handy](https://github.com/cjpais/Handy)**, de **CJ Pais**, publicado bajo licencia MIT. Todo el motor de transcripción, la arquitectura Tauri y la mayor parte de la interfaz vienen de ahí. Si Diapasón te resulta útil, el mérito de fondo es suyo: [apoya Handy](https://handy.computer).

Este fork mantiene la [licencia MIT](LICENSE) y el copyright original. El README de upstream se conserva en [`README-handy-upstream.md`](README-handy-upstream.md).

Transcripción local sobre [transcribe.cpp](https://github.com/cjpais/transcribe-cpp) y [ggml](https://github.com/ggerganov/ggml).
