# Entrega — viernes 31 de julio

**Límite oficial: 20:00 hora de Chile** (02:00 del sábado en España).
Margen autoimpuesto: **18:00 Chile** = medianoche del viernes en España.

Tres entregables: **app descargable** (sin login, corre local) · **landing que
convierta y desde la que se descargue** · **vídeo de máximo 2:00**.

---

## El aviso de macOS — texto y dónde tiene que aparecer

El `.dmg` va con firma ad-hoc y sin notarizar, porque notarizar exige cuenta de
desarrollador de Apple (99 $/año) y nadie la saca antes de saber si gana. **Todas
las entregas del hackathon van a tener esta misma fricción**, así que no es un
problema a esconder: es un detalle de trato al usuario que se puede hacer mejor
que los demás. Un juez que va por su décima instalación agradece la línea.

**Texto corto, para el botón de descarga:**

> La primera vez: **clic derecho sobre la app → Abrir**. macOS pide confirmación
> porque la app no está notarizada.

**Texto largo, para las notas de la release y la sección de ayuda:**

> Diapasón es open source y se distribuye sin firma de desarrollador de Apple.
> La primera vez que la abras, macOS te avisará de que no puede verificarla:
> **clic derecho sobre `Diapasón.app` → Abrir → Abrir**. Solo hace falta una vez.
>
> Y un paso que importa: **arrastra la app a Aplicaciones y expulsa el disco
> antes de abrirla**. Si la abres desde el `.dmg`, macOS la ejecuta en una ruta
> temporal y los permisos de micrófono no se guardan.

**Dónde tiene que aparecer:**

- [ ] **Landing**, junto al botón de descarga (versión corta) — lo lleva Fer
- [ ] **Notas de la release en GitHub** (versión larga)
- [ ] **Post de entrega final** en Skool, una línea
- [x] README del repo — ya está
- [x] Pantalla de bienvenida del onboarding — ya está

## El fichero a publicar

Publicar **`Diapason_0.4.0_aarch64.dmg`**, el del nombre en ASCII: el nombre con
tilde rompe la descarga por HTTP. Son copias idénticas, pero el que se enlace
tiene que ser el mismo que se ha hasheado.

```
SHA256  22bec1c0b082726832ce505d21a5ee61db03182339240e01a607a0e7d9759868
```

## QA de instalación limpia — lo hace Fer

Es el único que prueba lo que la máquina de desarrollo no puede: allí ya hay
ajustes escritos, modelo descargado y permisos concedidos. En un Mac limpio se
recorren cuatro caminos que **nadie ha probado con 0.4.0**.

- [ ] **Gatekeeper y permisos desde cero.** Arrastrar a Aplicaciones, expulsar el
      disco, abrir con clic derecho, conceder micrófono y accesibilidad. Si algo
      de esto necesita más de una explicación, hay que arreglar el texto de la
      landing, no al usuario.
- [ ] **Descarga del modelo en el primer arranque.** El `.dmg` no lleva modelo de
      transcripción: se baja ~1 GB la primera vez. Cronometrar y comprobar que la
      interfaz explica lo que está pasando en vez de parecer colgada.
- [ ] **La tabla de correcciones aparece sola.** En una instalación limpia no hay
      `settings_store.json`, así que las 27 entradas las tiene que poner el valor
      por defecto de `serde`. Comprobar dictando «Cloud Code» → debe salir
      «Claude Code». Si no aparece, la función no viaja en el `.dmg` y hay que
      saberlo esta noche, no mañana.
- [ ] **El onboarding.** Hay un fallo conocido y diferido: la pantalla de
      bienvenida parpadea y salta a permisos. Está descrito al final de este
      documento y en `CONFIGURACION-DEMO.md` — no es nuevo. Lo que interesa saber
      es **si sigue pasando en 0.4.0** o si desapareció con el rediseño.
- [ ] **Un dictado real** con su voz y su micro. Es además la segunda persona que
      prueba la app: hasta ahora todas las mediciones son de una sola voz.

## Antes de publicar

- [ ] **Abrir el repositorio.** Hoy es privado. El cierre del vídeo dice «todo lo
      nuestro está en un diff legible», y esa frase solo es cierta si se puede
      leer. Comprobado el 30-jul: no hay claves ni credenciales en el árbol ni en
      todo el historial, y el `LICENSE` conserva el copyright MIT de CJ Pais,
      obligatorio al distribuir el `.dmg`.
- [ ] **Reescribir `PITCH.md`, líneas 16 y 27**: describen la antialucinación
      como una función y se midió el 30-jul que no hace nada. Es lo único del
      material que no se corrige después de publicar.
- [ ] Vídeo grabado con **Whisper Large v3**, nunca con Turbo.
- [ ] Post final con el formato de seis puntos y estado **ENTREGA FINAL**.
