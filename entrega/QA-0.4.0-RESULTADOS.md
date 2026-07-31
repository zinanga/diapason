# QA Diapasón 0.4.0 — resultados

**Fecha:** 2026-07-30 (noche)
**Build probado:** `Diapason_0.4.0_aarch64.dmg` (Release v0.4.0, 18,2 MB)
**Máquina:** Mac Apple Silicon de Fernando
**Veredicto:** **PASA.** No hace falta recompilar.

---

## Test decisivo — tabla de correcciones

Dictado «Cloud code» → **salió «Claude Code»**. Correcto.

Lo importante: funciona **sin `settings_store.json`**. La tabla de correcciones viaja
dentro del `.dmg` con los valores por defecto de `serde`, así que un usuario que
instala limpio la tiene desde el primer arranque. Era la duda que bloqueaba la
decisión de recompilar esa noche — resuelta, no hace falta.

## Instalación limpia

1. Desinstalada la 0.3.0 a fondo: app + `~/Library/Application Support/com.pais.handy`,
   `~/Library/Caches/com.pais.handy`, `~/Library/Logs/com.pais.handy`.
2. Instalada la 0.4.0 desde el `.dmg`.

**Incidencia encontrada — permiso de Accesibilidad huérfano.** Tras instalar, el
permiso de la instalación vieja quedaba colgado: mismo bundle id (`com.pais.handy`)
pero firma ad-hoc distinta en cada build, así que macOS lo ve como otra app y no
reutiliza el permiso concedido.

Se arregló con:

```bash
tccutil reset Accessibility com.pais.handy
```

Esto **le va a pasar a cualquiera que actualice desde una versión anterior**, no solo
en pruebas. Merece una línea en las instrucciones de instalación, o mirar si firmando
de forma estable desaparece.

## Perfiles

Creado un perfil nuevo con traducción a inglés y probado. Funciona.

## Descarga del modelo — dato sospechoso, sin confirmar

La descarga del modelo fue **inmediata**, y son ~1 GB. No cuadra con una descarga
real recién instalado.

Hipótesis: el modelo estaba cacheado en una ruta que la limpieza de
`com.pais.handy` (Application Support / Caches / Logs) no cubre. Si es así, **el
primer arranque de un usuario nuevo de verdad no se ha probado todavía** — ni el
tiempo que tarda, ni si la interfaz explica lo que está pasando o parece colgada.

Ángel: ¿dónde cae el modelo exactamente? Con esa ruta se repite la prueba en frío.

---

## Pendiente de verificar (no bloquea la entrega)

- [ ] **SHA256 del `.dmg`** — el publicado en `ENTREGA-VIERNES-31.md` es
      `22bec1c0b082726832ce505d21a5ee61db03182339240e01a607a0e7d9759868`,
      **todavía sin contrastar con `shasum -a 256` contra el binario descargado.**
      Hacerlo antes de enlazarlo en la landing o en ningún sitio público.
- [ ] Primer arranque en frío de verdad (ver arriba): cronometrar la descarga del
      modelo y ver qué muestra la interfaz mientras tanto.
- [ ] Onboarding completo desde cero y dictado largo con voz real.

## Cosas tuyas que siguen abiertas

- [ ] **`zinanga/diapason` sigue privado.** El link de descarga
      (`releases/download/v0.4.0/...`) da **404** a cualquiera sin acceso al repo.
      Mientras siga así, el botón de la landing no sirve.
- [ ] `PITCH.md`, líneas 16 y 27: siguen mencionando la antialucinación, que está
      retirada. ¿Lo corriges tú o lo hago desde aquí?
