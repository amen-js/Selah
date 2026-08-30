import type { TranslationKey } from './pt-BR'

export const esES = {
  'meta.title': 'Selah — Aventura bíblica 3D',
  'meta.description':
    'Selah — una aventura bíblica 3D de exploración y reflexión.',
  'root.loadingLab': 'Cargando laboratorio…',

  'language.selector.label': 'Idioma de la interfaz',
  'language.ptBR': 'Português',
  'language.enUS': 'English',
  'language.esES': 'Español',

  'app.start.aria': 'Iniciar la aventura Selah',
  'app.paused.aria': 'Aventura Selah en pausa',
  'app.start.eyebrow': 'Un viaje de reflexión',
  'app.paused.eyebrow': 'Exploración en pausa',
  'app.start.description': 'Detente en medio del ruido. Entra en el viaje.',
  'app.paused.description':
    'Respira. Cuando estés listo, regresa al jardín.',
  'app.enter': 'Entrar al mundo',
  'app.resume': 'Continuar el viaje',
  'app.controls.aria': 'Controles del juego',
  'app.controls.move': 'Mover',
  'app.controls.space': 'Espacio',
  'app.controls.jump': 'Saltar',
  'app.controls.shift': 'Shift',
  'app.controls.run': 'Correr',
  'app.controls.mouse': 'Ratón',
  'app.controls.camera': 'Cámara',
  'app.controls.pause': 'Pausar',
  'app.controls.pauseHint': 'Presiona P en cualquier momento para pausar.',

  'onboarding.eyebrow': 'Antes del primer viaje',
  'onboarding.title': 'Configuración del responsable',
  'onboarding.description':
    'Elige cómo funcionará este viaje para el niño. Todo se puede cambiar después en el área para padres y responsables.',
  'onboarding.pause.title': 'Pausa en familia',
  'onboarding.pause.description':
    'Después de cada reflexión, la exploración se pausa hasta que un responsable libere el viaje.',
  'onboarding.privacy.title': 'Privacidad por defecto',
  'onboarding.privacy.description':
    'No hay cuenta ni identificación. Guardar el progreso y compartir métricas comienzan desactivados.',
  'onboarding.footer':
    'Al continuar, confirmas que revisaste estas opciones para el primer viaje.',
  'onboarding.action.withoutSave': 'Jugar sin guardar',
  'onboarding.action.save': 'Guardar y continuar',

  'hud.aria': 'Información y acciones de la exploración',
  'hud.region.hub': 'Valle Central',
  'hud.region.criacao': 'La Creación',
  'hud.region.noe': 'Noé y el Arca',
  'hud.region.jose': 'José, el Soñador',
  'hud.passages.one': '{count} pasaje',
  'hud.passages.other': '{count} pasajes',
  'hud.actions.aria': 'Acciones del juego',
  'hud.journal.open': 'Abrir diario',
  'hud.journal.label': 'Diario',
  'hud.metrics.open': 'Abrir métricas locales',
  'hud.metrics.label': 'Métricas',
  'hud.settings.open': 'Abrir configuración parental',
  'hud.settings.label': 'Familia',

  'portal.prompt.aria': 'Portal a {region}',
  'portal.prompt.eyebrow': 'Portal',
  'portal.prompt.enter': 'Presiona E o Enter para entrar',
  'portal.prompt.soon': 'Próximamente',
  'portal.transition.aria': 'Transición de región',
  'portal.transition.exiting': 'Preparando tu paso…',
  'portal.transition.switching': 'Entrando en {region}…',
  'portal.transition.entering': 'Bienvenido a {region}',

  'dialog.aria': 'Diálogo con {character}',
  'dialog.disclosure': 'Personaje virtual automatizado',
  'dialog.continueAria': 'Continuar diálogo',
  'dialog.continue': 'Continuar',
  'dialog.default.message':
    'La creación guarda pequeñas señales. Explora con calma y observa lo que florece en el camino.',

  'common.close': 'Cerrar',

  'journal.eyebrow': 'Recuerdos del viaje',
  'journal.title': 'Diario',
  'journal.closeAria': 'Cerrar diario',
  'journal.empty': 'Tu viaje apenas comienza.',
  'journal.passages.title': 'Pasajes encontrados',
  'journal.passages.none': 'Aún no has reunido ningún pasaje.',
  'journal.passage.eyebrow': 'Pasaje',
  'journal.passage.label': 'Pasaje {passageId}',
  'journal.quizzes.title': 'Reflexiones respondidas',
  'journal.quizzes.none': 'Aún no has respondido ninguna reflexión.',
  'journal.result': 'Respuesta {answer} · {result}',
  'journal.result.correct': 'acertaste',
  'journal.result.tryAgain': 'para reflexionar de nuevo',

  'dashboard.eyebrow': 'Solo en este dispositivo',
  'dashboard.title': 'Métricas locales',
  'dashboard.closeAria': 'Cerrar métricas locales',
  'dashboard.started': 'Selahs iniciados',
  'dashboard.completed': 'Selahs completados',
  'dashboard.completionRate': 'Tasa de finalización',
  'dashboard.accuracy.one': 'Acierto en {count} cuestionario',
  'dashboard.accuracy.other': 'Aciertos en {count} cuestionarios',
  'dashboard.note':
    'Estos números permanecen en este navegador y no identifican a quien juega.',

  'settings.eyebrow': 'Área para padres y responsables',
  'settings.title': 'Configuración',
  'settings.closeAria': 'Cerrar configuración parental',
  'settings.privacy.title': 'La privacidad es lo primero',
  'settings.privacy.description':
    'Las preferencias permanecen en este dispositivo. Las métricas solo se envían con tu consentimiento.',
  'settings.language.title': 'Idioma',
  'settings.language.description':
    'Cambia la interfaz, los pasajes y las reflexiones.',
  'settings.age.title': 'Grupo de edad',
  'settings.age.description': 'Adapta el lenguaje de las reflexiones.',
  'settings.age.label': 'Seleccionar grupo de edad',
  'settings.age.general': 'General',
  'settings.age.child': 'Niño',
  'settings.tts.label': 'Lectura en voz alta',
  'settings.tts.description':
    'Permite escuchar el pasaje cuando haya compatibilidad.',
  'settings.ai.label': 'Reflexiones con IA',
  'settings.ai.description':
    'Cuando está desactivada, usa preguntas bíblicas revisadas.',
  'settings.save.label': 'Guardar progreso',
  'settings.save.description':
    'Guarda pasajes y resultados mínimos en este navegador.',
  'settings.metrics.label': 'Compartir métricas anónimas',
  'settings.metrics.description':
    'Envía solo eventos mínimos, sin historial ni identificación.',
  'settings.delete.title': 'Borrar progreso local',
  'settings.delete.description':
    'Elimina los pasajes, resultados y preferencias guardados en este navegador.',
  'settings.delete.cancel': 'Cancelar',
  'settings.delete.confirmAria': 'Confirmar eliminación del progreso local',
  'settings.delete.confirm': 'Confirmar eliminación',
  'settings.delete.aria': 'Borrar todo el progreso local',
  'settings.delete.action': 'Borrar progreso',

  'pause.eyebrow': 'Pausa Selah',
  'pause.title': 'Un momento con quien cuida de ti',
  'pause.description':
    'Conversen sobre el pasaje antes de continuar la exploración.',
  'pause.instruction':
    'Un padre o responsable puede mantener presionado el botón para liberar el viaje.',
  'pause.holdAria':
    'Mantener presionado para que un responsable libere la exploración',
  'pause.holdAction': 'Mantener presionado',
  'pause.statusHolding': 'Sigue presionando…',
  'pause.statusIdle': 'Esperando a un responsable',

  'selah.moment': 'Momento Selah',
  'selah.error.title': 'No pudimos abrir este momento.',
  'selah.error.exit': 'Salir del momento',
  'selah.loading.eyebrow': 'Respira hondo',
  'selah.loading.title': 'Preparando tu reflexión…',
  'selah.loading.status': 'Cargando pasaje y pregunta',
  'selah.verse.eyebrow': 'Pasaje · {reference}',
  'selah.tts.unavailable':
    'La lectura en voz alta no está disponible en este navegador. El texto permanece disponible para leer.',
  'selah.tts.listenAria': 'Escuchar el pasaje en voz alta',
  'selah.tts.action': 'Escuchar pasaje',
  'selah.tts.preparingAria': 'Preparando lectura en voz alta',
  'selah.tts.preparingAction': 'Preparando voz…',
  'selah.tts.pauseAria': 'Pausar lectura en voz alta',
  'selah.tts.pauseAction': 'Pausar lectura',
  'selah.tts.resumeAria': 'Continuar lectura en voz alta',
  'selah.tts.resumeAction': 'Continuar lectura',
  'selah.tts.disclosure':
    'Voz generada por IA; si no está disponible, se usará la voz del dispositivo.',
  'selah.tts.fallbackStatus': 'Usando la voz de este dispositivo.',
  'selah.tts.error': 'No se pudo reproducir este pasaje.',
  'selah.quiz.continueAria': 'Continuar a la pregunta',
  'selah.continue': 'Continuar',
  'selah.quiz.aiStatus': 'Pregunta creada para esta reflexión',
  'selah.quiz.fallbackStatus': 'Pregunta bíblica revisada',
  'selah.quiz.alternativeAria': 'Opción {id}: {text}',
  'selah.quiz.checking': 'Verificando respuesta…',
  'selah.feedback.correct': 'Acertaste',
  'selah.feedback.incorrect': 'Reflexionemos un poco más',
  'selah.feedback.startPause': 'Comenzar pausa en familia',

  'flow.loadError':
    'No pudimos cargar este momento. Inténtalo de nuevo en unos instantes.',
  'flow.answerError':
    'No pudimos verificar tu respuesta. Inténtalo de nuevo.',

  'lab.controls.aria': 'Controles del laboratorio de interfaz',
  'lab.title': 'Laboratorio Selah',
  'lab.scenario.label': 'Escenario',
  'lab.scenario.success': 'Éxito con IA',
  'lab.scenario.fallback': 'Fallback aprobado',
  'lab.scenario.error': 'Error de red',
  'lab.startSelah': 'Abrir Selah',
  'lab.showDialog': 'Mostrar diálogo',
  'lab.activatePause': 'Activar pausa parental',
  'lab.resetAria': 'Restaurar estado del laboratorio',
  'lab.reset': 'Restaurar',
  'lab.areaAria': 'Área de simulación del laboratorio',
  'lab.routeEyebrow': 'Entorno aislado',
  'lab.placeholder.title': 'Interfaz sin Canvas',
  'lab.placeholder.description':
    'Usa los controles de arriba para simular cada etapa del viaje.',
  'lab.dialog.message':
    'La creación guarda señales para quien observa con calma. ¿Qué detalle notaste primero?',
} satisfies Record<TranslationKey, string>
