# Landing — especificaciones para Fer

Todo lo de aquí está **medido o verificado el 30-jul**, no estimado. Si algo no
aparece en este documento, no se afirma en la web.

---

## 1. Qué se puede decir, y con qué respaldo

| Afirmación | Respaldo |
|---|---|
| **100 % local**: la transcripción no sale del Mac | Verificado: se dicta con el WiFi apagado |
| **Sin cuenta, sin login, sin API key** | El post-proceso usa Apple Intelligence on-device |
| **14 veces más rápido que tiempo real** | Medido en el `.dmg` de release: 75,15 s de audio en 5,31 s |
| **Whisper Large v3** como motor | Es el modelo por defecto |
| **Correcciones personales**: aprende tu vocabulario | Medido en la app: 37 → 43 aciertos de 53 |
| **Perfiles** con atajo propio: idioma, procesado y atajo por perfil | Función existente |
| **Errores visibles**: nunca falla en silencio | Función existente |
| **Código abierto, MIT** | Fork declarado de Handy |

## 2. Qué NO se dice

- ❌ **Antialucinación.** Se midió el 30-jul y no hace lo que promete el nombre.
  No aparece en la web, ni en el vídeo, ni en el pitch.
- ❌ **«Funciona sin conexión desde el minuto uno».** Es falso en el primer
  arranque (ver punto 4).
- ❌ Cifras de velocidad que no sean la de arriba.

## 3. Requisitos del sistema

- **macOS con Apple Silicon** (M1 o posterior). El `.dmg` es `aarch64`: en un Mac
  Intel no arranca. Conviene decirlo en la web, no dejar que se descubra.
- macOS 11 o superior.
- **~1 GB de espacio** para el modelo, más 17 MB de la app.
- El post-proceso con IA requiere **Apple Intelligence activado** en Ajustes del
  sistema. Sin él, la transcripción funciona igual; lo que no está es el
  procesado posterior.

## 4. El primer arranque descarga el modelo — hay que decirlo

Dentro del `.dmg` viajan la app y el detector de voz (1,7 MB). **El modelo de
transcripción no**: se descarga la primera vez, y son unos 1 000 MB.

Es la diferencia entre «100 % local» —cierto— y «funciona sin internet desde el
primer segundo» —falso—. Decirlo antes evita que alguien abra la app en un avión
y concluya que está rota.

Texto sugerido, junto a la descarga:

> La primera vez, Diapasón descarga el modelo de voz (~1 GB). A partir de ahí
> funciona sin conexión, siempre.

## 5. Instalación — el aviso que necesita cualquiera

La app se distribuye sin firma de desarrollador de Apple, porque notarizar exige
una cuenta de pago. **Todas las entregas del hackathon van a tener esta misma
fricción**: el que la explique mejor gana un punto de usabilidad.

**Versión corta, junto al botón:**

> La primera vez: **clic derecho sobre la app → Abrir**.

**Versión larga, en la sección de ayuda:**

> 1. Abre el `.dmg` y arrastra **Diapasón** a la carpeta Aplicaciones.
> 2. **Expulsa el disco.** Si abres la app desde el `.dmg`, macOS la ejecuta en
>    una ruta temporal y los permisos de micrófono no se guardan.
> 3. Ábrela desde Aplicaciones con **clic derecho → Abrir → Abrir**. Solo hace
>    falta la primera vez.
> 4. Concede micrófono y accesibilidad cuando los pida.

## 6. El fichero

Publicar **`Diapason_0.4.1_aarch64.dmg`** — el del nombre en ASCII. El nombre con
tilde rompe la descarga por HTTP. Son copias idénticas, pero el enlazado tiene
que ser el mismo que se ha hasheado.

```
SHA256  ee8216880141cd1fe36a5c1e0eb41f2df86703633fc57c9a507d4a024f2d20d4
```

**Es la 0.4.1, no la 0.4.0.** Cambia el identificador del bundle, que antes era
el de Handy y hacía que en un Mac que ya hubiera tenido Handy instalado el
permiso de Accesibilidad no prendiera nunca. Importa para el jurado: van a
probar varias entregas seguidas y casi todas son forks de Handy.

## 7. Atribución obligatoria

Fork de [Handy](https://github.com/cjpais/handy), de CJ Pais, licencia **MIT**.
El `LICENSE` conserva su copyright, que es requisito al distribuir. En la web
tiene que verse el reconocimiento y el enlace al proyecto original.

## 8. El ángulo que no está usado

Las bases del hackathon asumen que el *phraser* lleva **tu propia API key** (un
Flash, un Haiku). Diapasón lo hace **on-device con Apple Intelligence**: sin
clave, sin nube, sin coste por uso.

Está por encima de lo que pide el brief, en la capa que ellos daban por sentada.
Ahora mismo no aparece ni en el pitch ni en la web. Es la frase que os separa.
