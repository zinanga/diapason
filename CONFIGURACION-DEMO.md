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

---

## 🐞 Abierto: la bienvenida no manda el onboarding (visto en el `.dmg` 0.3.1)

**Síntoma observado** (28-jul, probando el `.dmg` descargado de la release
0.3.1): la pantalla de bienvenida **parpadea** — aparece un instante y salta
sola a la de permisos, sin que dé tiempo a leerla ni a pulsar «Empezar».

> **No se ha reproducido** (28-jul, misma tarde). Tras limpiar los registros de
> permisos con `tccutil` y volver a poner `onboarding_completed` a `false`, el
> asistente recorrió sus pasos en orden y sin parpadeo. La hipótesis que queda
> en pie es que el parpadeo era **un síntoma del estado atascado de permisos**
> descrito en el apartado siguiente, no un fallo propio del asistente. Lo que sí
> sigue siendo cierto es lo de abajo: la bienvenida va en el sitio equivocado.

**Lo que dice el código** (árbol limpio en `bf4bb8b`, o sea, es el mismo que
lleva el `.dmg`): el orden real de los pasos es

    permisos → bienvenida → elección de modelo → «ya está»

`App.tsx` arranca a un usuario nuevo en `onboardingStep = "accessibility"`
(`checkOnboardingStatus`), y la bienvenida **no es un paso del asistente**: vive
dentro de `Onboarding.tsx` (el paso de modelos), detrás de un `useState`
local `showWelcome`. Es decir, la pantalla que su propio comentario describe
como «la primerísima pantalla tras instalar» es en realidad la segunda.

Eso ya es un defecto por sí solo, y además explica que el aviso de Gatekeeper
llegue tarde. Pero **no explica el parpadeo tal y como se vio**: para que la
bienvenida se pinte y luego aparezcan los permisos haría falta un salto hacia
atrás que el código no hace. Falta reproducirlo antes de tocar nada.

**Cómo reproducirlo, anotando las tres variables que cambian el recorrido:**

1. ¿Había una versión anterior instalada? El `identifier` sigue siendo
   `com.pais.handy`, así que **los permisos y los ajustes sobreviven** entre
   builds. Con permisos ya concedidos, el paso de permisos se autocompleta
   (marca verde + 300 ms) y suelta al usuario directamente en la bienvenida.
2. ¿`onboarding_completed` estaba a `true` en `settings_store.json`? Entonces
   ni siquiera es un usuario nuevo: se salta modelos y bienvenida.
3. Firma ad-hoc distinta en cada build → macOS puede dejar los permisos
   atascados en «Esperando…». Limpiar con
   `tccutil reset Accessibility com.pais.handy` y lo mismo con `Microphone`.

Para una prueba limpia de verdad: borrar
`~/Library/Application Support/com.pais.handy/`, hacer los dos `tccutil reset`,
y anotar qué pantalla sale primero.

**Sospechas a mirar cuando haya repro**, en este orden:

- El efecto de montaje de `AccessibilityOnboarding` depende de
  `completeOnboarding`, que a su vez depende de `onComplete`
  (`handleAccessibilityComplete`, una función nueva en cada render de `App`).
  El efecto se vuelve a lanzar en cada render, así que `checkInitial()` puede
  correr varias veces y encadenar varios `setTimeout(onComplete, 300)`.
- `showWelcome` es estado local: si `Onboarding` se vuelve a montar, la
  bienvenida reaparece desde cero.

**Arreglo que se propone** (independiente de la causa del parpadeo): subir la
bienvenida a paso propio del asistente en `App.tsx` — `"welcome" →
"accessibility" → "model" → "ready"` — para que el argumento del producto y el
rodeo de Gatekeeper se digan **antes** de pedir nada al sistema, y para que el
paso deje de depender de un estado local que un remontaje reinicia.

---

## ✅ Resuelto en 0.4.1: en Privacidad salía «Handy.app», y el permiso no prendía

> **Cerrado el 31-jul.** La causa era el **identificador del bundle**, que
> heredábamos del upstream: `com.pais.handy`. macOS indexa los permisos por
> identificador, así que la fila vieja de Handy seguía reclamando el registro y
> el permiso nunca llegaba al binario nuevo.
>
> Se probaron y descartaron antes tres explicaciones: App Translocation (la app
> estaba en `/Applications`, comprobado con `ps`), el proceso que no se
> reiniciaba (se reinició de verdad, PID nuevo, y seguía fallando) y la firma
> ad-hoc por sí sola.
>
> **Arreglo**: `identifier` → `com.zinanga.diapason`. Verificado en un MacBook
> que tenía el Handy original instalado: aparece una fila propia de Diapasón,
> independiente de la de Handy, y el interruptor se queda puesto.
>
> Importa más de lo que parecía: el jurado prueba varias entregas seguidas y
> casi todas son forks de Handy que conservan ese identificador. Lo de abajo se
> conserva como registro del diagnóstico.

**Síntoma observado** (28-jul, sobre el `.dmg` 0.3.1): en
_Ajustes → Privacidad y seguridad → Accesibilidad_ aparece una fila
**`Handy.app`**, con icono en blanco y el interruptor encendido. Al segundo
intento —solo salir de la app y volver a entrar— la fila pasó a llamarse
**`Diapasón`**, con su icono, pero **apagada**; y la app se quedó colgada
esperando un permiso que, para macOS, nunca se concedió.

**No es que falte renombrar nada.** El bundle instalado ya está bien:

    CFBundleName / CFBundleDisplayName = Diapasón
    CFBundleExecutable                 = Diapason
    CFBundleIdentifier                 = com.pais.handy

Lo que falla es **a quién le pertenece el permiso**. macOS no guarda los
permisos por identificador a secas: los guarda por identificador **+ firma del
binario** (el `cdhash`). Nuestra firma es _ad-hoc_, y una firma ad-hoc **cambia
en cada compilación**. Consecuencias, las dos que se vieron:

- El registro viejo sobrevive a la desinstalación y sigue enseñando el nombre
  con el que se apuntó en su día — de ahí `Handy.app` con el icono roto,
  encendido y sin servir para nada.
- Cuando macOS por fin registra el binario nuevo, lo trata como **otra app**:
  fila nueva, apagada. El permiso que el usuario ya había dado no se hereda, y
  la app espera indefinidamente.

Es la misma raíz que el caveat de Gatekeeper: **sin firma de Developer ID y
notarización, cada build es un desconocido para el sistema.** Ahí está el
arreglo de verdad; lo de abajo es solo el apaño mientras tanto.

**Apaño para probar un build nuevo** (hay que hacerlo en cada instalación, y es
lo que convierte un «reinstalo y ya» en una prueba que de verdad arranca
limpia):

```bash
# 1. cerrar la app, arrastrarla a la papelera y vaciarla
# 2. borrar los registros de permisos, que NO se van con la app
tccutil reset Accessibility com.pais.handy
tccutil reset Microphone    com.pais.handy
# 3. (opcional, para un usuario nuevo de verdad) tirar los ajustes
rm -rf ~/"Library/Application Support/com.pais.handy"
# 4. instalar, abrir con clic derecho → Abrir, y volver a conceder los permisos
```

**Para el guion de la demo y para la QA de Fer:** esto es exactamente lo que le
va a pasar a cualquiera que actualice de 0.3.0 a 0.3.1 sin borrar nada — verá
una fila `Handy.app` engañosamente encendida y la app colgada. Conviene decirlo
en las notas de la release, no solo aquí.

---

## Turbo no traduce, y la app no lo dice — medido el 28-jul

Queda cerrada la duda que arrastrábamos («¿Turbo traduce o no?»). **No traduce**,
y no es opinable: lo declara el propio motor al cargar el modelo. Del
`handy.log` de la sesión de pruebas, tres modelos cargados esa tarde:

    whisper-large-v3-turbo   supports_translate=false
    whisper-medium           supports_translate=true
    whisper-small            supports_translate=true

`transcription.rs` hace lo correcto con ese dato (línea ~1688):

```rust
let translate_to_en =
    translate_to_english && model_supports_translate && source_language != Some("en");
```

Es decir: **si el modelo no sabe traducir, la app calla y transcribe en el
idioma original.** El usuario activó «traducir al inglés» en el perfil
`ES → EN`, pulsó su atajo, y le salió texto en español sin un solo aviso.

**El defecto no es que Turbo no traduzca — es que la degradación es silenciosa.**
Y hay un agravante: el log miente. La etiqueta `(translated)` de la línea de
resultado se decide así (línea ~1445):

```rust
let translation_note = if settings.translate_to_english { " (translated)" } else { "" };
```

O sea, la pone según **lo que se pidió**, no según lo que se hizo. En el log de
esa tarde hay una docena de transcripciones de Turbo marcadas `(translated)`
cuyo texto está en español. Quien depure esto fiándose del log pierde la tarde.

**Arreglo propuesto**, y ya existe el patrón exacto en la casa: el comando
`loaded_model_is_whisper` + el hook `useModelIsWhisper` que desactiva y explica
M1/M2 cuando el modelo no los soporta. Hacer lo mismo con la traducción —
exponer `supports_translate` del modelo cargado y, en el editor de perfiles,
desactivar el interruptor de traducción con su explicación. Y de paso, que la
etiqueta del log diga la verdad. **No hay nada que tocar en `catalog.json`**: la
capacidad no sale del catálogo, la reporta el motor al cargar.

### Velocidad real, por fin sobre release y con modelos Whisper

Sustituye a las cifras viejas (14x-61x), que eran de Canary-180M y de build de
desarrollo. Esto es del `.dmg` 0.3.1, Metal (`MTL0`), M-serie:

| Modelo   | n   | Audio medido | Coste                            | Rango real  |
| -------- | --- | ------------ | -------------------------------- | ----------- |
| Turbo    | 16  | 2,7 – 20,1 s | ≈ **0,65 s fijos** + 0,008 s/s   | 0,64–0,87 s |
| Medium   | 9   | 8,8 – 44,2 s | ≈ **0,14 s fijos** + 0,041 s/s   | 0,59–2,34 s |

Carga del modelo: 321–629 ms. Descarga de Medium (Q8_0): 20 s.

**Lo interesante es la forma de las dos rectas, no el titular.** Turbo es
casi plano: cueste 3 segundos de audio o 20, tarda ~0,7 s. Medium arranca casi
sin peaje pero paga por segundo de audio. Se cruzan **alrededor de los 15 s**:
por debajo Medium contesta antes, por encima gana Turbo.

Eso explica la impresión de que «el Turbo deja esperando»: en dictados cortos,
que son casi todos los de la demo, **Medium es efectivamente más rápido**. La
etiqueta «Turbo» promete lo contrario.

Aviso honesto sobre estos números: los rangos de audio de los dos modelos apenas
se solapan (Turbo se probó corto, Medium largo), así que el cruce en 15 s es una
**extrapolación**, no una medición. Para citarlo en público hay que probar los
dos modelos con las mismas duraciones.

### El post-proceso no escala con la longitud (confirmado)

Cuatro invocaciones de Apple Intelligence esa tarde, con el reloj del log:

| Salida    | Tiempo |
| --------- | ------ |
| 168 chars | 10 s   |
| 188 chars | 8 s    |
| 219 chars | 8 s    |
| 445 chars | 9 s    |

Se confirma lo que ya decía este documento: **es un coste fijo de ~8-10 s**.
Texto casi tres veces más largo, mismo tiempo. Sigue valiendo la conclusión de
usarlo para párrafos y no para frases.

### Large v3 (Q5_K_M): traduce, y traducir le sale más barato que no traducir

Segunda tanda de pruebas, misma tarde, con el micrófono del monitor LG —el peor
de los disponibles— y música de fondo. Confirma lo que faltaba y aparece un
resultado que no esperábamos.

Lo primero, la capacidad, del log al cargar el modelo:

    whisper-large-v3   supports_translate=true

Así que la tabla de modelos queda cerrada: **traducen Small, Medium y Large v3;
el único que no es Turbo.** Y las traducciones salieron efectivamente en inglés.

| Modelo   | n   | Coste                          |
| -------- | --- | ------------------------------ |
| Turbo    | 16  | ≈ 0,65 s fijos + 0,008 s/s     |
| Medium   | 9   | ≈ 0,14 s fijos + 0,041 s/s     |
| Large v3 | 13  | ≈ 0,65 s fijos + 0,054 s/s     |

Large v3 cuesta solo un 30 % más por segundo de audio que Medium, siendo un
modelo mucho mayor (1,1 GB en Q5_K_M). En dictados de 20-40 s la diferencia
absoluta es de menos de un segundo.

**El hallazgo raro: traducir es más rápido que transcribir.** Dos audios de la
misma duración exacta, 38,79 s:

    español, sin traducir  ->  3,56 s
    traducido a inglés     ->  2,66 s   (-25 %)

No es ruido: las trece transcripciones traducidas caen sistemáticamente por
debajo de las dos españolas. La explicación está en cómo funciona Whisper —
decodifica **token a token**, así que el coste lo manda la longitud de la
**salida**, no la del audio. Y el tokenizador de Whisper es de origen inglés: el
español gasta más tokens por la misma idea. Traducir acorta la salida, y por eso
sale más barato.

Consecuencia práctica que conviene tener presente: **una demo que traduzca
parecerá más rápida que la misma demo en español.** Si se enseñan las dos, no
atribuir la diferencia al modelo.

### El post-proceso se calienta: la primera invocación cuesta más

En orden cronológico, la serie de esta tarde:

| # | Salida    | Tiempo |
| - | --------- | ------ |
| 1 | 353 chars | 12 s   |
| 2 | 447 chars | 10 s   |
| 3 | 472 chars |  9 s   |
| 4 | 149 chars |  8 s   |
| 5 | 279 chars | 10 s   |
| 6 | 257 chars |  8 s   |

Dos lecturas, las dos útiles:

1. **Se confirma otra vez que no escala con la longitud.** 149 caracteres
   cuestan 8 s y 472 cuestan 9 s. La salida más larga de toda la serie es de las
   más rápidas.
2. **Hay calentamiento.** La primera invocación tras arrancar cuesta ~12 s y a
   partir de la tercera se estabiliza en 8-10 s. La tanda anterior de la misma
   tarde dio el mismo perfil (10, 8, 8, 9). Es un detalle de guion, no de código:
   **hacer una invocación de calentamiento antes de grabar el vídeo**, o el
   primer post-proceso que vea el espectador será el más lento de todos.

**La cifra honesta para el guion**, sumando las dos partes: un dictado de 20 s
con post-proceso son ~1,8 s de transcripción **+ 8-10 s de Apple Intelligence**.
El usuario espera unos 10-12 s. La transcripción no es el cuello de botella —
el post-proceso lo es, por un factor de cinco.

### 🔴 El post-proceso de la demo cuesta 10 s y no hace nada (o empeora)

Corrección de método antes del dato: todas las pruebas del 28-jul se hicieron
con **el mismo micrófono**, el del monitor (`Audio de la pantalla LG UltraFine`,
según el log). No hubo cambio de micro entre tandas.

Con el micro descartado como variable, se fue a mirar qué hacía realmente el
post-proceso. `history.db` guarda las dos versiones —`transcription_text` y
`post_processed_text`— así que se pueden comparar. De las seis invocaciones de
Apple Intelligence de esa tarde, las cinco que quedan en el historial:

    4 de 5  ->  el texto salió IDÉNTICO, carácter por carácter
    1 de 5  ->  el texto cambió

Y el único cambio fue **pasar todo a minúsculas**:

    RAW:  ... I say sorry ... It's a point. Well, let's finish here ... WhisperLarge V3 with Spanish-English ...
    PP :  ... i say sorry ... it's a point. well, let's finish here ... whisperlarge v3 with spanish-english ...

Es decir: ~57 segundos de espera acumulada esa tarde, y el único efecto medible
sobre el texto fue **destruir las mayúsculas**.

**Esto no es un fallo del post-proceso: es el prompt.** El que está seleccionado
(`default_improve_transcriptions`, editado) dice:

> Reescribe el texto cambiando las cantidades a cifras. «veinticinco mil» → «25000».

Un prompt de cifras, aplicado a textos que no traen cantidades escritas con
letra, no tiene nada que hacer — así que devolver el texto igual es lo correcto.
El problema es de escaparate: **en el vídeo, el espectador va a esperar 10
segundos mirando una pantalla para no ver ningún cambio.** Y si le toca la
lotería, verá cómo la app le tira las mayúsculas.

Hay además un factor agravante: el prompt está **en español** y se le está
aplicando a **texto en inglés** (el perfil traduce antes de post-procesar). El
modelo local de Apple es pequeño; instrucción en un idioma y texto en otro es
justo el escenario donde se limita a devolver el texto con ruido de formato.

**Decisiones que esto obliga a tomar antes del viernes**, por orden:

1. **O se cambia el prompt por uno cuyo efecto se vea**, y se guioniza un dictado
   que lo dispare (si es el de cifras: decir números con letra, en voz alta).
2. **O se saca el post-proceso del vídeo.** Ya estaba fuera por los ~8 s; ahora
   hay un segundo motivo, peor: no se le ve el resultado.
3. En cualquier caso, **arreglar lo de las mayúsculas** — un post-proceso que
   degrada el texto es peor que no tenerlo. Basta con decírselo al prompt.

### Bonus: el micrófono configurado no era el que grababa

En `settings_store.json`, `selected_microphone` es `"DJI Mic Mini-13BA36"`. El
DJI no se conectó en todo el día. El log dice qué se abrió de verdad:

    Using device: Ok("Audio de la pantalla LG UltraFine")

La app cayó al dispositivo por defecto **sin decir nada**, y la interfaz sigue
enseñando el DJI como micrófono elegido. Es el mismo patrón que la traducción
que no traduce: **la configuración promete una cosa y el sistema hace otra, en
silencio.** Merece el mismo arreglo — avisar en la interfaz cuando el micrófono
configurado no está disponible.

Nota positiva y nada menor: todas las mediciones de velocidad y todas las
transcripciones limpias de esa tarde se hicieron **con el micro del monitor y
con música de fondo**. El VAD abrió y cerró bien y el texto salió correcto. La
robustez que se le atribuía al DJI la da la app.

---

## 🔴 La causa raíz del lío de permisos: la app se estaba ejecutando desde el `.dmg`

Descubierto al final del 28-jul, mirando el proceso vivo:

    /private/var/folders/.../T/AppTranslocation/4E4488FC-.../d/Diapasón.app/Contents/MacOS/Diapason

La app **no estaba instalada en `/Applications`**: el `.dmg` seguía montado en
`/Volumes/Diapasón` y se estaba abriendo desde ahí. macOS entonces aplica
**App Translocation**: en vez de ejecutar la app donde está, la copia a una ruta
temporal **aleatoria y de solo lectura**, distinta en cada arranque.

Y ahí está la explicación completa de todo lo de esta mañana. TCC identifica a
las apps por **ruta + firma**. Con una firma ad-hoc *y* una ruta que cambia en
cada arranque, macOS no puede sostener el permiso de un arranque al siguiente:

- la fila `Handy.app` encendida que no servía para nada,
- la fila `Diapasón` que apareció después y salía apagada,
- el interruptor que no se quedaba puesto,
- y la app colgada esperando un permiso que nunca llegaba.

No era una app frágil: era **una app sin instalar**.

Corrección de lo que decía este documento antes: se dijo que reinstalar no
arreglaba nada porque el binario del mismo `.dmg` tiene el mismo `cdhash`. El
`cdhash` sí es el mismo — lo que faltaba ver es que **la ruta no lo era**. Lo
que importa no es reinstalar: es **dónde** queda instalada.

**El paso que faltaba en la secuencia, y que va al README y a las notas de la
release:**

> Arrastrar `Diapasón.app` del `.dmg` a la carpeta **Aplicaciones**, expulsar el
> disco, y abrir la app **desde Aplicaciones** (clic derecho → Abrir la primera
> vez). Abrirla desde el `.dmg` funciona, pero los permisos no se guardan.

Arrastrar con el Finder a `/Applications` quita la translocación y fija la ruta.
A partir de ahí los permisos se conceden una vez y se quedan.

**Lo que esto NO invalida:** las mediciones de velocidad del 28-jul siguen
siendo buenas. Los modelos se cargan desde `~/.cache/huggingface`, no desde el
bundle, y el binario es el mismo; ejecutar desde un disco de solo lectura no
cambia el tiempo de inferencia.

## 🔴 M1 no evita alucinaciones — medido el 30-jul

Cierra el caveat 1 del gate, pero **con el signo cambiado**. Las validaciones
viejas de M1/M2 eran inválidas porque se hicieron con Canary-180M, donde la
guarda `model_is_whisper` se salta ambas funciones: pasaron porque nada se
rompió, no porque corrieran. Repetidas con **Whisper Large v3 Q5_K_M** sobre
audio real, el resultado es que **M1 sí corre, y no sirve para lo que dice su
nombre**.

Método: un binario aparte que usa el mismo `transcribe-cpp` con las mismas
opciones que arma `transcription.rs`, cargando el modelo una vez y disparando
variantes contra **el mismo PCM**. Así la única variable es la perilla. El audio
está preservado en `audios-referencia/`, fuera del repo.

### El audio de prueba

`2026-07-30-1637-test-M1-silencios-vad-off-audiotechnica.wav`, 76 s, grabado con
la Audio-Technica y **con el VAD apagado**, porque el VAD filtra durante la
captura (`recorder.rs:38-45`) y con él encendido los silencios no llegan ni al
fichero ni al modelo. Guion: habla · 23 s de silencio limpio · habla · 23 s de
silencio sucio (respiración, silla, teclado) · habla. Nivel medido: el silencio
de sala está 12,1 dB por debajo del habla.

### Sobre el audio real, M1 es inerte

Cinco variantes, **md5 idéntico en las cinco** — texto byte a byte igual:

    J1 M1 apagado, sin extensión whisper     14cd59ea
    J2 M1 apagado, extensión por defecto     14cd59ea
    K  M1 encendido (128 + 0.6)              14cd59ea
    L  solo el umbral de no-habla (0.6)      14cd59ea
    M  solo el tope de contexto (128)        14cd59ea

Cero repeticiones en todas. Pero eso **no valida M1**: sin M1 tampoco falló
nada, así que no había nada que evitar. Test inconcluyente.

### Forzando el caso adverso, M1 sigue sin hacer nada

Se fabricó la condición que dispara el bucle usando material auténtico: el
silencio de sala real del propio audio (0:12-0:35) repetido hasta 92 s.

    S1 solo ruido de sala, 92 s      M1 apagado → d61ca6ec   M1 encendido → d61ca6ec
    S2 habla + ruido, 104 s          M1 apagado → 60570bb2   M1 encendido → 60570bb2

**La alucinación aparece**, y es el bucle de repetición clásico:

    Ahora vamos a... Ahora vamos a... Ahora vamos a... Ahora vamos a...

**Y M1 encendido devuelve exactamente el mismo texto.** No ayuda poco: no
cambia un byte.

### Por qué, mirando el backend

M1 mueve dos perillas (`transcription.rs`, rama `anti_hallucination`):

- `no_speech_thold = 0.6` → **es el valor por defecto del backend**
  (`transcribe-cpp-sys/src/arch/whisper/public.cpp:73`). Es un no-op por
  construcción: escribe encima el mismo número.
- `max_prev_context_tokens = 128` → baja de 223 (mismo fichero, línea 69). Solo
  gobierna cuánto contexto se arrastra entre ventanas; no toca el mecanismo de
  la repetición.

Además, descartar un segmento exige **dos** condiciones a la vez
(`model.cpp:2334`): `no_speech_prob > no_speech_thold` **y**
`avg_logprob < logprob_thold`. M1 reescribe la primera con su propio valor y
deja la segunda intacta.

### Ajustar las perillas correctas tampoco lo arregla

Siete variantes sobre el mismo PCM adverso, tocando el guardián de repetición
(`compression_ratio_thold`, por defecto 2.4) y el de verosimilitud
(`logprob_thold`, por defecto -1.0):

    base (M1 actual)            60570bb2   bucle
    compression 2.0             60570bb2   bucle, sin cambios
    compression 1.8             60570bb2   bucle, sin cambios
    logprob -0.5                60570bb2   bucle, sin cambios
    logprob -0.3                b44aa8e7   alucinación VARIADA
    compression 2.0 + logprob -0.5  d9805f4e   alucinación VARIADA
    compression 1.8 + logprob -0.3  85ad0793   alucinación VARIADA

**Aviso sobre la métrica, porque engaña:** las tres últimas marcan «0 % de
5-gramas repetidos» y parecen el arreglo. Al leer el texto, lo que hacen es
cambiar la repetición por invención variada — «Vamos a verlo a seiner forma»,
«Y ARS anurales», «Ahora vamos a editar el embalaje». Es **peor**: deja de ser
detectable automáticamente y pasa por texto plausible. Cualquier métrica de
repetición sobre esto hay que contrastarla leyendo la salida.

### Y no hace falta provocarlo: pasó solo, esa misma tarde

Lo anterior es un caso fabricado. Este no. A las **16:36** del 30-jul, mientras se
preparaba el audio del test, quedó registrado en el historial un dictado de
**7,9 segundos** cuyo resultado completo fue:

    Gracias por ver el video.

Es el arquetipo de la alucinación de Whisper sobre silencio: la fórmula de
despedida de los subtítulos de YouTube, de los que el modelo aprendió. El audio
está preservado en
`audios-referencia/2026-07-30-1636-alucinacion-espontanea-gracias-por-ver-el-video.wav`
y no tiene nada dentro: **RMS 15**, cuando un habla normal ronda 800-3000, con
un pico de 329. Siete segundos y medio de silencio → una frase inventada, con
`anti_hallucination` activo.

Precisión importante para no vender el hallazgo por más de lo que es: **ocurrió
dentro de la ventana en la que el VAD estaba desactivado** para poder grabar el
audio del test. O sea que es coherente con lo que dice el apartado siguiente —
el VAD es la protección real — y no contradice nada.

Lo que aporta es otra cosa, y es lo que ningún test dirigido habría encontrado:
el modo de fallo natural no es «grabar noventa segundos de ruido de sala», es
**pulsar el atajo y no decir nada**. Eso lo hace cualquiera, a diario, sin
querer. Y salió de usar la herramienta, no de una prueba diseñada.

### Lo que de verdad protege es el VAD

Por eso esto no se había visto nunca en uso normal: con `vad_enabled: true` (el
valor por defecto), el silencio se descarta durante la captura y jamás llega al
modelo. El fallo solo aparece con el VAD apagado.

### Qué se puede afirmar y qué no

- **Sí:** M1 corre con Whisper Large v3, no lo salta ninguna guarda, y no
  produce errores. El camino de código está validado.
- **No:** que M1 evite alucinaciones. No lo hace. **No se debe describir
  Diapasón como una app con antialucinación.**
- No es bloqueante de la demo — con los ajustes por defecto el VAD lo tapa.
  Es bloqueante de la **afirmación**.

### Arreglo propuesto, para después del 31

Las perillas del decodificador ya se han demostrado insuficientes. La vía que
sugiere la evidencia es la misma que funcionó con la tabla literal de
reemplazos: **un guardián determinista sobre el texto de salida**, que detecte N
n-gramas idénticos consecutivos y recorte la cola. Barato, comprobable y ataca
el síntoma exacto reproducido aquí. Y mantener el VAD encendido por defecto,
que es la defensa real.
