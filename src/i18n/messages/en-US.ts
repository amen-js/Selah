import type { TranslationKey } from './pt-BR'

export const enUS = {
  'meta.title': 'Selah — 3D biblical journey',
  'meta.description':
    'Selah — a 3D biblical journey of exploration and reflection.',
  'root.loadingLab': 'Loading laboratory…',

  'language.selector.label': 'Interface language',
  'language.ptBR': 'Português',
  'language.enUS': 'English',
  'language.esES': 'Español',

  'app.start.aria': 'Start the Selah journey',
  'app.paused.aria': 'Selah journey paused',
  'app.start.eyebrow': 'A journey of reflection',
  'app.paused.eyebrow': 'Exploration paused',
  'app.start.description': 'Pause amid the noise. Step into the journey.',
  'app.paused.description':
    'Breathe. When you are ready, return to the garden.',
  'app.enter': 'Enter the world',
  'app.resume': 'Continue journey',
  'app.controls.aria': 'Game controls',
  'app.controls.move': 'Move',
  'app.controls.space': 'Space',
  'app.controls.jump': 'Jump',
  'app.controls.shift': 'Shift',
  'app.controls.run': 'Run',
  'app.controls.mouse': 'Mouse',
  'app.controls.camera': 'Camera',
  'app.controls.pause': 'Pause',
  'app.controls.pauseHint': 'Press P at any time to pause.',

  'onboarding.eyebrow': 'Before the first journey',
  'onboarding.title': 'Responsible adult setup',
  'onboarding.description':
    'Choose how this journey will work for the child. Everything can be changed later in the parent and guardian area.',
  'onboarding.pause.title': 'Family pause',
  'onboarding.pause.description':
    'After each reflection, exploration pauses until a responsible adult unlocks the journey.',
  'onboarding.privacy.title': 'Privacy by default',
  'onboarding.privacy.description':
    'There is no account or identification. Saving progress and sharing metrics start turned off.',
  'onboarding.footer':
    'By continuing, you confirm that you reviewed these choices for the first journey.',
  'onboarding.action.withoutSave': 'Play without saving',
  'onboarding.action.save': 'Save and continue',

  'hud.aria': 'Exploration information and actions',
  'hud.region.hub': 'Central Valley',
  'hud.region.criacao': 'Creation',
  'hud.region.noe': 'Noah and the Ark',
  'hud.region.jose': 'Joseph the Dreamer',
  'hud.passages.one': '{count} passage',
  'hud.passages.other': '{count} passages',
  'hud.actions.aria': 'Game actions',
  'hud.journal.open': 'Open journal',
  'hud.journal.label': 'Journal',
  'hud.metrics.open': 'Open local metrics',
  'hud.metrics.label': 'Metrics',
  'hud.settings.open': 'Open parental settings',
  'hud.settings.label': 'Parents',

  'portal.prompt.aria': 'Portal to {region}',
  'portal.prompt.eyebrow': 'Portal',
  'portal.prompt.enter': 'Press E or Enter to enter',
  'portal.prompt.soon': 'Coming soon',
  'portal.transition.aria': 'Region transition',
  'portal.transition.exiting': 'Preparing your passage…',
  'portal.transition.switching': 'Entering {region}…',
  'portal.transition.entering': 'Welcome to {region}',

  'dialog.aria': 'Dialogue with {character}',
  'dialog.disclosure': 'Automated virtual character',
  'dialog.continueAria': 'Continue dialogue',
  'dialog.continue': 'Continue',
  'dialog.default.message':
    'Creation holds little signs. Explore slowly and notice what blooms along the way.',

  'common.close': 'Close',

  'journal.eyebrow': 'Journey memories',
  'journal.title': 'Journal',
  'journal.closeAria': 'Close journal',
  'journal.empty': 'Your journey is just beginning.',
  'journal.passages.title': 'Passages found',
  'journal.passages.none': 'No passages collected yet.',
  'journal.passage.eyebrow': 'Passage',
  'journal.passage.label': 'Passage {passageId}',
  'journal.quizzes.title': 'Reflections answered',
  'journal.quizzes.none': 'No reflections answered yet.',
  'journal.result': 'Answer {answer} · {result}',
  'journal.result.correct': 'correct',
  'journal.result.tryAgain': 'reflect again',

  'dashboard.eyebrow': 'Only on this device',
  'dashboard.title': 'Local metrics',
  'dashboard.closeAria': 'Close local metrics',
  'dashboard.started': 'Selahs started',
  'dashboard.completed': 'Selahs completed',
  'dashboard.completionRate': 'Completion rate',
  'dashboard.accuracy.one': 'Correct answer in {count} quiz',
  'dashboard.accuracy.other': 'Correct answers in {count} quizzes',
  'dashboard.note':
    'These numbers stay in this browser and do not identify who is playing.',

  'settings.eyebrow': 'Parent and guardian area',
  'settings.title': 'Settings',
  'settings.closeAria': 'Close parental settings',
  'settings.privacy.title': 'Privacy first',
  'settings.privacy.description':
    'Preferences stay on this device. Metrics are sent only with your consent.',
  'settings.language.title': 'Language',
  'settings.language.description':
    'Changes the interface, passages, and reflections.',
  'settings.age.title': 'Age group',
  'settings.age.description': 'Adjusts the language used in reflections.',
  'settings.age.label': 'Select age group',
  'settings.age.general': 'General',
  'settings.age.child': 'Child',
  'settings.tts.label': 'Read aloud',
  'settings.tts.description':
    'Lets you listen to the passage when supported.',
  'settings.ai.label': 'AI reflections',
  'settings.ai.description':
    'When turned off, uses reviewed biblical questions.',
  'settings.save.label': 'Save progress',
  'settings.save.description':
    'Stores passages and minimal results in this browser.',
  'settings.metrics.label': 'Share anonymous metrics',
  'settings.metrics.description':
    'Sends only minimal events, without history or identification.',
  'settings.delete.title': 'Delete local progress',
  'settings.delete.description':
    'Removes passages, results, and preferences saved in this browser.',
  'settings.delete.cancel': 'Cancel',
  'settings.delete.confirmAria': 'Confirm deletion of local progress',
  'settings.delete.confirm': 'Confirm deletion',
  'settings.delete.aria': 'Delete all local progress',
  'settings.delete.action': 'Delete progress',

  'pause.eyebrow': 'Selah Pause',
  'pause.title': 'A moment with someone who cares for you',
  'pause.description':
    'Talk about the passage before continuing the exploration.',
  'pause.instruction':
    'A parent or guardian can hold the button to unlock the journey.',
  'pause.holdAria':
    'Hold for a parent or guardian to unlock exploration',
  'pause.holdAction': 'Hold to continue',
  'pause.statusHolding': 'Keep holding…',
  'pause.statusIdle': 'Waiting for a parent or guardian',

  'selah.moment': 'Selah Moment',
  'selah.error.title': 'We could not open this moment.',
  'selah.error.exit': 'Leave this moment',
  'selah.loading.eyebrow': 'Take a deep breath',
  'selah.loading.title': 'Preparing your reflection…',
  'selah.loading.status': 'Loading passage and question',
  'selah.verse.eyebrow': 'Passage · {reference}',
  'selah.tts.unavailable':
    'Read aloud is unavailable in this browser. The text remains available to read.',
  'selah.tts.listenAria': 'Listen to passage aloud',
  'selah.tts.action': 'Listen to passage',
  'selah.tts.preparingAria': 'Preparing read aloud',
  'selah.tts.preparingAction': 'Preparing voice…',
  'selah.tts.pauseAria': 'Pause reading aloud',
  'selah.tts.pauseAction': 'Pause reading',
  'selah.tts.resumeAria': 'Continue reading aloud',
  'selah.tts.resumeAction': 'Continue reading',
  'selah.tts.disclosure':
    'AI-generated voice; if unavailable, your device voice will be used.',
  'selah.tts.fallbackStatus': 'Using this device’s voice.',
  'selah.tts.error': 'This passage could not be played.',
  'selah.quiz.continueAria': 'Continue to the question',
  'selah.continue': 'Continue',
  'selah.quiz.aiStatus': 'Question created for this reflection',
  'selah.quiz.fallbackStatus': 'Reviewed biblical question',
  'selah.quiz.alternativeAria': 'Option {id}: {text}',
  'selah.quiz.checking': 'Checking answer…',
  'selah.feedback.correct': 'You got it right',
  'selah.feedback.incorrect': 'Let us reflect a little more',
  'selah.feedback.startPause': 'Start family pause',

  'flow.loadError':
    'We could not load this moment. Please try again shortly.',
  'flow.answerError': 'We could not check your answer. Please try again.',

  'lab.controls.aria': 'Interface laboratory controls',
  'lab.title': 'Selah Laboratory',
  'lab.scenario.label': 'Scenario',
  'lab.scenario.success': 'AI success',
  'lab.scenario.fallback': 'Approved fallback',
  'lab.scenario.error': 'Network error',
  'lab.startSelah': 'Open Selah',
  'lab.showDialog': 'Show dialogue',
  'lab.activatePause': 'Activate parental pause',
  'lab.resetAria': 'Reset laboratory state',
  'lab.reset': 'Reset',
  'lab.areaAria': 'Laboratory simulation area',
  'lab.routeEyebrow': 'Isolated environment',
  'lab.placeholder.title': 'Interface without Canvas',
  'lab.placeholder.description':
    'Use the controls above to simulate each stage of the journey.',
  'lab.dialog.message':
    'Creation holds signs for those who watch slowly. What detail did you notice first?',
} satisfies Record<TranslationKey, string>
