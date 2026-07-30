# Guion del vídeo — **grabado**, ≤ 2:00

Entrega V31 antes de las 18:00 de Chile, junto a la landing y el `.dmg` con su SHA256.
No hay directo: **todo lo que salga mal se repite**. Lo único que no se corrige
después de publicar es lo que se **afirme**.

> Sustituye al guion de escenario de 3 minutos. Aquel se apoyaba en la escena
> «dictado ES → spec → clon EN» (reparto del 24, línea 51) y en la
> antialucinación. El clonado quedó descartado el 30-jul y la antialucinación
> se midió ese mismo día: no hace lo que promete su nombre. Las dos columnas
> del guion viejo se cayeron, y este es el arco que las sustituye.

## Reparto de voces

**Angel narra los bloques 2, 3 y 5.** Son primera persona: su historial, su
dicción, su medición. Narrados por otro no son otra versión del mismo bloque,
son una afirmación más débil, contada de oídas.

**Fer abre (bloque 1) y remata el cierre.** Son afirmaciones de producto, no
requieren primera persona. Unos veinte segundos: presencia real de los dos, sin
duplicar tomas ni tener que elegir en edición.

No grabéis los cinco bloques por duplicado. Mañana Fer tiene la landing, que es
la otra mitad de la entrega. Si al montar falta una alternativa de algún bloque,
se graba entonces, en dos minutos.

## Antes de grabar

- [ ] **Modelo: Whisper Large v3.** Nunca Turbo — transcribe peor (24 aciertos
      frente a 34 sobre el mismo audio) y el motor **rechaza** la tarea de
      traducción con `unsupported task`.
- [ ] **Proveedor de post-proceso: Apple Intelligence.** Es on-device, así que el
      bloque 4 no obliga a reencender el WiFi.
- [ ] Detección de actividad de voz **encendida** (por defecto). Es lo que evita
      que un silencio se transcriba como basura.
- [ ] Micrófono: la Audio-Technica. Y dicción de locución: hoy se midió que la
      entrada es la palanca que más mueve el resultado.
- [ ] Perfiles creados y probados una vez (el primer arranque carga el modelo).
- [ ] La tabla de reemplazos con dos o tres entradas visibles y legibles.
- [ ] Historial con las tomas donde el mismo término salió de tres formas.
- [ ] Editor a pantalla completa, tipografía grande.

## 0:00-0:25 · Gancho — **voz: Fer**

> «Esto es Diapasón. Dictado por voz que nunca sale de tu Mac.»
> → **apagar el WiFi en pantalla**
> «Sin nube, sin cuenta, sin red.»
> → dictar dos frases; aparece el texto
> «Catorce veces más rápido que tiempo real. En tu máquina.»

Cifra medida el 30-jul sobre el `.dmg` de release con Large v3: **14,16x**
(75,15 s de audio en 5,31 s). No redondear a «casi quince»: la gracia es que
es exacta y comprobable.

## 0:25-0:55 · El dolor — **voz: Angel**

> «Pero el problema no es la velocidad. Es esto.»
> → **enseñar el historial**: la misma palabra transcrita de tres formas
> «La misma palabra. La misma persona. El mismo micrófono. Tres tomas seguidas,
> tres resultados distintos.»

El corazón del vídeo. `Takhygraphe` salió `Tachygraf`, `Taquígrafe` y
`Tachygraph` en tres lecturas del mismo texto. Está en el historial, no en una
diapositiva: es un fallo propio, medido y enseñado, y eso no lo va a tener
ningún otro proyecto.

## 0:55-1:25 · La capa personal — **voz: Angel**

> «Tu vocabulario es tuyo: tus marcas, tus herramientas, tu mezcla de inglés y
> castellano.»
> → **enseñar la tabla de reemplazos** (dos o tres entradas, no las 27)
> «Diapasón aprende esas correcciones y las aplica siempre.»
> → dictar lo mismo de antes; ahora sale bien

Momento estrella. Sustituye al de «meter los nombres del jurado en el prompt de
contexto», que iba a fallar: ese prompt se midió y vale una coma en 926
caracteres. La tabla sí funciona — **37 → 43 aciertos de 53** dentro de la app.

## 1:25-1:45 · Perfiles — **voz: Angel**

> «Mismo micrófono, distinta intención. Cada perfil tiene su idioma, su
> procesado y su atajo.»
> → `⌥⇧E`, dictar en español, **sale en inglés**
> «Y seguimos sin WiFi. Esto también es local.»

Con Apple Intelligence no hay que reencender la red, así que el bloque refuerza
el gancho en vez de contradecirlo.

## 1:45-2:00 · Cierre — **voz: Angel, remate de Fer**

> «No importa si eres chileno, argentino o español. Importa cómo pronuncias tú
> el inglés, y a qué hora estás dictando.»
> «Lo universal ya lo resuelve el modelo. Lo tuyo no lo va a resolver nadie por
> ti.»
> → **Fer:** «Fork declarado de Handy. Todo lo nuestro está en un diff legible.»

Cierra sin prometer la 2.0: deja al jurado viendo el camino en lugar de una
promesa.

## Lo que NO se dice

- **Antialucinación.** Medido el 30-jul: M1 corre y no evita nada — una de sus
  dos perillas se fija al valor que ya traía el backend. Lo que protege es el
  VAD. No aparece en el vídeo, y hay que reescribir `PITCH.md` líneas 16 y 27,
  que describen ese mecanismo como una función. Es lo único del material que no
  se puede corregir después de publicar.
- **El prompt de contexto como función estrella.** Vale una coma.
- **Nada grabado con Turbo.**

## Presupuesto de tiempo

Unas 167 palabras de narración ≈ 67 s a ritmo de locución, más ~50 s de acción
en pantalla: **≈ 1:57**, con margen.

Si las bases resultan permitir 3:00, el primer bloque a recuperar es el de
errores visibles: perfil con clave rota → aviso con el error exacto y el texto
crudo pegado igualmente. Va entre Perfiles y Cierre.
