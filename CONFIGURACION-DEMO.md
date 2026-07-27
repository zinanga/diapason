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

> Barra lateral → **Post proceso** → desplegable **"Proveedor"** → _Apple Intelligence_

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
configuración por defecto es _"depende de un ajuste que la interfaz te oculta"_.
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

## Cambio de comportamiento: el micrófono siempre activo viene encendido

**Esto se aparta de Handy original y es deliberado.** Si alguien quiere volver
al comportamiento de upstream, el interruptor está en
_Debug → "Micrófono siempre activo"_, y el valor por defecto en
`src-tauri/src/settings.rs`, función `default_always_on_microphone()`.

### El problema que resuelve

En el modo por defecto de upstream (bajo demanda), el stream de audio **se abre
al pulsar el atajo**. Los micrófonos inalámbricos tardan **cientos de
milisegundos** en entregar las primeras muestras después de esa apertura. Ese
audio no llega tarde: **no existe**, así que el pre-roll del VAD (que guarda
~512 ms) no puede rescatarlo.

Resultado práctico: **se pierde la primera palabra** de cada dictado, de forma
aparentemente aleatoria. Y cuando la palabra perdida es un «No», la frase
cambia de sentido.

### Cómo se midió

Con un DJI Mic Mini (inalámbrico) y el modelo Canary-180m, dictando frases que
empiezan por «No»:

| Condición                                     | Aciertos                |
| --------------------------------------------- | ----------------------- |
| Bajo demanda, hablando encima de la pulsación | **2 de 7**              |
| Bajo demanda, con media pausa antes de hablar | 4 de 4                  |
| **Micrófono siempre activo, hablando encima** | **prácticamente todos** |

La pausa también funcionaba, pero tenía su propio precio: el modelo interpreta
el silencio como puntuación e **inserta una coma** tras la primera palabra.
Con el micro abierto no hace falta pausa, y desaparecen los dos problemas.

### Hipótesis descartadas por el camino

- **El modelo se come palabras que no entiende.** Refutada: si fuera el modelo,
  la pausa no cambiaría nada — la palabra seguiría siendo igual de floja.
- **La cancelación de ruido por IA del DJI recorta el ataque.** Refutada por lo
  mismo. El DJI sí influye, pero **por ser inalámbrico**, no por su procesado.
- **M1 (antialucinación) suprime habla dudosa.** Descartada al comprobar que M1
  ni siquiera se ejecuta con un modelo no-whisper (ver la sección sobre el
  modelo activo).

### La contrapartida, que hay que saber explicar

macOS deja el **indicador naranja de micrófono encendido de forma permanente**
mientras la app corre.

Técnicamente no cambia nada: la app solo captura audio mientras el atajo está
pulsado, y el resto se descarta sin salir del equipo. Pero en una aplicación
que vende privacidad, un indicador siempre iluminado es **peor óptica que
realidad** — y conviene tener la respuesta preparada antes de que la pregunten.

---

## El post-proceso con Apple Intelligence: un coste fijo de ~8 segundos

Medido el 2026-07-27 en un MacBook con M1 Max, dictando en español, sobre la
app empaquetada (build de release).

### Los números

Tanda de ocho dictados seguidos, sin reiniciar la app:

| Audio dictado | Post-proceso | Recargo  |
| ------------- | ------------ | -------- |
| 8,19 s        | 8 s          | 100 %    |
| 9,12 s        | 8 s          | 88 %     |
| 9,39 s        | 8 s          | 85 %     |
| 11,82 s       | 8 s          | 68 %     |
| 14,85 s       | 8 s          | 54 %     |
| 15,18 s       | 7 s          | 46 %     |
| 16,95 s       | 10 s         | 59 %     |
| **17,58 s**   | **5 s**      | **28 %** |

```
n = 8    mínimo 5 s    máximo 10 s    mediana 8 s    media 7,8 s
```

**No escala con la longitud.** El dictado más largo fue el más rápido. Es un
**coste fijo de unos 8 segundos** por invocación, independiente del texto.

Comparado con la transcripción: **0,13 – 0,29 s** (entre 14x y 61x tiempo real).

### Cuándo tiene sentido usarlo, entonces

Como el coste es fijo y no proporcional, el recargo depende de lo que dictes:

- **Frase corta** → 0,2 s se convierten en 8. Insufrible.
- **Párrafo largo** → 17 s hablando y 5 esperando. **Perfectamente usable.**

No es una función rota: es una función **para textos largos**, no para frases
sueltas. En el vídeo no aparece porque ocho segundos de pantalla quieta no caben
en una pieza de dos minutos, pero para redactar de verdad se sostiene.

### Dos casos atípicos, sin explicación

En unas veinte observaciones aparecieron dos picos cercanos a los 100 segundos:

- **110 s** — la primerísima llamada de la sesión. Carga del modelo por parte del
  sistema. Se paga una vez.
- **98 s** — sin explicar. Llegó 18 segundos después de una llamada normal de
  13 s, lo que hace poco probable que sea otra recarga. **No se ha vuelto a
  reproducir** en las ocho tomas posteriores.

Si alguien retoma esto, ese pico es la pista: instrumentar la rama `catch` del
puente Swift diría si en esos casos se está pagando una segunda inferencia.

> **Historial de correcciones de esta sección.** Se documenta porque el proceso
> es más instructivo que el resultado.
>
> 1. Primera versión: _"8 s constantes"_. Basada en 4 medidas de audios cortos.
> 2. Apareció un dato de 98 s → se reescribió como _"escala con la longitud, peor
>    que proporcionalmente"_, a partir de **un solo punto**.
> 3. Ocho medidas después: la primera versión era la correcta. El 98 era un
>    atípico.
>
> Dos errores del mismo signo: **sacar la forma de una curva de una muestra que
> no da para forma.** Primero por corta, después por sobrecorregir con un
> outlier. La regla que faltaba: antes de describir una tendencia, tener
> suficientes puntos como para que un solo dato raro no la voltee.

### Qué se probó para bajarlo

| Prompt                   | Tamaño      | Latencia |
| ------------------------ | ----------- | -------- |
| El de fábrica, en inglés | ~200 tokens | 11 s     |
| Español, 3 reglas        | ~60 tokens  | 8 s      |
| Español, 1 regla         | ~30 tokens  | 8 s      |

Acortar el prompt de 200 a 60 tokens ganó 3 segundos. Seguir acortándolo no
ganó nada más. **El suelo son 8 segundos.**

### Hipótesis descartadas

Hay un coste fijo de ~8 segundos por invocación. Se barajaron dos explicaciones
y **ninguna sobrevivió a la medición**. Se dejan escritas para que nadie las
vuelva a recorrer.

**1. Arranque de sesión en frío.** `LanguageModelSession` se construye nueva en
cada llamada, y la documentación de FoundationModels recomienda reutilizarla y
ofrece `prewarm()`. Encajaba muy bien, y además habría permitido una solución
elegante: calentar el modelo **mientras el usuario dicta**, aprovechando ese
tiempo muerto, de modo que el coste desapareciera de la experiencia.
→ **Refutada por medición directa:** dos dictados separados por 7 segundos
dieron 9 s y 13 s. El segundo, con la sesión recién usada, fue _más lento_. Si
el arranque dominara, habría bajado.

**2. Doble inferencia.** El código intenta generación estructurada y, si lanza,
el `catch` hace una segunda llamada completa (ver abajo). Explicaría un coste
duplicado.
→ **Nunca instrumentada.** No hay ninguna traza que distinga si la primera
llamada tuvo éxito. Sigue siendo la única pista razonable para **los dos picos
de ~100 s**, pero no explica el comportamiento normal: si cada llamada pagara
dos inferencias, el coste seguiría siendo fijo y de ~8 s, que es lo que se mide.

Lo que queda en pie es lo simple y lo aburrido: **el modelo local tarda unos 8
segundos en arrancar y responder, y ese coste no se puede diluir ni predecir
mejor.** Ninguna optimización de sesión lo toca.

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

| Afirmación                                                                                             | Estado                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Coste fijo de ~8 s por invocación, independiente de la longitud (n=8, mediana 8 s, rango 5-10 s)       | medido                                                                                    |
| **No** escala con la longitud: el dictado más largo (17,58 s) fue el más rápido (5 s)                  | medido                                                                                    |
| Dos picos de ~100 s en unas 20 observaciones; uno es la carga inicial del modelo, el otro sin explicar | observado, no reproducido                                                                 |
| Bajar el prompt de 200 a 60 tokens quita 3 s; de 60 a 30 no quita nada                                 | medido                                                                                    |
| Whisper en 0,13-0,29 s (14x-61x tiempo real)                                                           | medido                                                                                    |
| Reutilizar la sesión / `prewarm()` ayudaría                                                            | **refutado** — dos llamadas a 7 s de distancia dieron 9 s y 13 s                          |
| ~~Escala con la longitud del texto~~                                                                   | **refutado** — se dedujo de un único dato de 98 s; ocho medidas posteriores lo desmienten |
| La causa es la doble inferencia del `catch`                                                            | **hipótesis, nunca instrumentada e irrelevante** ante la curva medida                     |
| Se compiló el puente real, no los stubs (`build.rs` los sustituye si solo hay Command Line Tools)      | verificado en el log de build                                                             |
| Swift compilado con `-O` pese a estar en `tauri dev`                                                   | verificado en `build.rs`                                                                  |
| Salida inconsistente: `25000` en un dictado y `25,000` en otros dos, con el mismo prompt               | observado                                                                                 |

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

El post-proceso **no se enseña en el video**: ocho segundos de pantalla quieta
no caben en una pieza de dos minutos, es código de Handy y no del proyecto, y su
fiabilidad en español es irregular. El contraste que sí se enseña es el motor
propio: 0,13 s, hasta 61x tiempo real.

Pero **la función se queda en el producto**, y con un caso de uso claro: al ser
un coste fijo, se diluye en los textos largos (28 % de recargo en un dictado de
17 s) y resulta insufrible en los cortos. Dictar párrafos, no frases.

---

## Resumen para la QA de instalación limpia

Estado por defecto tras instalar, y lo que hay que cambiar:

| Ajuste                            | Por defecto                                 | Para la demo                               |
| --------------------------------- | ------------------------------------------- | ------------------------------------------ |
| permisos de accesibilidad         | no concedidos                               | **conceder**                               |
| `experimental_enabled`            | `false`                                     | `true`                                     |
| `post_process_enabled`            | `false`                                     | `true`                                     |
| `post_process_provider_id`        | `"openai"` (nube)                           | `"apple_intelligence"` (local)             |
| `post_process_selected_prompt_id` | `null`                                      | un prompt cualquiera                       |
| `update_checks_enabled`           | `true`                                      | `false`                                    |
| `debug_mode`                      | `false`                                     | `true` solo para llegar al ajuste anterior |
| `always_on_microphone`            | **`true` en este fork** (upstream: `false`) | dejarlo — evita perder la primera palabra  |

Los ajustes se persisten en:
`~/Library/Application Support/com.pais.handy/settings_store.json` (bajo la
clave `settings`). Útil para verificar el estado real sin fiarse de la interfaz.
