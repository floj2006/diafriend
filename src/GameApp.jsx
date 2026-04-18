import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'diafriends_storybook_v3';
const RANGE_MIN = 4;
const RANGE_MAX = 8;
const PLAYGROUND_BASE_GLUCOSE = 3.6;
const EVENING_SCENARIO_GLUCOSE = 8.6;

const PLAYGROUND_VARIANTS = [
  { start: 3.4, title: 'После качелей сахар крови стал низким.', helper: 'Сначала поднимаем сахар крови, а потом снова играем.' },
  { start: 3.6, title: 'После бега сахар крови стал низким.', helper: 'Сейчас важнее помочь себе, чем спешить дальше.' },
  { start: 3.8, title: 'После активной игры сахар крови стал низким.', helper: 'Сначала быстрые углеводы, потом повторная проверка.' },
];

const EVENING_VARIANTS = [
  { glucose: 3.7, title: 'Сегодня вечером сахар крови низкий.', helper: 'Часто сначала нужен сок или еда.', targetState: 'low' },
  { glucose: 6.2, title: 'Сегодня вечером сахар крови в норме.', helper: 'Можно спокойно играть, читать или отдыхать. Потом снова смотрим сахар крови.', targetState: 'normal' },
  { glucose: 8.6, title: 'Сегодня вечером сахар крови высокий.', helper: 'Может понадобиться инсулин по плану.', targetState: 'high' },
];

const SCENES = [
  { id: 'intro', chapter: 'Шаг 1', title: 'Привет от Глюкоши', mascot: 'meter' },
  { id: 'breakfast', chapter: 'Шаг 2', title: 'Собираем завтрак', mascot: 'plate' },
  { id: 'school', chapter: 'Шаг 3', title: 'Собираем рюкзачок', mascot: 'bag' },
  { id: 'playground', chapter: 'Шаг 4', title: 'Помогаем на прогулке', mascot: 'meter' },
  { id: 'evening', chapter: 'Шаг 5', title: 'Вечером смотрим сахар', mascot: 'pen' },
  { id: 'finale', chapter: 'Финал', title: 'Мои новые умения', mascot: 'meter' },
];

const INTRO_CHOICES = [
  { id: 'yes', label: 'да', emoji: '👍', icon: '' },
  { id: 'no', label: 'нет', emoji: '🙂', icon: '' },
];

const BREAKFAST_SLOTS = [
  { id: 'main', label: 'Еда', helper: 'что-то сытное', accepts: ['porridge'] },
  { id: 'side', label: 'Добавка', helper: 'что-то к еде', accepts: ['egg', 'apple', 'bun'] },
  { id: 'drink', label: 'Напиток', helper: 'что-то попить', accepts: ['water', 'soda'] },
];

const BREAKFAST_ITEMS = [
  { id: 'porridge', label: 'Овсянка', emoji: '🥣', units: 1, slot: 'main', icon: '/assets/icons/choices/breakfast/porridge.png', artKey: 'breakfast.porridge' },
  { id: 'egg', label: 'Яйцо', emoji: '🥚', units: 0, slot: 'side', icon: '/assets/icons/choices/breakfast/egg.png', artKey: 'breakfast.egg' },
  { id: 'water', label: 'Вода', emoji: '💧', units: 0, slot: 'drink', icon: '/assets/icons/choices/breakfast/water.png', artKey: 'breakfast.water' },
  { id: 'apple', label: 'Яблоко', emoji: '🍎', units: 1, slot: 'side', icon: '/assets/icons/choices/breakfast/apple.png', artKey: 'breakfast.apple' },
  { id: 'bun', label: 'Булочка', emoji: '🧁', units: 2, slot: 'side', icon: '/assets/icons/choices/breakfast/bun.png', artKey: 'breakfast.bun' },
  { id: 'soda', label: 'Газировка', emoji: '🥤', units: 2, slot: 'drink', icon: '/assets/icons/choices/breakfast/soda.png', artKey: 'breakfast.soda' },
];

const BACKPACK_ITEMS = [
  { id: 'meter', label: 'Глюкометр', emoji: '🩵', good: true, icon: '/assets/icons/choices/school/meter.png', artKey: 'school.meter' },
  { id: 'juice', label: 'Сок на случай низкого сахара', emoji: '🧃', good: true, icon: '/assets/icons/choices/school/juice.png', artKey: 'school.juice' },
  { id: 'water', label: 'Вода', emoji: '💧', good: true, icon: '/assets/icons/choices/school/water.png', artKey: 'school.water' },
  { id: 'phone', label: 'Телефон мамы или папы', emoji: '📱', good: true, icon: '/assets/icons/choices/school/phone.png', artKey: 'school.phone' },
  { id: 'chips', label: 'Чипсы', emoji: '🍟', good: false, icon: '/assets/icons/choices/school/chips.png', artKey: 'school.chips' },
  { id: 'toy', label: 'Игрушка', emoji: '🧸', good: false, icon: '/assets/icons/choices/school/toy.png', artKey: 'school.toy' },
];

const PLAYGROUND_ACTIONS = [
  {
    id: 'juice',
    label: 'Пьем сок',
    emoji: '🧃',
    delta: 1.5,
    icon: '/assets/icons/choices/playground/juice.png',
    artKey: 'playground.juice',
    note: 'Сок помогает поднять сахар крови быстрее.',
  },
  {
    id: 'cookie',
    label: 'Едим печенье',
    emoji: '🍪',
    delta: 0.8,
    icon: '/assets/icons/choices/playground/cookie.png',
    artKey: 'playground.cookie',
    note: 'Печенье тоже помогает, но медленнее, чем сок.',
  },
  {
    id: 'water',
    label: 'Пьем воду',
    emoji: '💧',
    delta: 0,
    icon: '/assets/icons/choices/playground/water.png',
    artKey: 'playground.water',
    note: 'Вода важна, но сахар крови она не поднимет.',
  },
  {
    id: 'run',
    label: 'Снова бежим',
    emoji: '🏃',
    delta: -0.7,
    icon: '/assets/icons/choices/playground/run.png',
    artKey: 'playground.run',
    note: 'Если сахар низкий, сначала помогаем себе, а потом снова играем.',
  },
];

const EVENING_STEPS = [
  { id: 'measure', label: 'Смотрим сахар крови', helper: 'узнаем цифру', emoji: '🩸', icon: '/assets/icons/choices/evening/measure.png', artKey: 'evening.measure' },
  { id: 'state', label: 'Что делать?', helper: 'смотрим, сахар низкий, нормальный или высокий', emoji: '🤔', icon: '' },
  { id: 'action', label: 'Действуем', helper: 'делаем нужный шаг', emoji: '💉', icon: '' },
  { id: 'recheck', label: 'Смотрим снова', helper: 'смотрим, что получилось после шага', emoji: '🔁', icon: '/assets/icons/choices/evening/recheck.png', artKey: 'evening.recheck' },
];

const EVENING_STATE_OPTIONS = [
  { id: 'low', label: 'Низкий сахар', helper: 'ниже 4 ммоль/л', emoji: '🔵' },
  { id: 'normal', label: 'Сахар в норме', helper: 'от 4 до 8 ммоль/л', emoji: '🟢' },
  { id: 'high', label: 'Высокий сахар', helper: 'выше 8 ммоль/л', emoji: '🔴' },
];

const EVENING_ACTION_OPTIONS = [
  { id: 'juice', label: 'Пьем сок или едим', forState: 'low', helper: 'если сахар низкий, сначала поднимаем его', emoji: '🧃', icon: '/assets/icons/choices/playground/juice.png', artKey: 'playground.juice' },
  { id: 'continue', label: 'Обычные дела', forState: 'normal', helper: 'если сахар в норме, можно спокойно играть, читать или отдыхать', emoji: '🙂', icon: '' },
  { id: 'insulin', label: 'Вводим инсулин', forState: 'high', helper: 'если сахар высокий, может понадобиться инсулин по плану', emoji: '💉', icon: '' },
];

const MASCOTS = {
  meter: {
    name: 'Глюкоша',
    role: 'глюкометр-друг',
    intro: 'Привет! Я Глюкоша. Я показываю сахар крови и спокойно подсказываю, что делать дальше.',
  },
  plate: {
    name: 'Лада',
    role: 'тарелочка-помощница',
    intro: 'Я Лада. Давай соберем завтрак и посмотрим, сколько получилось хлебных единиц.',
  },
  bag: {
    name: 'Тима',
    role: 'рюкзачок-помощник',
    intro: 'Я Тима. Давай сложим в рюкзачок вещи, которые помогают в школе.',
  },
  pen: {
    name: 'Ириска',
    role: 'инсулин-ручка',
    intro: 'Я Ириска. Вечером мы сначала смотрим сахар крови, потом решаем, что делать.',
  },
};

const MASCOT_ART = {
  meter: '/assets/icons/mascots/glukosha.png',
  plate: '/assets/icons/mascots/lada.png',
  bag: '/assets/icons/mascots/tim.png',
  pen: '/assets/icons/mascots/iriska.png',
};

const MASCOT_FIT = {
  meter: { card: { scale: 1.02, y: 4 }, large: { scale: 1.06, y: 4 } },
  plate: { card: { scale: 1.02, y: 6 }, large: { scale: 1.05, y: 6 } },
  bag: { card: { scale: 1.03, y: 4 }, large: { scale: 1.04, y: 2 } },
  pen: { card: { scale: 1.02, y: 5 }, large: { scale: 1.05, y: 5 } },
};

const CHOICE_ART_FIT = {
  'breakfast.porridge': { card: { scale: 1.02, y: 1 }, compact: { scale: 0.98 }, inline: { scale: 0.96 } },
  'breakfast.egg': { card: { scale: 0.98 }, compact: { scale: 0.94 }, inline: { scale: 0.92 } },
  'breakfast.water': { card: { scale: 0.82 }, compact: { scale: 0.8 }, inline: { scale: 0.78 } },
  'breakfast.apple': { card: { scale: 1 }, compact: { scale: 0.96 }, inline: { scale: 0.94 } },
  'breakfast.bun': { card: { scale: 1, y: 2 }, compact: { scale: 0.96, y: 1 }, inline: { scale: 0.92 } },
  'breakfast.soda': { card: { scale: 1, y: 1 }, compact: { scale: 0.96 }, inline: { scale: 0.94 } },
  'school.meter': { card: { scale: 0.98, y: 1 }, compact: { scale: 0.92 }, inline: { scale: 0.88 } },
  'school.juice': { card: { scale: 0.96, y: 1 }, compact: { scale: 0.92 }, inline: { scale: 0.88 } },
  'school.water': { card: { scale: 0.8 }, compact: { scale: 0.78 }, inline: { scale: 0.74 } },
  'school.phone': { card: { scale: 0.98, x: -1, y: 1 }, compact: { scale: 0.92 }, inline: { scale: 0.88 } },
  'school.chips': { card: { scale: 0.98, y: 1 }, compact: { scale: 0.92 }, inline: { scale: 0.88 } },
  'school.toy': { card: { scale: 0.94, y: 1 }, compact: { scale: 0.9 }, inline: { scale: 0.86 } },
  'playground.juice': { card: { scale: 0.96, y: 1 }, compact: { scale: 0.92 }, inline: { scale: 0.88 } },
  'playground.cookie': { card: { scale: 1, y: 1 }, compact: { scale: 0.94 }, inline: { scale: 0.9 } },
  'playground.water': { card: { scale: 0.82 }, compact: { scale: 0.78 }, inline: { scale: 0.74 } },
  'playground.run': { card: { scale: 0.98, y: 2 }, compact: { scale: 0.94, y: 1 }, inline: { scale: 0.9 } },
  'evening.measure': { card: { scale: 0.96, y: 1 }, compact: { scale: 0.9 }, inline: { scale: 0.86 } },
  'evening.recheck': { card: { scale: 0.96, y: 1 }, compact: { scale: 0.9 }, inline: { scale: 0.86 } },
};

const SCENE_TIPS = {
  intro: [
    'Сахар крови — это энергия для тела.',
    'Инсулин помогает этой энергии попасть туда, где она нужна.',
    'Здесь можно пробовать и учиться без страха.',
  ],
  breakfast: [
    'Хлебные единицы помогают считать углеводы в еде.',
    'Спокойный завтрак помогает сахару крови быть ровнее.',
    'Сладкие напитки поднимают сахар крови быстрее.',
  ],
  school: [
    'Глюкометр помогает вовремя посмотреть сахар крови.',
    'Сок нужен на случай низкого сахара.',
    'Телефон взрослых помогает быстро позвать на помощь.',
  ],
  playground: [
    'Низкий сахар крови часто поднимают быстрые углеводы.',
    'Вода важна, но она не поднимает сахар крови.',
    'Если сахар низкий, сначала помогаем себе, а потом снова играем.',
  ],
  evening: [
    'Сначала смотрим сахар крови.',
    'Потом решаем, что делать: сок, обычные дела или инсулин.',
    'После нужного шага смотрим сахар крови снова.',
  ],
  finale: [
    'Ты потренировался смотреть сахар крови в разных ситуациях.',
    'Ты вспомнил про хлебные единицы, сок и инсулин.',
    'Такие знания помогают чувствовать себя увереннее каждый день.',
  ],
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatBreadUnits(value) {
  const abs = Math.abs(value);
  const lastTwo = abs % 100;
  const last = abs % 10;

  if (lastTwo < 11 || lastTwo > 14) {
    if (last === 1) return `${value} хлебная единица`;
    if (last >= 2 && last <= 4) return `${value} хлебные единицы`;
  }

  return `${value} хлебных единиц`;
}

function glucoseState(glucose) {
  if (glucose < RANGE_MIN) return 'low';
  if (glucose > RANGE_MAX) return 'high';
  return 'normal';
}

function glucoseStateLabel(state) {
  if (state === 'low') return 'низкий';
  if (state === 'high') return 'высокий';
  return 'нормальный';
}

function loadStory() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function getFitStyle(config, key, variant, prefix) {
  const settings = config[key]?.[variant] || config[key]?.default || {};
  const result = {};

  if (settings.fit) result[`--${prefix}-fit`] = settings.fit;
  if (typeof settings.scale === 'number') result[`--${prefix}-scale`] = settings.scale;
  if (typeof settings.x === 'number') result[`--${prefix}-x`] = `${settings.x}px`;
  if (typeof settings.y === 'number') result[`--${prefix}-y`] = `${settings.y}px`;
  if (typeof settings.size === 'number') result[`--${prefix}-size`] = `${settings.size}px`;

  return result;
}

function MascotFigure({ id, large = false }) {
  const [broken, setBroken] = useState(false);
  const src = MASCOT_ART[id];
  const variant = large ? 'large' : 'card';
  const artStyle = getFitStyle(MASCOT_FIT, id, variant, 'mascot');

  if (src && !broken) {
    return (
      <div className={`mascot mascot-illustration ${large ? 'large' : ''}`} style={artStyle}>
        <img className="mascot-image" src={src} alt="" onError={() => setBroken(true)} />
      </div>
    );
  }

  return (
    <div className={`mascot mascot-${id} ${large ? 'large' : ''}`}>
      <div className="mascot-face">
        <span className="eye left" />
        <span className="eye right" />
        <span className="smile" />
      </div>
      {id === 'meter' && <div className="meter-screen">ммоль/л</div>}
      {id === 'bag' && <div className="bag-pocket" />}
      {id === 'plate' && <div className="plate-center" />}
      {id === 'pen' && <div className="pen-tip" />}
    </div>
  );
}

function ChoiceArt({ src, emoji, label, artKey, variant = 'card' }) {
  const [broken, setBroken] = useState(false);
  const artStyle = getFitStyle(CHOICE_ART_FIT, artKey, variant, 'choice');

  if (src && !broken) {
    return (
      <span className={`choice-art ${variant}`} style={artStyle} aria-hidden="true">
        <img src={src} alt="" onError={() => setBroken(true)} />
      </span>
    );
  }

  return (
    <span className={`choice-art fallback ${variant}`} aria-hidden="true">
      <span>{emoji}</span>
    </span>
  );
}

export default function GameApp() {
  const saved = loadStory();

  const [sceneIndex, setSceneIndex] = useState(() => {
    const savedIndex = saved?.sceneIndex;
    return typeof savedIndex === 'number' && savedIndex >= 0 && savedIndex < SCENES.length ? savedIndex : 0;
  });
  const [storySeed, setStorySeed] = useState(() => {
    const savedSeed = saved?.storySeed;
    return typeof savedSeed === 'number' ? savedSeed : Date.now() % 1000;
  });
  const [glucose, setGlucose] = useState(typeof saved?.glucose === 'number' ? saved.glucose : 5.6);
  const [knowledge, setKnowledge] = useState(typeof saved?.knowledge === 'number' ? saved.knowledge : 0);
  const [stickers, setStickers] = useState(typeof saved?.stickers === 'number' ? saved.stickers : 0);
  const [pendingGlucose, setPendingGlucose] = useState(typeof saved?.pendingGlucose === 'number' ? saved.pendingGlucose : null);
  const [introAnswer, setIntroAnswer] = useState(saved?.introAnswer ?? null);
  const [coachLine, setCoachLine] = useState('');
  const [modalData, setModalData] = useState(null);
  const [dragPayload, setDragPayload] = useState(null);
  const [dragTarget, setDragTarget] = useState('');
  const [sceneDone, setSceneDone] = useState(saved?.sceneDone ?? {
    intro: false,
    breakfast: false,
    school: false,
    playground: false,
    evening: false,
  });
  const [sceneNotes, setSceneNotes] = useState(saved?.sceneNotes ?? {});
  const [breakfastSlots, setBreakfastSlots] = useState(saved?.breakfastSlots ?? { main: null, side: null, drink: null });
  const [backpack, setBackpack] = useState(saved?.backpack ?? []);
  const [playgroundSelection, setPlaygroundSelection] = useState(saved?.playgroundSelection ?? null);
  const [playgroundLog, setPlaygroundLog] = useState(saved?.playgroundLog ?? []);
  const [playgroundReady, setPlaygroundReady] = useState(saved?.playgroundReady ?? false);
  const [eveningBoard, setEveningBoard] = useState(saved?.eveningBoard ?? {
    measure: false,
    state: null,
    action: null,
    recheck: false,
  });

  const currentScene = SCENES[sceneIndex];
  const currentMascot = MASCOTS[currentScene.mascot] || MASCOTS.meter;
  const sugarState = glucoseState(glucose);
  const sceneTips = SCENE_TIPS[currentScene.id] || SCENE_TIPS.intro;
  const progressScenes = SCENES.filter((scene) => scene.id !== 'finale');
  const playgroundVariant = PLAYGROUND_VARIANTS[storySeed % PLAYGROUND_VARIANTS.length];
  const eveningVariant = EVENING_VARIANTS[(storySeed + 1) % EVENING_VARIANTS.length];

  const breakfastItemsOnTable = useMemo(
    () => Object.values(breakfastSlots).filter(Boolean),
    [breakfastSlots],
  );

  const breakfastUnits = useMemo(
    () => breakfastItemsOnTable.reduce((sum, id) => sum + (BREAKFAST_ITEMS.find((item) => item.id === id)?.units || 0), 0),
    [breakfastItemsOnTable],
  );

  useEffect(() => {
    const openers = {
      intro: 'Привет! Я Глюкоша. Со мной можно спокойно тренироваться и узнавать новое про сахар крови.',
      breakfast: 'Лада рядом. Сначала спокойно собираем завтрак, а потом смотрим, как он может повлиять на сахар крови.',
      school: 'Тима рядом. Собираем рюкзачок так, чтобы в школе было спокойнее.',
      playground: `${playgroundVariant.title} ${playgroundVariant.helper}`,
      evening: `${eveningVariant.title} ${eveningVariant.helper}`,
      finale: 'Вот сколько всего нового ты уже умеешь!',
    };

    setCoachLine(openers[currentScene.id]);

    if (currentScene.id === 'playground' && !sceneDone.playground && !playgroundSelection && playgroundLog.length === 0) {
      setGlucose(playgroundVariant.start);
    }

    if (currentScene.id === 'evening' && !sceneDone.evening && !eveningBoard.measure && !eveningBoard.state && !eveningBoard.action) {
      setGlucose(eveningVariant.glucose);
    }
  }, [currentScene.id, eveningVariant.glucose, eveningVariant.helper, eveningVariant.title, playgroundVariant.helper, playgroundVariant.start, playgroundVariant.title, sceneDone.evening, sceneDone.playground, playgroundSelection, playgroundLog.length, eveningBoard.action, eveningBoard.measure, eveningBoard.state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const payload = {
      sceneIndex,
      storySeed,
      glucose,
      pendingGlucose,
      knowledge,
      stickers,
      introAnswer,
      sceneDone,
      sceneNotes,
      breakfastSlots,
      backpack,
      playgroundSelection,
      playgroundLog,
      playgroundReady,
      eveningBoard,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.render_game_to_text = () => JSON.stringify({
      scene: currentScene.id,
      glucose: Number(glucose.toFixed(1)),
      pendingGlucose,
      knowledge,
      stickers,
      introAnswer,
      breakfastSlots,
      backpack,
      playgroundSelection,
      playgroundLog,
      playgroundReady,
      eveningBoard,
      sceneDone,
    });
  }, [
    sceneIndex,
    storySeed,
    glucose,
    pendingGlucose,
    knowledge,
    stickers,
    introAnswer,
    sceneDone,
    sceneNotes,
    breakfastSlots,
    backpack,
    playgroundSelection,
    playgroundLog,
    playgroundReady,
    eveningBoard,
    currentScene.id,
  ]);

  const meterMood = useMemo(() => {
    if (sugarState === 'low') return 'Сахар крови сейчас низкий. Часто помогает сок или что-то сладкое.';
    if (sugarState === 'high') return 'Сахар крови сейчас высокий. Важно спокойно решить, что делать дальше.';
    return 'Сахар крови сейчас в зеленой зоне.';
  }, [sugarState]);

  const openModal = (mascotId, title, body) => {
    setModalData({ mascotId, title, body });
  };

  const finishScene = (sceneId, options) => {
    if (sceneDone[sceneId]) return;

    const {
      note,
      body,
      nextGlucose = glucose,
      addKnowledge = 1,
      addSticker = 0,
    } = options;

    setSceneDone((prev) => ({ ...prev, [sceneId]: true }));
    setSceneNotes((prev) => ({ ...prev, [sceneId]: note }));
    setKnowledge((prev) => prev + addKnowledge);
    setStickers((prev) => prev + addSticker);
    setPendingGlucose(clamp(nextGlucose, 2, 10));
    setCoachLine(note);
    openModal(currentScene.mascot, `${currentMascot.name} говорит`, body);
  };

  const goNextScene = () => {
    const nextIndex = Math.min(sceneIndex + 1, SCENES.length - 1);
    const nextSceneId = SCENES[nextIndex]?.id;

    if (nextSceneId === 'playground' && !sceneDone.playground) {
      setPendingGlucose(null);
      setGlucose(playgroundVariant.start);
    } else if (nextSceneId === 'evening' && !sceneDone.evening) {
      setPendingGlucose(null);
      setGlucose(eveningVariant.glucose);
    } else if (typeof pendingGlucose === 'number') {
      setGlucose(pendingGlucose);
      setPendingGlucose(null);
    }

    setSceneIndex(nextIndex);
  };

  const resetStory = () => {
    const nextSeed = storySeed + 1;
    setSceneIndex(0);
    setStorySeed(nextSeed);
    setGlucose(5.6);
    setPendingGlucose(null);
    setKnowledge(0);
    setStickers(0);
    setIntroAnswer(null);
    setCoachLine('');
    setModalData(null);
    setDragPayload(null);
    setDragTarget('');
    setSceneDone({ intro: false, breakfast: false, school: false, playground: false, evening: false });
    setSceneNotes({});
    setBreakfastSlots({ main: null, side: null, drink: null });
    setBackpack([]);
    setPlaygroundSelection(null);
    setPlaygroundLog([]);
    setPlaygroundReady(false);
    setEveningBoard({ measure: false, state: null, action: null, recheck: false });

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const closeModal = () => setModalData(null);

  const answerIntro = (answer) => {
    setIntroAnswer(answer);
    setSceneDone((prev) => ({ ...prev, intro: true }));
    setKnowledge((prev) => prev + 1);
    setCoachLine(answer === 'yes' ? 'Здорово, тогда идем дальше вместе.' : 'Ничего страшного. Я все равно буду рядом и помогу.');
  };

  const startStory = () => {
    setSceneIndex(1);
    setCoachLine(MASCOTS.plate.intro);
  };

  const startDrag = (payload) => setDragPayload(payload);

  const stopDrag = () => {
    setDragPayload(null);
    setDragTarget('');
  };

  const allowDrop = (event, targetId) => {
    event.preventDefault();
    setDragTarget(targetId);
  };

  const removeBreakfastItem = (slotId) => {
    if (sceneDone.breakfast) return;
    setDragPayload(null);
    setDragTarget('');
    setBreakfastSlots((prev) => ({ ...prev, [slotId]: null }));
    setCoachLine('Лада: Можно поменять блюдо. Давай соберем завтрак спокойно.');
  };

  const placeBreakfastItem = (itemId, forcedSlot = null) => {
    if (sceneDone.breakfast) return;

    const item = BREAKFAST_ITEMS.find((entry) => entry.id === itemId);
    if (!item) return;

    const slotId = forcedSlot || item.slot;
    const slot = BREAKFAST_SLOTS.find((entry) => entry.id === slotId);
    if (!slot || !slot.accepts.includes(itemId)) return;

    const currentUnitsInSlot = BREAKFAST_ITEMS.find((entry) => entry.id === breakfastSlots[slotId])?.units || 0;

    setBreakfastSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === itemId) next[key] = null;
      });
      next[slotId] = itemId;
      return next;
    });

    setCoachLine(`Лада: Готово. Сейчас на столе ${formatBreadUnits(breakfastUnits + item.units - currentUnitsInSlot)}.`);
  };

  const dropBreakfastItem = (slotId) => {
    if (dragPayload?.scene !== 'breakfast') return stopDrag();
    placeBreakfastItem(dragPayload.id, slotId);
    stopDrag();
  };

  const resetBreakfast = () => {
    setBreakfastSlots({ main: null, side: null, drink: null });
    setCoachLine('Лада: Соберем стол заново. Выбирай спокойно.');
  };

  const submitBreakfast = () => {
    const main = breakfastSlots.main;
    const side = breakfastSlots.side;
    const drink = breakfastSlots.drink;
    const hasSweetDrink = drink === 'soda';
    const hasSweetPastry = side === 'bun';

    if (!main || !drink) {
      finishScene('breakfast', {
        note: 'Завтрак лучше собирать так, чтобы было и что поесть, и что попить.',
        body: 'Лада говорит: «Давай помнить про сытную еду и напиток. Так утро начинается спокойнее».',
        addKnowledge: 1,
        addSticker: 0,
        nextGlucose: 5.8,
      });
      return;
    }

    if (main === 'porridge' && drink === 'water' && (side === 'egg' || side === 'apple')) {
      finishScene('breakfast', {
        note: 'Такой завтрак помогает сахару крови быть ровнее и спокойнее начать день.',
        body: 'Лада радуется: «Получился спокойный завтрак. Ты здорово собрал стол».',
        addKnowledge: 2,
        addSticker: 1,
        nextGlucose: 6.1,
      });
      return;
    }

    if (hasSweetDrink || hasSweetPastry) {
      finishScene('breakfast', {
        note: 'Тут много сладкого, поэтому сахар крови может подняться слишком быстро.',
        body: `Лада мягко говорит: «Сейчас на столе ${formatBreadUnits(breakfastUnits)}. На следующем шаге мы увидим, что после такого завтрака сахар крови может подняться выше».`,
        addKnowledge: 1,
        addSticker: 0,
        nextGlucose: 8.1,
      });
      return;
    }

    finishScene('breakfast', {
      note: 'Такой завтрак неплохой, но можно еще спокойнее подобрать еду и напиток.',
      body: `Лада говорит: «Сейчас получилось ${formatBreadUnits(breakfastUnits)}. На следующем шаге посмотрим, какой станет сахар крови после такого завтрака».`,
      addKnowledge: 1,
      addSticker: 0,
      nextGlucose: 6.7,
    });
  };

  const toggleBackpackItem = (itemId) => {
    if (sceneDone.school) return;
    const item = BACKPACK_ITEMS.find((entry) => entry.id === itemId);
    if (!item) return;

    setBackpack((prev) => {
      const exists = prev.includes(itemId);
      return exists ? prev.filter((id) => id !== itemId) : [...prev, itemId];
    });

    setCoachLine(backpack.includes(itemId) ? 'Тима: Убрали эту вещь. Собираем дальше.' : `Тима: Готово. «${item.label}» теперь в рюкзачке.`);
  };

  const addBackpackItem = (itemId) => {
    if (sceneDone.school) return;
    const item = BACKPACK_ITEMS.find((entry) => entry.id === itemId);
    if (!item) return;

    setBackpack((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    setCoachLine(`Тима: «${item.label}» уже внутри. Собираем дальше.`);
  };

  const dropBackpackItem = () => {
    if (dragPayload?.scene !== 'school') return stopDrag();
    addBackpackItem(dragPayload.id);
    stopDrag();
  };

  const resetBackpack = () => {
    setBackpack([]);
    setCoachLine('Тима: Начнем собирать заново. Возьмем только то, что правда помогает.');
  };

  const submitBackpack = () => {
    const requiredIds = BACKPACK_ITEMS.filter((item) => item.good).map((item) => item.id);
    const missing = requiredIds.filter((id) => !backpack.includes(id));
    const extras = backpack.filter((id) => !BACKPACK_ITEMS.find((item) => item.id === id)?.good);

    if (missing.length === 0 && extras.length === 0) {
      finishScene('school', {
        note: 'Такой рюкзачок помогает быть готовым в школе, если сахар крови изменится.',
        body: 'Тима радуется: «Отлично! Теперь в рюкзачке есть все самое нужное».',
        addKnowledge: 2,
        addSticker: 1,
      });
      return;
    }

    if (missing.length === 0) {
      const extraNames = extras.map((id) => BACKPACK_ITEMS.find((item) => item.id === id)?.label.toLowerCase()).join(', ');
      finishScene('school', {
        note: 'Главные вещи уже взяты. Лишние вещи можно не брать: они не помогают следить за сахаром крови.',
        body: `Тима говорит: «Самое важное уже в рюкзачке. А ${extraNames} можно оставить дома».`,
        addKnowledge: 1,
        addSticker: 0,
      });
      return;
    }

    const missingNames = missing.map((id) => BACKPACK_ITEMS.find((item) => item.id === id)?.label.toLowerCase()).join(', ');
    finishScene('school', {
      note: 'В рюкзачке лучше держать глюкометр, сок, воду и телефон взрослых.',
      body: `Тима подсказывает: «Нам еще нужны ${missingNames}. Эти вещи правда помогают в школе».`,
      addKnowledge: 1,
      addSticker: 0,
    });
  };

  const selectPlaygroundAction = (actionId) => {
    if (sceneDone.playground) return;
    if (playgroundSelection && playgroundSelection !== actionId) return;

    const action = PLAYGROUND_ACTIONS.find((entry) => entry.id === actionId);
    if (!action) return;

    setPlaygroundSelection(actionId);
    setPlaygroundReady(true);
    setPlaygroundLog((prev) => (prev[prev.length - 1] === actionId ? prev : [...prev, actionId]));
    setCoachLine(`Глюкоша: Выбрали «${action.label.toLowerCase()}». Теперь посмотрим, что будет с сахаром крови.`);
  };

  const dropPlaygroundAction = () => {
    if (dragPayload?.scene !== 'playground') return stopDrag();
    selectPlaygroundAction(dragPayload.id);
    stopDrag();
  };

  const resetPlayground = () => {
    if (sceneDone.playground) return;
    setPlaygroundSelection(null);
    setPlaygroundReady(false);
    setPlaygroundLog([]);
    setGlucose(playgroundVariant.start);
    setCoachLine('Глюкоша: Давай выберем один вариант помощи.');
  };

  const recheckPlayground = () => {
    if (!playgroundSelection || !playgroundReady) return;

    if (playgroundSelection === 'juice') {
      finishScene('playground', {
        note: 'Если сахар крови низкий, быстрые углеводы вроде сока часто помогают быстрее.',
        body: 'Глюкоша улыбается: «Сахар крови поднялся. Теперь уже спокойнее».',
        addKnowledge: 2,
        addSticker: 1,
        nextGlucose: 5.1,
      });
      return;
    }

    if (playgroundSelection === 'cookie') {
      finishScene('playground', {
        note: 'Печенье тоже помогает, но сахар крови поднимается не так быстро, как от сока.',
        body: 'Глюкоша говорит: «Так тоже можно помочь. Просто сок часто работает быстрее».',
        addKnowledge: 1,
        addSticker: 0,
        nextGlucose: 4.4,
      });
      return;
    }

    setPlaygroundSelection(null);
    setPlaygroundReady(false);
    setCoachLine(
      playgroundSelection === 'water'
        ? 'Глюкоша: Вода не поднимет сахар крови. Давай выберем сок или что-то сладкое.'
        : 'Глюкоша: Если сахар низкий, сначала помогаем себе, а не бежим дальше.',
    );
  };

  const clearEveningFrom = (part) => {
    if (sceneDone.evening) return;

    if (part === 'measure') {
      setEveningBoard({ measure: false, state: null, action: null, recheck: false });
      setCoachLine('Ириска: Начнем заново. Сначала смотрим сахар крови.');
      return;
    }

    if (part === 'state') {
      setEveningBoard((prev) => ({ ...prev, state: null, action: null, recheck: false }));
      setCoachLine('Ириска: Хорошо, выберем состояние сахара еще раз.');
      return;
    }

    if (part === 'action') {
      setEveningBoard((prev) => ({ ...prev, action: null, recheck: false }));
      setCoachLine('Ириска: Теперь выберем, что делать дальше.');
      return;
    }

    setEveningBoard((prev) => ({ ...prev, recheck: false }));
  };

  const placeEveningToken = (token) => {
    if (sceneDone.evening) return;

    const actualState = glucoseState(glucose);

    if (token.type === 'measure') {
      setEveningBoard((prev) => ({ ...prev, measure: true }));
      setCoachLine(`Ириска: Смотрим сахар крови. Сейчас ${glucose.toFixed(1)} ммоль/л — это ${glucoseStateLabel(actualState)} сахар.`);
      return;
    }

    if (token.type === 'state') {
      if (!eveningBoard.measure) {
        setCoachLine('Ириска: Сначала посмотрим сахар крови.');
        return;
      }

      setEveningBoard((prev) => ({ ...prev, state: token.id, action: null, recheck: false }));

      if (token.id === actualState) {
        setCoachLine('Ириска: Да, именно так. Теперь решаем, что делать.');
      } else {
        setCoachLine(`Ириска: Посмотри на цифру ${glucose.toFixed(1)} ммоль/л. Сейчас это ${glucoseStateLabel(actualState)} сахар.`);
      }
      return;
    }

    if (token.type === 'action') {
      if (!eveningBoard.state) {
        setCoachLine('Ириска: Сначала выберем, какой сейчас сахар крови.');
        return;
      }

      setEveningBoard((prev) => ({ ...prev, action: token.id, recheck: false }));
      setCoachLine(`Ириска: ${token.helper}. Потом посмотрим сахар крови снова.`);
      return;
    }

    if (!eveningBoard.action) {
      setCoachLine('Ириска: Сначала выберем нужный шаг.');
      return;
    }

    const correctAction = EVENING_ACTION_OPTIONS.find((option) => option.forState === actualState)?.id;

    if (eveningBoard.state !== actualState) {
      setEveningBoard((prev) => ({ ...prev, recheck: false }));
      setCoachLine(`Ириска: Сейчас ${glucose.toFixed(1)} ммоль/л. Это ${glucoseStateLabel(actualState)} сахар. Попробуем выбрать состояние еще раз.`);
      return;
    }

    if (eveningBoard.action !== correctAction) {
      setEveningBoard((prev) => ({ ...prev, recheck: false }));
      setCoachLine(
        actualState === 'high'
          ? 'Ириска: Когда сахар высокий, часто нужен инсулин по плану.'
          : actualState === 'low'
            ? 'Ириска: Когда сахар низкий, чаще помогаем соком или едой.'
            : 'Ириска: Если сахар в норме, можно спокойно заниматься своими делами и потом посмотреть сахар крови снова.',
      );
      return;
    }

    setEveningBoard((prev) => ({ ...prev, recheck: true }));

    const nextGlucose = actualState === 'high' ? 6.7 : actualState === 'low' ? 5 : glucose;

    finishScene('evening', {
      note: 'Сначала смотрим сахар крови, потом решаем, что делать, делаем шаг и смотрим сахар снова.',
        body:
        actualState === 'high'
          ? 'Ириска говорит: «Если сахар высокий, может понадобиться инсулин. Потом мы спокойно смотрим сахар крови снова».'
          : actualState === 'low'
            ? 'Ириска говорит: «Если сахар низкий, сначала поднимаем его соком или едой, а потом смотрим сахар снова».'
            : 'Ириска говорит: «Если сахар в норме, можно спокойно заниматься своими делами. Потом мы снова смотрим сахар крови».',
        addKnowledge: 2,
        addSticker: 1,
        nextGlucose,
    });
  };

  const dropEveningToken = (target) => {
    if (dragPayload?.scene !== 'evening') return stopDrag();

    if (target === 'measure' && dragPayload.type === 'measure') placeEveningToken(dragPayload);
    if (target === 'state' && dragPayload.type === 'state') placeEveningToken(dragPayload);
    if (target === 'action' && dragPayload.type === 'action') placeEveningToken(dragPayload);
    if (target === 'recheck' && dragPayload.type === 'recheck') placeEveningToken(dragPayload);

    stopDrag();
  };

  const renderIntroScene = () => (
    <div className="scene-play intro-play">
      <div className="hero-row intro-hero">
        <MascotFigure id="meter" large />
        <div className="speech-cloud intro-cloud">
          <div className="bubble-label">Глюкоша говорит</div>
          <h2>Привет, я Глюкоша</h2>
          <p>Я показываю сахар крови и помогаю спокойно тренироваться. Хочешь пройти этот день вместе?</p>
        </div>
      </div>

      {!introAnswer ? (
        <div className="choice-row huge">
          {INTRO_CHOICES.map((choice) => (
            <button key={choice.id} type="button" className="ink-button intro-choice-button" onClick={() => answerIntro(choice.id)}>
              <ChoiceArt src={choice.icon} emoji={choice.emoji} label={choice.label} artKey={`intro.${choice.id}`} variant="hero" />
              <span>{choice.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="button-row">
          <div className="soft-note">{introAnswer === 'yes' ? 'Здорово. Тогда начнем.' : 'Все хорошо. Пойдем маленькими шагами.'}</div>
          <button type="button" className="accent-button" onClick={startStory}>Начнем</button>
        </div>
      )}
    </div>
  );

  const renderBreakfastScene = () => (
    <div className="scene-play">
      <div className="hero-row compact-row">
        <MascotFigure id="plate" />
        <div className="speech-cloud">
          <div className="bubble-label">Лада говорит</div>
          <p>Давай соберем завтрак. Перетащи еду на стол или просто нажимай на карточки.</p>
        </div>
      </div>

      <div className="coach-strip">{coachLine}</div>

      <div className="play-grid">
        <div className="panel">
          <h3>Полка с едой</h3>
          <div className="bank-grid">
            {BREAKFAST_ITEMS.map((item) => {
              const active = breakfastItemsOnTable.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`card-choice ${active ? 'active' : ''}`}
                  draggable={!sceneDone.breakfast}
                  onDragStart={() => startDrag({ scene: 'breakfast', id: item.id })}
                  onDragEnd={stopDrag}
                  onClick={() => placeBreakfastItem(item.id)}
                >
                  <ChoiceArt src={item.icon} emoji={item.emoji} label={item.label} artKey={item.artKey} variant="card" />
                  <strong>{item.label}</strong>
                  <small>{formatBreadUnits(item.units)}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel table-panel">
          <h3>Наш стол</h3>
          <div className="drop-grid breakfast-grid">
            {BREAKFAST_SLOTS.map((slot) => {
              const item = BREAKFAST_ITEMS.find((entry) => entry.id === breakfastSlots[slot.id]);
              const targetId = `breakfast-${slot.id}`;

              return (
                <div
                  key={slot.id}
                  className={`drop-slot ${item ? 'filled' : ''} ${dragTarget === targetId ? 'drag-over' : ''}`}
                  onDragOver={(event) => allowDrop(event, targetId)}
                  onDragLeave={() => setDragTarget('')}
                  onDrop={(event) => {
                    event.preventDefault();
                    dropBreakfastItem(slot.id);
                  }}
                >
                  <div>
                    <div className="slot-label">{slot.label}</div>
                    <div className="slot-helper">{slot.helper}</div>
                  </div>

                  {item ? (
                    <>
                      <button type="button" className="slot-remove" onClick={() => removeBreakfastItem(slot.id)}>убрать</button>
                      <div className="slot-content">
                        <ChoiceArt src={item.icon} emoji={item.emoji} label={item.label} artKey={item.artKey} variant="compact" />
                        <div>
                          <strong>{item.label}</strong>
                          <small>{formatBreadUnits(item.units)}</small>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="slot-empty">Перетащи сюда или нажми на карточку слева</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="total-box">Всего: {formatBreadUnits(breakfastUnits)}</div>

          <div className="button-row">
            <button type="button" className="ink-button soft" onClick={resetBreakfast}>Собрать заново</button>
            <button type="button" className="accent-button" onClick={submitBreakfast} disabled={!breakfastItemsOnTable.length}>Показать Ладе</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchoolScene = () => (
    <div className="scene-play">
      <div className="hero-row compact-row">
        <MascotFigure id="bag" />
        <div className="speech-cloud">
          <div className="bubble-label">Тима говорит</div>
          <p>Сложи в рюкзачок вещи, которые помогают в школе, если сахар крови изменится.</p>
        </div>
      </div>

      <div className="coach-strip">{coachLine}</div>

      <div className="play-grid">
        <div className="panel">
          <h3>Что лежит рядом</h3>
          <div className="bank-grid">
            {BACKPACK_ITEMS.map((item) => {
              const active = backpack.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`card-choice ${active ? 'active' : ''}`}
                  draggable={!sceneDone.school}
                  onDragStart={() => startDrag({ scene: 'school', id: item.id })}
                  onDragEnd={stopDrag}
                  onClick={() => toggleBackpackItem(item.id)}
                >
                  <ChoiceArt src={item.icon} emoji={item.emoji} label={item.label} artKey={item.artKey} variant="card" />
                  <strong>{item.label}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel backpack-panel">
          <h3>Мой рюкзачок</h3>
          <div
            className={`backpack-dropzone ${dragTarget === 'school-bag' ? 'drag-over' : ''}`}
            onDragOver={(event) => allowDrop(event, 'school-bag')}
            onDragLeave={() => setDragTarget('')}
            onDrop={(event) => {
              event.preventDefault();
              dropBackpackItem();
            }}
          >
            <div className="bag-title">Сюда кладем нужные вещи</div>
            <div className="item-list">
              {backpack.length ? backpack.map((id) => {
                const item = BACKPACK_ITEMS.find((entry) => entry.id === id);
                return (
                  <button key={id} type="button" className="mini-item" onClick={() => toggleBackpackItem(id)}>
                    <ChoiceArt src={item.icon} emoji={item.emoji} label={item.label} artKey={item.artKey} variant="inline" />
                    <span>{item.label}</span>
                  </button>
                );
              }) : <div className="slot-empty">Перетащи вещи внутрь или нажми на карточку слева</div>}
            </div>
          </div>

          <div className="button-row">
            <button type="button" className="ink-button soft" onClick={resetBackpack}>Собрать заново</button>
            <button type="button" className="accent-button" onClick={submitBackpack} disabled={!backpack.length}>Проверить рюкзачок</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaygroundScene = () => {
    const selectedAction = PLAYGROUND_ACTIONS.find((entry) => entry.id === playgroundSelection);
    const actionLocked = Boolean(selectedAction) && !sceneDone.playground;

    return (
      <div className="scene-play">
        <div className="hero-row compact-row">
          <MascotFigure id="meter" />
        <div className="speech-cloud">
          <div className="bubble-label">Глюкоша говорит</div>
          <p>{playgroundVariant.title} Сейчас {glucose.toFixed(1)} ммоль/л. Сначала поможем, а потом посмотрим сахар снова.</p>
        </div>
        </div>

        <div className="coach-strip">{coachLine}</div>

        <div className="play-grid">
          <div className="panel">
            <h3>Что можно сделать</h3>
            <div className="bank-grid action-bank">
              {PLAYGROUND_ACTIONS.map((action) => {
                const disabled = actionLocked && playgroundSelection !== action.id;

                return (
                  <button
                    key={action.id}
                    type="button"
                    className={`card-choice ${playgroundSelection === action.id ? 'active' : ''}`}
                    draggable={!sceneDone.playground && !disabled}
                    disabled={disabled}
                    onDragStart={() => startDrag({ scene: 'playground', id: action.id })}
                    onDragEnd={stopDrag}
                    onClick={() => selectPlaygroundAction(action.id)}
                  >
                    <ChoiceArt src={action.icon} emoji={action.emoji} label={action.label} artKey={action.artKey} variant="card" />
                    <strong>{action.label}</strong>
                    <small>{action.note}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <h3>Что делаем сейчас</h3>
            <div className={`status-card ${sugarState}`}>
              <div className={`status-badge ${sugarState}`}>{sugarState === 'low' ? 'Низкий сахар' : sugarState === 'high' ? 'Высокий сахар' : 'Сахар в норме'}</div>
              <strong>{glucose.toFixed(1)} ммоль/л</strong>
              <span>
                {selectedAction
                  ? 'Один вариант уже выбран. Теперь смотрим сахар снова или выбираем другой вариант.'
                  : sugarState === 'low'
                    ? 'Сначала выбираем один способ помочь себе.'
                    : 'Уже лучше. Можно посмотреть сахар снова.'}
              </span>
            </div>

            <div
              className={`action-zone ${dragTarget === 'playground-zone' ? 'drag-over' : ''}`}
              onDragOver={(event) => allowDrop(event, 'playground-zone')}
              onDragLeave={() => setDragTarget('')}
              onDrop={(event) => {
                event.preventDefault();
                dropPlaygroundAction();
              }}
            >
              {selectedAction ? (
                <div className="slot-content big">
                  <ChoiceArt src={selectedAction.icon} emoji={selectedAction.emoji} label={selectedAction.label} artKey={selectedAction.artKey} variant="compact" />
                  <div>
                    <strong>{selectedAction.label}</strong>
                    <small>{selectedAction.note}</small>
                  </div>
                </div>
              ) : (
                <div className="slot-empty">Перетащи сюда карточку или нажми на нее</div>
              )}
            </div>

            <div className="soft-note">
              {selectedAction
                ? 'Сейчас выбран один вариант помощи. Чтобы попробовать другой, нажми кнопку ниже.'
                : 'Выбери один вариант помощи, а потом нажми «Смотрим сахар снова».'}
            </div>

            <div className="button-row">
              <button type="button" className="ink-button soft" onClick={resetPlayground}>{selectedAction ? 'Выбрать другой вариант' : 'Собрать заново'}</button>
              <button type="button" className="accent-button" onClick={recheckPlayground} disabled={!playgroundReady}>Смотрим сахар снова</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEveningScene = () => {
    const actualState = glucoseState(glucose);
    const actionMatch = EVENING_ACTION_OPTIONS.find((option) => option.id === eveningBoard.action);
    const canFinishEvening = eveningBoard.measure && eveningBoard.state && eveningBoard.action && !sceneDone.evening;

    return (
      <div className="scene-play">
      <div className="hero-row compact-row">
        <MascotFigure id="pen" />
        <div className="speech-cloud">
          <div className="bubble-label">Ириска говорит</div>
          <p>Сейчас {glucose.toFixed(1)} ммоль/л. Сначала смотрим сахар крови, потом решаем, что делать дальше.</p>
        </div>
      </div>

      <div className={`scenario-banner ${actualState}`}>
        <strong>{eveningVariant.title}</strong>
        <span>{eveningVariant.helper}</span>
        </div>

        <div className="panel branch-panel">
          <h3>Что значит цифра</h3>
          <div className="branch-grid">
            {EVENING_STATE_OPTIONS.map((option) => (
              <div key={option.id} className={`branch-card ${option.id} ${actualState === option.id ? 'active' : ''}`}>
                <strong>{option.label}</strong>
                <span>{option.id === 'low' ? 'часто нужен сок или еда' : option.id === 'high' ? 'часто нужен инсулин' : 'часто можно играть, читать или отдыхать'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="play-grid">
          <div className="panel">
            <h3>Карточки шагов</h3>
            <div className="bank-grid evening-bank">
              <button
                type="button"
                className={`card-choice ${eveningBoard.measure ? 'active' : ''}`}
                draggable={!sceneDone.evening}
                onDragStart={() => startDrag({ scene: 'evening', type: 'measure', id: 'measure' })}
                onDragEnd={stopDrag}
                onClick={() => placeEveningToken({ type: 'measure', id: 'measure' })}
              >
                <ChoiceArt src={EVENING_STEPS[0].icon} emoji={EVENING_STEPS[0].emoji} label={EVENING_STEPS[0].label} artKey={EVENING_STEPS[0].artKey} variant="card" />
                <strong>{EVENING_STEPS[0].label}</strong>
                <small>{EVENING_STEPS[0].helper}</small>
              </button>

              {EVENING_STATE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`card-choice state-card ${option.id} ${eveningBoard.state === option.id ? 'active' : ''}`}
                  draggable={!sceneDone.evening}
                  onDragStart={() => startDrag({ scene: 'evening', type: 'state', id: option.id })}
                  onDragEnd={stopDrag}
                  onClick={() => placeEveningToken({ type: 'state', id: option.id })}
                >
                  <ChoiceArt src="" emoji={option.emoji} label={option.label} artKey={`evening.state.${option.id}`} variant="card" />
                  <strong>{option.label}</strong>
                  <small>{option.helper}</small>
                </button>
              ))}

              {EVENING_ACTION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`card-choice ${eveningBoard.action === option.id ? 'active' : ''}`}
                  draggable={!sceneDone.evening}
                  onDragStart={() => startDrag({ scene: 'evening', type: 'action', id: option.id })}
                  onDragEnd={stopDrag}
                  onClick={() => placeEveningToken({ type: 'action', id: option.id })}
                >
                  <ChoiceArt src={option.icon} emoji={option.emoji} label={option.label} artKey={option.artKey} variant="card" />
                  <strong>{option.label}</strong>
                  <small>{option.helper}</small>
                </button>
              ))}

              <button
                type="button"
                className={`card-choice ${eveningBoard.recheck ? 'active' : ''}`}
                draggable={!sceneDone.evening}
                onDragStart={() => startDrag({ scene: 'evening', type: 'recheck', id: 'recheck' })}
                onDragEnd={stopDrag}
                onClick={() => placeEveningToken({ type: 'recheck', id: 'recheck' })}
              >
                <ChoiceArt src={EVENING_STEPS[3].icon} emoji={EVENING_STEPS[3].emoji} label={EVENING_STEPS[3].label} artKey={EVENING_STEPS[3].artKey} variant="card" />
                <strong>{EVENING_STEPS[3].label}</strong>
                <small>{EVENING_STEPS[3].helper}</small>
              </button>
            </div>
          </div>

          <div className="panel">
            <h3>Дорожка вечера</h3>
            <div className="step-board">
              <div
                className={`step-slot ${eveningBoard.measure ? 'filled' : ''} ${dragTarget === 'evening-measure' ? 'drag-over' : ''}`}
                onDragOver={(event) => allowDrop(event, 'evening-measure')}
                onDragLeave={() => setDragTarget('')}
                onDrop={(event) => {
                  event.preventDefault();
                  dropEveningToken('measure');
                }}
              >
                <div className="step-index">1</div>
                <div>
                  <div className="slot-label">Смотрим сахар крови</div>
                  <div className="slot-helper">Сначала узнаем цифру</div>
                </div>
                {eveningBoard.measure ? (
                  <button type="button" className="slot-remove" onClick={() => clearEveningFrom('measure')}>убрать</button>
                ) : null}
              </div>

              <div
                className={`step-slot ${eveningBoard.state ? 'filled' : ''} ${dragTarget === 'evening-state' ? 'drag-over' : ''}`}
                onDragOver={(event) => allowDrop(event, 'evening-state')}
                onDragLeave={() => setDragTarget('')}
                onDrop={(event) => {
                  event.preventDefault();
                  dropEveningToken('state');
                }}
              >
                <div className="step-index">2</div>
                <div>
                  <div className="slot-label">Что делать?</div>
                  <div className="slot-helper">Решаем, сахар низкий, нормальный или высокий</div>
                </div>
                {eveningBoard.state ? (
                  <>
                    <button type="button" className="slot-remove" onClick={() => clearEveningFrom('state')}>убрать</button>
                    <div className="slot-content">
                      <ChoiceArt src="" emoji={EVENING_STATE_OPTIONS.find((option) => option.id === eveningBoard.state)?.emoji} label={EVENING_STATE_OPTIONS.find((option) => option.id === eveningBoard.state)?.label} artKey={`evening.state.${eveningBoard.state}`} variant="compact" />
                      <div>
                        <strong>{EVENING_STATE_OPTIONS.find((option) => option.id === eveningBoard.state)?.label}</strong>
                        <small>Сейчас {glucose.toFixed(1)} ммоль/л</small>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="slot-empty">Перетащи сюда карточку состояния</div>
                )}
              </div>

              <div
                className={`step-slot ${eveningBoard.action ? 'filled' : ''} ${dragTarget === 'evening-action' ? 'drag-over' : ''}`}
                onDragOver={(event) => allowDrop(event, 'evening-action')}
                onDragLeave={() => setDragTarget('')}
                onDrop={(event) => {
                  event.preventDefault();
                  dropEveningToken('action');
                }}
              >
                <div className="step-index">3</div>
                <div>
                  <div className="slot-label">Действуем</div>
                  <div className="slot-helper">Делаем нужный шаг</div>
                </div>
                {eveningBoard.action ? (
                  <>
                    <button type="button" className="slot-remove" onClick={() => clearEveningFrom('action')}>убрать</button>
                    <div className="slot-content">
                      <ChoiceArt src={actionMatch?.icon} emoji={actionMatch?.emoji} label={actionMatch?.label} artKey={actionMatch?.artKey} variant="compact" />
                      <div>
                        <strong>{actionMatch?.label}</strong>
                        <small>{actionMatch?.helper}</small>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="slot-empty">Перетащи сюда карточку действия</div>
                )}
              </div>

              <div
                className={`step-slot ${eveningBoard.recheck ? 'filled' : ''} ${dragTarget === 'evening-recheck' ? 'drag-over' : ''}`}
                onDragOver={(event) => allowDrop(event, 'evening-recheck')}
                onDragLeave={() => setDragTarget('')}
                onDrop={(event) => {
                  event.preventDefault();
                  dropEveningToken('recheck');
                }}
              >
                <div className="step-index">4</div>
                <div>
                  <div className="slot-label">Смотрим снова</div>
                  <div className="slot-helper">Смотрим, как изменился сахар крови</div>
                </div>
                <div className="slot-empty">Нажми на кнопку ниже или перетащи карточку, когда шаг 3 готов</div>
              </div>
            </div>

            <div className="button-row">
              <button type="button" className="ink-button soft" onClick={() => clearEveningFrom('measure')}>Собрать заново</button>
              <button type="button" className="accent-button" onClick={() => placeEveningToken({ type: 'recheck', id: 'recheck' })} disabled={!canFinishEvening}>Смотрим сахар снова</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinaleScene = () => (
    <div className="scene-play finale-play">
      <div className="hero-row compact-row">
        <MascotFigure id="meter" />
        <div className="speech-cloud">
          <div className="bubble-label">Глюкоша говорит</div>
          <p>Ты здорово потренировался. Теперь посмотри, сколько нового ты уже узнал.</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="panel summary-panel">
          <h3>Мои звездочки</h3>
          <div className="stat-row"><span>⭐ Я узнал</span><strong>{knowledge}</strong></div>
          <div className="stat-row"><span>🎁 Наклейки</span><strong>{stickers}</strong></div>
          <div className="stat-row"><span>🩸 Сахар крови</span><strong>{glucose.toFixed(1)} ммоль/л</strong></div>
        </div>
        <div className="panel summary-panel">
          <h3>Что я запомнил</h3>
          <div className="lesson-list">
            {Object.values(sceneNotes).map((note) => (
              <div key={note} className="lesson-pill">{note}</div>
            ))}
          </div>
        </div>
      </div>

      <button type="button" className="accent-button" onClick={resetStory}>Пройти еще раз</button>
    </div>
  );

  const renderScenePlay = () => {
    if (currentScene.id === 'intro') return renderIntroScene();
    if (currentScene.id === 'breakfast') return renderBreakfastScene();
    if (currentScene.id === 'school') return renderSchoolScene();
    if (currentScene.id === 'playground') return renderPlaygroundScene();
    if (currentScene.id === 'evening') return renderEveningScene();
    return renderFinaleScene();
  };

  const showContinue = currentScene.id !== 'intro' && currentScene.id !== 'finale' && sceneDone[currentScene.id];

  return (
    <div className="storybook-app">
      <div className="paper-shell">
        <header className="storybook-header">
          <div>
            <div className="brand">ДиаДрузья</div>
            <div className="brand-sub">Интерактивные сценки про сахар крови, еду, школу и вечерний уход.</div>
          </div>

          <div className="progress-strip">
            {progressScenes.map((scene, index) => {
              const done = sceneDone[scene.id];
              const active = scene.id === currentScene.id;
              return (
                <div key={scene.id} className={`progress-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                  <span>{index + 1}</span>
                  <small>{scene.title}</small>
                </div>
              );
            })}
          </div>

          <button type="button" className="ink-button soft" onClick={resetStory}>Сначала</button>
        </header>

        <main className="storybook-layout">
          <section className={`scene-card scene-${currentScene.id}`}>
            <div className="scene-topline">
              <span className="scene-chip">{currentScene.chapter}</span>
              <span className={`scene-chip ${sugarState}`}>Сахар крови: {glucose.toFixed(1)} ммоль/л</span>
            </div>
            <h1>{currentScene.title}</h1>
            <p className="scene-sub">{currentMascot.name} рядом. Здесь можно спокойно пробовать, менять решение и учиться шаг за шагом.</p>
            {renderScenePlay()}
            {showContinue ? (
              <button type="button" className="accent-button next-button" onClick={goNextScene}>Дальше</button>
            ) : null}
          </section>

          <aside className="friend-panel">
            <div className="meter-card">
              <MascotFigure id="meter" />
              <div>
                <div className="panel-title">Глюкоша здесь</div>
                <div className="panel-value">{glucose.toFixed(1)} ммоль/л</div>
                <div className={`meter-ribbon ${sugarState}`}>
                  <div className="meter-fill" style={{ width: `${clamp(((glucose - 2) / 8) * 100, 0, 100)}%` }} />
                </div>
                <p className="panel-note">{meterMood}</p>
              </div>
            </div>

            <div className="side-card">
              <div className="panel-title">Мои звездочки</div>
              <div className="stat-row"><span>⭐ Я узнал</span><strong>{knowledge}</strong></div>
              <div className="stat-row"><span>🎁 Наклейки</span><strong>{stickers}</strong></div>
              <div className="stat-row"><span>💬 Сейчас</span><strong>{currentScene.chapter}</strong></div>
            </div>

            <div className="side-card">
              <div className="panel-title">Полезные подсказки</div>
              <div className="lesson-list">
                {sceneTips.map((tip) => (
                  <div key={tip} className="lesson-pill">{tip}</div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>

      {modalData ? (
        <div className="mascot-modal-backdrop" onClick={closeModal}>
          <div className="mascot-modal" onClick={(event) => event.stopPropagation()}>
            <div className="mascot-modal-art">
              <MascotFigure id={modalData.mascotId} />
            </div>
            <div className="mascot-modal-copy">
              <div className="bubble-label">{modalData.title}</div>
              <h3>{modalData.body}</h3>
              <button type="button" className="accent-button" onClick={closeModal}>Понятно</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
