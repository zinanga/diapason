⚔️ **[HACKATHON IMPERIAL] Diapasón — ENTREGA FINAL**

**1️⃣ Nombre del proyecto:** Diapasón 🎼 (rebrand de Handy) — *tu voz, afinada*.

**2️⃣ Nuestra dupla:** @Fernando Lopez y @Angel Zinsel

**3️⃣ Estado:** ENTREGA FINAL — v0.4.1

**4️⃣ Qué construimos**

Dictado por voz que no sale de tu Mac. Sin cuenta, sin login, sin API key.

- **Whisper Large v3 en local.** 14 veces más rápido que tiempo real: 75 s de audio transcritos en 5,31.
- **El phraser va con Apple Intelligence on-device.** Las bases daban por hecho un LLM con tu propia clave de pago. Aquí no hace falta ni clave ni red.
- **Correcciones personales.** Una tabla literal que arregla lo que el modelo te escribe mal siempre: `Cloud Code` → `Claude Code`, `Create Client` → `createClient`. Medido dentro de la app sobre 53 términos técnicos: **37 → 43 aciertos**.
- **Perfiles con atajo propio:** idioma, procesado y tecla distintos por perfil.
- **Errores visibles:** nunca falla en silencio.

Fork declarado de Handy (MIT, de CJ Pais). Todo lo nuestro está en un diff legible.

**5️⃣ Vídeo y descarga**

🎬 Vídeo demo (2 min): *[adjunto]*
🌐 Web y descarga: **https://diapason-pearl.vercel.app/**
💻 Código: https://github.com/zinanga/diapason

> **Instalación:** arrástrala a **Aplicaciones** y **expulsa el disco** antes de abrirla — si la abres desde el `.dmg`, macOS no guarda los permisos de micrófono. Al abrirla, el sistema la bloqueará porque no está notarizada: ve a **Ajustes del Sistema → Privacidad y seguridad** y pulsa **«Abrir igualmente»**. Solo la primera vez. Los pasos con detalle, en la web.

**6️⃣ Qué feedback buscamos**

La misma pregunta de siempre, que ya nos ha dado material: **¿qué palabras te destroza siempre el dictado?** Cada una que nos deis entra en la medición y en la tabla.

Y la que dejamos abierta en el avance 2: esa capa de correcciones, ¿la queréis **automática**, que aprenda sola de lo que vais corrigiendo, o **manual**, con control total?
