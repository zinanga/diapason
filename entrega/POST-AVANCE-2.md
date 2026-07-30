⚔️ **[HACKATHON IMPERIAL] Diapasón: prometimos la medición. Aquí está, y nos desmiente a nosotros (avance 2)**

**1️⃣ Nombre del proyecto:** Diapasón 🎼 (rebrand de Handy) — *tu voz, afinada*.

**2️⃣ Mi dupla:** @Fernando Lopez

**3️⃣ Estado:** AVANCE 2 — v0.4.0

**4️⃣ Qué construimos / qué cambió**

En el avance 1 prometimos dos cosas. Las dos están cumplidas. Ninguna salió como pensábamos.

**Promesa 1: «la comparación lado a lado, medida, en el próximo avance».**

Hecha. Grabamos audio con silencios largos, lo transcribimos con el modo antialucinación encendido y apagado, y comparamos: **el texto sale idéntico**. Byte a byte, mismo hash. Fuimos al código del motor y ahí estaba el motivo: una de las dos perillas se fijaba exactamente al valor que ya traía por defecto. Se escribía encima de sí misma.

Lo que de verdad evita la basura en los silencios es el detector de voz, que los descarta antes de que lleguen al modelo. **Retiramos la función.** Lo dejamos documentado con los hashes de cada prueba, y **el repositorio se abre mañana con la entrega**.

**Promesa 2: «tus términos llegan al motor ANTES de transcribir, no como todas las apps que parchean el texto después».**

Lo medimos sobre el mismo audio, nueve configuraciones. Resultado: entre poner el mejor vocabulario en el motor y **no poner nada**, el texto cambia **una coma en 926 caracteres**. Cero términos.

Y lo que sí funciona es la vía que dijimos que no: **corregir después. 37 → 43 aciertos sobre 53** dentro de la app.

Con un matiz que sostiene el argumento: las demás corrigen con distancias y fonética, y eso en castellano se come palabras enteras — lo medimos, «imperiales con su» acababa convertido en otra cosa y el texto perdía 27 palabras. La nuestra es determinista: no puede tocar nada que no case carácter por carácter.

**Y aquí está lo que lo explica todo.**

En los comentarios del avance 1, Arturo nos dejó tres palabras que se le rompen siempre: `useState`, que le sale «you state» o «tienes state»; `Zustand`, que le sale «zustán»; y `hook`, que directamente pierde el sentido.

Las tres estaban en nuestra lista de pruebas. Las tres nos fallan también. **Y nos fallan distinto:**

```
useState   Arturo: «you state»       nosotros: «Use State», «UseState», «use state»
Zustand    Arturo: «zustán»          nosotros: «zustand»
hook       Arturo: pierde el sentido  nosotros: «Hook», «Junghook», «Unhook»
```

Cuatro tomas del mismo texto, la misma tarde, el mismo micrófono: **cuatro grafías distintas de `hook`**. Y ninguna coincide con las de Arturo.

No es que la palabra sea difícil. Es que **la palabra más quien la dice** son difíciles. Un diccionario global no puede arreglar esto: Arturo necesita `you state → useState` y nosotros `Use State → useState`. Mismo destino, entradas distintas.

Arturo, nos dijiste «qué chido que se metieron directo al motor y no nomás al parche de texto». Te debemos esto de frente: **el parche de texto es el que funciona**. Lo medimos y nos equivocamos.

**Lo demás de la v0.4.0:** correcciones personales, rediseño completo de la interfaz, iconos propios, perfiles arreglados. Y una cifra: **14 veces más rápido que tiempo real** — 75 s de audio en 5,31, en local y con el WiFi apagado. El post-procesado con IA va con **Apple Intelligence on-device**: sin API key, sin nube.

**5️⃣ Capturas:** [interfaz con v0.4.0 · antes/después de las correcciones · las cuatro tomas de la misma palabra]

**6️⃣ Qué feedback buscamos**

Seguimos con la misma pregunta y ahora con motivo: **¿qué palabras te destroza siempre el dictado?** Ya no es curiosidad — cada una que nos deis entra en la medición y en la tabla.

Y una nueva: esa capa de correcciones, ¿la queréis **automática**, que aprenda sola de lo que vais corrigiendo, o **manual**, con control total?
