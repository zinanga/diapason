# Configuración de la demo — qué hay que encender a mano

**Por qué existe este documento:** Handy esconde buena parte de su configuración
detrás de flags anidados. Una instalación limpia **no** llega al estado que se ve
en el video de la demo. Esta es la lista completa de lo que hay que activar,
en orden, y por qué.

Verificado el 2026-07-27 sobre Handy v0.9.3 (rama `hackathon`), macOS, Apple Silicon.

---

## El problema en una frase

Tres de las funciones que usa la demo viven detrás de interruptores que están
apagados por defecto y que **revelan otros interruptores** al encenderse. No es
un bug: es el diseño de Handy. Pero significa que el estado de la app grabada
y el estado de una instalación recién hecha son distintos.

---

## Secuencia de activación

El orden importa: cada paso hace visible el siguiente.

### 1. Permisos de accesibilidad (macOS)

La app los pide al primer arranque. Sin ellos **ningún atajo global funciona** —
y el síntoma es silencio, no un error. Es la primera causa de "no me va nada".

> Ajustes del Sistema → Privacidad y seguridad → Accesibilidad → activar Handy

Confirmación en el log: `The application has the permission to simulate input`.

### 2. Funciones experimentales

> Avanzado → grupo **Aplicación** → **"Funciones experimentales"** → ON

Ajuste: `experimental_enabled` (por defecto `false`).

No activa nada por sí solo. Lo único que hace es **pintar el grupo
"Experimental"** al final de la pantalla Avanzado, que es donde vive el paso 3.

### 3. Post procesamiento

> Avanzado → grupo **Experimental** (solo visible tras el paso 2) → **"Post procesamiento"** → ON

Ajuste: `post_process_enabled` (por defecto `false`).

Al encenderlo aparece una **sección nueva en la barra lateral: "Post proceso"** (✨).
Antes de esto, esa sección no existe en la interfaz.

### 4. Proveedor de post-proceso → Apple Intelligence

> Barra lateral → **Post proceso** → desplegable **"Proveedor"** → *Apple Intelligence*

Ajuste: `post_process_provider_id` (por defecto `"openai"`).

**Esto no es opcional.** Ver la sección "El proveedor por defecto contradice el
pitch" más abajo.

Nota de interfaz: al elegir Apple Intelligence, los campos "Modelo" y "Clave API"
**desaparecen**. Es correcto — no los necesita. No los busques.

Requisitos de Apple Intelligence: Mac con Apple Silicon, macOS Tahoe (26.0) o
posterior, y Apple Intelligence habilitado en Ajustes del Sistema. Xcode **no**
hace falta: el puente Swift se compila dentro del binario.

### 5. Prompt de post-proceso

> Barra lateral → **Post proceso** → seleccionar un prompt

Ajuste: `post_process_selected_prompt_id` (por defecto `null`).

Existe un prompt de fábrica (`Improve Transcriptions`) pero **no viene
seleccionado**. Sin selección, el post-proceso falla.

### 6. Desactivar la búsqueda de actualizaciones

> `Cmd + Shift + D` → aparece la sección **Debug** → **"Buscar actualizaciones"** → OFF

Ajuste: `update_checks_enabled` (por defecto `true`).

Dos motivos, ambos serios:

1. **El updater apunta al repo original.** En `src-tauri/tauri.conf.json`:
   ```json
   "endpoints": ["https://github.com/cjpais/Handy/releases/latest/download/latest.json"]
   ```
   Instalar esa actualización reemplazaría esta app por el **Handy oficial**, que
   no contiene ninguna de las mejoras de esta rama.
2. **El aviso puede salir en pantalla durante la grabación del video.**

---

## Dos trampas que conviene conocer

### El proveedor por defecto contradice el pitch

`PITCH.md` vende Dupla como **"100% local"** y ataca explícitamente el hecho de
"enviar tu voz a la nube".

Pero el proveedor de post-proceso por defecto es **OpenAI**. Si el post-proceso
se enciende sin cambiar el proveedor, las transcripciones salen del equipo hacia
la nube — exactamente lo que el pitch reprocha a los demás.

Apple Intelligence (`base_url: apple-intelligence://local`) es la única opción
que mantiene la promesa sin configuración extra. La otra opción local es
`custom` apuntando a Ollama (`http://localhost:11434/v1`).

### El post-proceso por perfil ignora el interruptor global

Un perfil de transcripción con `post_process: true` **ejecuta el post-proceso
aunque `post_process_enabled` esté en `false`**.

Consecuencia práctica: un perfil puede estar llamando a un proveedor en la nube
mientras la pantalla que configura ese proveedor ni siquiera es visible en la
interfaz. Configuración invisible, comportamiento activo.

Si alguien pregunta "¿esto sale a internet?", la respuesta honesta con la
configuración por defecto es *"depende de un ajuste que la interfaz te oculta"*.
Poner el proveedor en Apple Intelligence lo vuelve irrelevante.

---

### `translate_to_english` no tiene estado "heredar"

En `apply_profile_overrides` (`src-tauri/src/actions.rs`), dos de los tres
campos que un perfil puede sobreescribir usan un valor centinela para decir
"no lo toques":

- `language` es `String` → `""` significa heredar el global.
- `prompt_id` es `Option<String>` → `None` significa heredar el global.
- `translate_to_english` es **`bool` pelado** → no tiene tercer estado.

Como `false` significa a la vez "apagado" y "sin configurar", el código lo
asigna **siempre**:

```rust
settings.translate_to_english = profile.translate_to_english;
```

Consecuencia: con la traducción activada globalmente, disparar **cualquier**
perfil que no la lleve marcada la apaga en silencio para esa transcripción.
No hay error ni aviso.

Cómo convivir con ello: marcar la casilla explícitamente en cada perfil que
deba traducir. El arreglo de fondo sería cambiar el campo a `Option<bool>`,
como `prompt_id`, pero eso obliga a migrar los perfiles ya persistidos y a
rehacer el interruptor de la interfaz como tri-estado.

---

## Limitación conocida: el post-proceso con Apple Intelligence es lento

Medido el 2026-07-27 en un MacBook con M1 Max, dictando en español.

### Los números

| Etapa | Tiempo |
|---|---|
| Transcripción (Whisper + Metal) | **0,13 – 0,29 s** — entre 14x y 61x tiempo real |
| Post-proceso (Apple Intelligence) | **9 s** para un dictado de 3 s · **98 s** para uno de 11 s |

**El coste escala con la longitud del texto, y peor que proporcionalmente:**

| Audio dictado | Post-proceso |
|---|---|
| 2,76 s | 9 s |
| 2,25 s | 13 s |
| **10,92 s** | **98 s** |

Cuatro veces más audio, once veces más tiempo.

> **Corrección.** Una versión anterior de este documento afirmaba, en la columna
> de "medido", que la latencia **no** dependía de la longitud del audio: 3,45 s
> y 6,75 s daban ambos 11 s. Era cierto en ese rango y **falso fuera de él**.
> Dos puntos próximos en una curva creciente parecen una recta plana. Bastó
> probar un dictado de 11 segundos para verlo.
>
> Lección: al medir una curva, **abrir el rango antes de declarar que es plana**.
> Un factor 4 en la entrada revela lo que un factor 2 esconde.

Consecuencia práctica: un dictado de once segundos —que no es largo— cuesta
minuto y medio de post-proceso. No es una función lenta, es una función
inservible para dictado real.

### Qué se probó para bajarlo

| Prompt | Tamaño | Latencia |
|---|---|---|
| El de fábrica, en inglés | ~200 tokens | 11 s |
| Español, 3 reglas | ~60 tokens | 8 s |
| Español, 1 regla | ~30 tokens | 8 s |

Acortar el prompt de 200 a 60 tokens ganó 3 segundos. Seguir acortándolo no
ganó nada más. **El suelo son 8 segundos.**

### Hipótesis descartadas

Se barajaron dos explicaciones para lo que en su momento parecía un coste fijo.
**Las dos quedaron descartadas** al medir con un rango de entrada más amplio, y
se dejan escritas para que nadie las vuelva a recorrer.

**1. Arranque de sesión en frío.** `LanguageModelSession` se construye nueva en
cada llamada, y la documentación de FoundationModels recomienda reutilizarla y
ofrece `prewarm()`. Encajaba bien: habría permitido calentar el modelo mientras
el usuario dicta, sin coste percibido.
→ **Refutada por medición directa:** dos dictados separados por 7 segundos
dieron 9 s y 13 s. El segundo, con la sesión recién usada, fue *más lento*. Si
el arranque dominara, habría bajado.

**2. Doble inferencia.** El código intenta generación estructurada y, si lanza,
el `catch` hace una segunda llamada completa (ver abajo).
→ **Irrelevante:** aunque ocurriera, no explica una curva que crece con la
longitud del texto. Nunca se instrumentó.

Lo que queda en pie es lo simple: **el modelo genera despacio y el tiempo lo
manda la longitud de la salida.** No hay coste fijo que quitar; hay throughput
que no da. Ninguna optimización de arranque salva esto.

### El código, para quien quiera seguir mirando

Lo que sigue **no está instrumentado**: sale de leer
`src-tauri/swift/apple_intelligence.swift`, no de medir.

1. Se crea un `LanguageModelSession` **nuevo en cada llamada**, con las
   instrucciones dentro. No hay sesión reutilizada, así que el prompt se
   vuelve a procesar en cada dictado.
2. Se intenta primero generación estructurada y, si lanza, el `catch` hace
   una segunda inferencia completa:
   ```swift
   do {
       let structured = try await session.respond(to: ..., generating: CleanedTranscript.self)
   } catch {
       let fallbackGeneration = try await session.respond(to: ...)  // 2ª llamada entera
   }
   ```
   **No hay ningún log que distinga si la estructurada tuvo éxito o si se cayó
   al `catch`.** Que se estén pagando dos inferencias es una suposición.

Cómo zanjarlo (~20 min, trabajo de después de la entrega): añadir una traza en
la rama `catch`, recompilar el puente y dictar dos veces. Si efectivamente son
dos llamadas, quitar el intento estructurado dejaría la latencia sobre los 4 s,
lo que cambiaría si la función es utilizable o no.

Tampoco se probó con entrada en inglés, así que se desconoce si el fallo de la
generación estructurada es específico del español.

### Lo que sí está medido, y lo que no

| Afirmación | Estado |
|---|---|
| El tiempo escala con la longitud del texto, peor que proporcionalmente (2,76 s → 9 s; 10,92 s → 98 s) | medido |
| Dictados de ~3 s cuestan entre 9 y 13 s de post-proceso | medido, repetido |
| Bajar el prompt de 200 a 60 tokens quita 3 s; de 60 a 30 no quita nada | medido |
| Whisper en 0,13-0,29 s (14x-61x tiempo real) | medido |
| Reutilizar la sesión / `prewarm()` ayudaría | **refutado** — dos llamadas a 7 s de distancia dieron 9 s y 13 s |
| ~~No escala con la duración del audio~~ | **refutado** — era un artefacto de medir solo entre 3,45 s y 6,75 s |
| La causa es la doble inferencia del `catch` | **hipótesis, nunca instrumentada e irrelevante** ante la curva medida |
| Se compiló el puente real, no los stubs (`build.rs` los sustituye si solo hay Command Line Tools) | verificado en el log de build |
| Swift compilado con `-O` pese a estar en `tauri dev` | verificado en `build.rs` |
| Salida inconsistente: `25000` en un dictado y `25,000` en otros dos, con el mismo prompt | observado |

### Cómo escribir prompts para el modelo local

El modelo de Apple Intelligence es pequeño (~3B). Se satura con listas de
reglas: en una prueba con tres reglas aplicó la primera y la tercera e
**ignoró la del medio** (la conversión de números). Con una sola regla, la
aplicó bien.

Detalle útil: el esquema Swift devuelve un campo llamado `cleanedText`, y ese
nombre ya empuja al modelo a limpiar el texto. **Quitar muletillas y corregir
puntuación sale gratis del esquema, sin pedirlo.** Solo hay que pedir
explícitamente la transformación que el esquema no sugiere.

Prompt que funcionó:

```
<transcript>
${output}
</transcript>

Reescribe el texto cambiando las cantidades a cifras. «veinticinco mil» → «25000».
Devuelve solo el texto.
```

Resultado: `El presupuesto era de 25000 euros.` — convirtió el número **y**
quitó la muletilla sin que se le pidiera.

### Decisión

El post-proceso **no se enseña en el video**. Es código de Handy, no del
proyecto, tarda 8 segundos en pantalla y su fiabilidad en español es irregular.
El contraste que sí se enseña es el motor propio: 0,13 s, 44x tiempo real.

---

## Resumen para la QA de instalación limpia

Estado por defecto tras instalar, y lo que hay que cambiar:

| Ajuste | Por defecto | Para la demo |
|---|---|---|
| permisos de accesibilidad | no concedidos | **conceder** |
| `experimental_enabled` | `false` | `true` |
| `post_process_enabled` | `false` | `true` |
| `post_process_provider_id` | `"openai"` (nube) | `"apple_intelligence"` (local) |
| `post_process_selected_prompt_id` | `null` | un prompt cualquiera |
| `update_checks_enabled` | `true` | `false` |
| `debug_mode` | `false` | `true` solo para llegar al ajuste anterior |

Los ajustes se persisten en:
`~/Library/Application Support/com.pais.handy/settings_store.json` (bajo la
clave `settings`). Útil para verificar el estado real sin fiarse de la interfaz.
