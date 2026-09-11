(() => {
  'use strict';

  const $ = (q, c = document) => c.querySelector(q);
  const $$ = (q, c = document) => [...c.querySelectorAll(q)];
  const { lessons, makeQuestion, makeQuiz, searchItems } = window.ZouzData;
  const STORAGE_KEY = 'zouz-study-v1';
  const THEME_KEY = 'zouz-theme-choice';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const defaultState = () => ({
    version: 1,
    completedLessons: [],
    bookmarks: [],
    reviewLater: [],
    mastery: 0,
    xp: 0,
    quizResults: [],
    mistakes: [],
    activity: [],
    practice: { correct: 0, attempts: 0, streak: 0 }
  });

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        practice: { ...defaultState().practice, ...(parsed.practice || {}) },
        completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
        reviewLater: Array.isArray(parsed.reviewLater) ? parsed.reviewLater : [],
        quizResults: Array.isArray(parsed.quizResults) ? parsed.quizResults : [],
        mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
        activity: Array.isArray(parsed.activity) ? parsed.activity : []
      };
    } catch {
      return defaultState();
    }
  }

  let state = loadState();
  let currentLessonId = lessons[0].id;
  let practiceLessonId = lessons[0].id;
  let practiceQuestion = null;
  let practiceAnswered = false;
  let practiceDifficulty = 'auto';
  let quizConfig = { tier: 'foundation', difficulty: 'mixed', count: 20, mode: 'normal' };
  let quizQuestions = [];
  let quizIndex = 0;
  let quizCorrect = 0;
  let quizAnswered = false;
  let quizSelectedChoice = null;
  let perfectResetPending = false;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function addUnique(list, value) {
    if (!list.includes(value)) list.push(value);
  }

  function removeValue(list, value) {
    const index = list.indexOf(value);
    if (index >= 0) list.splice(index, 1);
  }

  function lessonById(id) {
    return lessons.find(l => l.id === id) || lessons[0];
  }

  function prettyTag(tag) {
    return ({
      'two-step': 'Two-step equations',
      'brackets': 'Equations with brackets',
      'both-sides': 'Unknowns on both sides'
    })[tag] || tag;
  }

  function logActivity(type, title, detail = '') {
    state.activity.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      detail,
      at: new Date().toISOString()
    });
    state.activity = state.activity.slice(0, 80);
  }

  function addMistake(question, source) {
    state.mistakes.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source,
      question: question.question,
      answer: question.answer,
      explanation: question.explanation,
      commonMistake: question.commonMistake || '',
      tag: question.subtopic || 'two-step',
      difficulty: question.difficulty || 'easy',
      resolved: false,
      createdAt: new Date().toISOString()
    });
    state.mistakes = state.mistakes.slice(0, 60);
  }

  function computeStreak() {
    if (!state.activity.length) return 0;
    const days = [...new Set(state.activity.map(item => item.at.slice(0, 10)))].sort().reverse();
    if (!days.length) return 0;
    let streak = 1;
    let cursor = new Date(`${days[0]}T12:00:00`);
    for (let i = 1; i < days.length; i++) {
      const expected = new Date(cursor);
      expected.setDate(expected.getDate() - 1);
      const expectedKey = expected.toISOString().slice(0, 10);
      if (days[i] !== expectedKey) break;
      streak++;
      cursor = expected;
    }
    return streak;
  }

  function overallAccuracy() {
    const attempts = state.quizResults.reduce((sum, r) => sum + (r.total || 0), 0);
    const correct = state.quizResults.reduce((sum, r) => sum + (r.correct || 0), 0);
    return attempts ? Math.round((correct / attempts) * 100) : null;
  }

  function nextLesson() {
    return lessons.find(l => !state.completedLessons.includes(l.id)) || lessons[lessons.length - 1];
  }

  function updateAllProgressUI() {
    const completed = state.completedLessons.filter(id => lessons.some(l => l.id === id)).length;
    const completion = Math.round((completed / lessons.length) * 100);
    const accuracy = overallAccuracy();
    const level = Math.floor(state.xp / 120) + 1;
    const recommended = nextLesson();

    $('#homeCompletion').textContent = `${completion}%`;
    $('#homeCompletionBar').style.width = `${completion}%`;
    $('#homeCompletionDetail').textContent = `${completed} of ${lessons.length} lessons complete`;
    $('#homeMastery').textContent = `${Math.round(state.mastery)}%`;
    $('#homeMasteryDetail').textContent = state.mastery < 25 ? 'Answer practice questions to build mastery' : state.mastery < 70 ? 'Keep training the weaker question types' : 'Strong — keep checking it with harder questions';
    $('#homeLevel').textContent = level;
    $('#homeXP').textContent = state.xp;
    $('#nextLessonTitle').textContent = recommended.title;
    $('#nextLessonMeta').textContent = `Maths · Algebra · ${recommended.duration}`;

    $('#trackProgressText').textContent = `${completed} / ${lessons.length} complete`;
    $('#trackProgressBar').style.width = `${completion}%`;

    $('#practiceMastery').textContent = `${Math.round(state.mastery)}%`;
    $('#masteryRing').style.setProperty('--mastery', String(Math.round(state.mastery)));
    $('#practiceCorrect').textContent = state.practice.correct;
    $('#practiceStreak').textContent = state.practice.streak;

    $('#progressCompletion').textContent = `${completion}%`;
    $('#progressCompletionSub').textContent = `${completed} / ${lessons.length} lessons`;
    $('#progressAccuracy').textContent = accuracy === null ? '—' : `${accuracy}%`;
    $('#progressAccuracySub').textContent = accuracy === null ? 'No quiz attempts yet' : `${state.quizResults.length} completed quiz${state.quizResults.length === 1 ? '' : 'zes'}`;
    $('#progressMastery').textContent = `${Math.round(state.mastery)}%`;
    $('#progressStreak').textContent = computeStreak();
    $('#roadmapPercent').textContent = `${completion}%`;

    renderLessonList();
    renderRoadmap();
    renderScoreChart();
    renderWeakAreas();
    renderActivity();
    renderMistakes();
  }

  function renderLessonList() {
    const list = $('#lessonList');
    list.innerHTML = lessons.map(lesson => {
      const complete = state.completedLessons.includes(lesson.id);
      const active = lesson.id === currentLessonId;
      return `
        <button class="lesson-item ${complete ? 'complete' : ''} ${active ? 'active' : ''}" type="button" data-lesson-id="${lesson.id}">
          <span class="lesson-index">${complete ? '✓' : lesson.number}</span>
          <span><strong>${lesson.title}</strong><small>${lesson.tier} · ${lesson.duration}</small></span>
        </button>`;
    }).join('');
  }

  function renderLesson(id, focus = false) {
    const lesson = lessonById(id);
    currentLessonId = lesson.id;
    $('#lessonTitle').textContent = lesson.title;
    $('#lessonIntro').textContent = lesson.intro;
    $('#lessonMeaning').textContent = lesson.meaning;
    $('#lessonWhy').textContent = lesson.why;
    $('#lessonSteps').innerHTML = lesson.steps.map(step => `<li>${step}</li>`).join('');
    $('#workedExample').innerHTML =
      `<div class="example-title">${lesson.example.title}</div>` +
      lesson.example.steps.map(step => `
        <section class="example-step">
          <h5>${step.title}</h5>
          <p class="example-why">${step.why}</p>
          <div class="example-working">
            ${step.working.map(line => `<div class="equation-line">${line}</div>`).join('')}
          </div>
        </section>
      `).join('');
    $('#lessonMistake').textContent = lesson.mistake;
    $('#miniQuestion').textContent = lesson.mini.question;
    $('#miniAnswer').value = '';
    $('#miniFeedback').textContent = '';
    $('#miniFeedback').className = 'feedback';
    $('#bookmarkLesson').classList.toggle('saved', state.bookmarks.includes(lesson.id));
    $('#bookmarkLesson').setAttribute('aria-pressed', String(state.bookmarks.includes(lesson.id)));
    $('#bookmarkLesson').textContent = state.bookmarks.includes(lesson.id) ? 'Saved ✓' : 'Save';
    $('#reviewLater').textContent = state.reviewLater.includes(lesson.id) ? 'Review saved ✓' : 'Review later';
    $('#completeLesson').textContent = state.completedLessons.includes(lesson.id) ? 'Completed ✓' : 'Mark complete';
    renderLessonList();
    if (focus) $('#lessonView').focus({ preventScroll: true });
  }

  $('#lessonList').addEventListener('click', event => {
    const button = event.target.closest('[data-lesson-id]');
    if (!button) return;
    renderLesson(button.dataset.lessonId, true);
  });

  $('#miniSubmit').addEventListener('click', () => {
    const lesson = lessonById(currentLessonId);
    const value = Number($('#miniAnswer').value.trim());
    const feedback = $('#miniFeedback');
    if (!Number.isFinite(value)) {
      feedback.className = 'feedback incorrect';
      feedback.textContent = 'Enter a number first.';
      return;
    }
    if (Math.abs(value - lesson.mini.answer) < 1e-9) {
      feedback.className = 'feedback correct';
      feedback.textContent = `Correct. ${lesson.mini.explanation}`;
      state.xp += 4;
    } else {
      feedback.className = 'feedback incorrect';
      feedback.textContent = `Not quite. ${lesson.mini.explanation}`;
      addMistake({
        question: lesson.mini.question,
        answer: lesson.mini.answer,
        explanation: lesson.mini.explanation,
        commonMistake: lesson.mistake,
        subtopic: lesson.practiceTag,
        difficulty: lesson.number === 1 ? 'easy' : lesson.number === 2 ? 'medium' : 'hard'
      }, 'lesson check');
    }
    logActivity('check', `Quick check · ${lesson.title}`, value === lesson.mini.answer ? 'Correct' : 'Needs review');
    saveState();
    updateAllProgressUI();
  });

  $('#bookmarkLesson').addEventListener('click', () => {
    if (state.bookmarks.includes(currentLessonId)) removeValue(state.bookmarks, currentLessonId);
    else addUnique(state.bookmarks, currentLessonId);
    saveState();
    renderLesson(currentLessonId);
  });

  $('#reviewLater').addEventListener('click', () => {
    if (state.reviewLater.includes(currentLessonId)) removeValue(state.reviewLater, currentLessonId);
    else addUnique(state.reviewLater, currentLessonId);
    saveState();
    renderLesson(currentLessonId);
  });

  $('#completeLesson').addEventListener('click', () => {
    const lesson = lessonById(currentLessonId);
    if (!state.completedLessons.includes(currentLessonId)) {
      addUnique(state.completedLessons, currentLessonId);
      state.xp += 40;
      state.mastery = clamp(state.mastery + 5, 0, 100);
      logActivity('lesson', `Completed · ${lesson.title}`, '+40 XP');
    }
    saveState();
    renderLesson(currentLessonId);
    updateAllProgressUI();
  });

  $('#practiceLesson').addEventListener('click', () => {
    practiceLessonId = currentLessonId;
    $('#practiceTopicLabel').textContent = lessonById(practiceLessonId).title;
    goTo('#practice');
  });

  $('#nextLessonButton').addEventListener('click', () => {
    const lesson = nextLesson();
    renderLesson(lesson.id);
    goTo('#learn');
  });

  function selectedValue(container) {
    return container.querySelector('button.active')?.dataset.value;
  }

  function practiceActualDifficulty() {
    if (practiceDifficulty !== 'auto') return practiceDifficulty;
    if (state.practice.streak >= 5) return 'hard';
    if (state.practice.streak >= 2) return 'medium';
    return 'easy';
  }

  function newPracticeQuestion() {
    const lesson = lessonById(practiceLessonId);
    const difficulty = practiceActualDifficulty();
    practiceQuestion = makeQuestion(difficulty, lesson.practiceTag, 'typed');
    practiceAnswered = false;
    $('#practiceQuestion').textContent = practiceQuestion.question;
    $('#practiceLevelChip').textContent = `${practiceDifficulty === 'auto' ? 'Adaptive' : 'Fixed'} · ${difficulty[0].toUpperCase() + difficulty.slice(1)}`;
    $('#practiceAnswer').value = '';
    $('#practiceAnswer').disabled = false;
    $('#practiceSubmit').disabled = false;
    $('#practiceSubmit').textContent = 'Check';
    $('#practiceFeedback').textContent = '';
    $('#practiceFeedback').className = 'feedback roomy';
    $('#practiceAnswer').focus({ preventScroll: true });
  }

  $('#practiceDifficulty').addEventListener('click', event => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    setTab($('#practiceDifficulty'), button, true);
    practiceDifficulty = button.dataset.value;
    if (practiceQuestion) newPracticeQuestion();
  });

  $('#practiceStart').addEventListener('click', () => {
    $('#practiceStart').hidden = true;
    newPracticeQuestion();
  });

  $('#practiceSubmit').addEventListener('click', () => {
    if (!practiceQuestion) return;
    if (practiceAnswered) {
      newPracticeQuestion();
      return;
    }
    const value = Number($('#practiceAnswer').value.trim());
    if (!Number.isFinite(value)) {
      $('#practiceFeedback').className = 'feedback roomy incorrect';
      $('#practiceFeedback').textContent = 'Enter a number first.';
      return;
    }
    practiceAnswered = true;
    state.practice.attempts += 1;
    const correct = Math.abs(value - practiceQuestion.answer) < 1e-9;
    if (correct) {
      state.practice.correct += 1;
      state.practice.streak += 1;
      state.mastery = clamp(state.mastery + (practiceActualDifficulty() === 'hard' ? 5 : 4), 0, 100);
      state.xp += 5;
      $('#practiceFeedback').className = 'feedback roomy correct';
      $('#practiceFeedback').textContent = `Correct. ${practiceQuestion.explanation}`;
    } else {
      state.practice.streak = 0;
      state.mastery = clamp(state.mastery - 2, 0, 100);
      addMistake(practiceQuestion, 'practice');
      $('#practiceFeedback').className = 'feedback roomy incorrect';
      $('#practiceFeedback').textContent = `Not yet. ${practiceQuestion.explanation} ${practiceQuestion.commonMistake}`;
    }
    logActivity('practice', `${correct ? 'Correct' : 'Reviewed'} · ${prettyTag(practiceQuestion.subtopic)}`, practiceQuestion.question.replace('Solve: ', ''));
    $('#practiceAnswer').disabled = true;
    $('#practiceSubmit').textContent = 'Next question';
    saveState();
    updateAllProgressUI();
  });

  $('#practiceAnswer').addEventListener('keydown', event => {
    if (event.key === 'Enter' && !$('#practiceSubmit').disabled) $('#practiceSubmit').click();
  });

  function bindConfigTabs(id, key, parser = value => value) {
    $(id).addEventListener('click', event => {
      const button = event.target.closest('button[data-value]');
      if (!button) return;
      setTab($(id), button, true);
      quizConfig[key] = parser(button.dataset.value);
    });
  }

  bindConfigTabs('#tierTabs', 'tier');
  bindConfigTabs('#quizDifficulty', 'difficulty');
  bindConfigTabs('#countTabs', 'count', Number);
  bindConfigTabs('#modeTabs', 'mode');

  function renderQuizQuestion() {
    const question = quizQuestions[quizIndex];
    quizAnswered = false;
    quizSelectedChoice = null;
    perfectResetPending = false;
    $('#quizIndex').textContent = quizIndex + 1;
    $('#quizTotal').textContent = quizQuestions.length;
    $('#quizScore').textContent = quizCorrect;
    $('#quizProgressBar').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
    $('#quizDifficultyChip').textContent = question.difficulty[0].toUpperCase() + question.difficulty.slice(1);
    $('#quizTypeChip').textContent = question.type === 'choice' ? 'Multiple choice' : 'Typed answer';
    $('#quizQuestionText').textContent = question.question;
    $('#quizFeedback').textContent = '';
    $('#quizFeedback').className = 'feedback roomy';
    $('#quizNext').hidden = true;
    $('#quizSubmit').hidden = false;
    $('#quizSubmit').disabled = false;
    $('#quizSubmit').textContent = 'Check answer';

    if (question.type === 'choice') {
      $('#quizAnswerArea').innerHTML = `<div class="choice-grid">${question.choices.map(choice => `<button class="choice-btn" type="button" data-choice="${choice}">x = ${choice}</button>`).join('')}</div>`;
    } else {
      $('#quizAnswerArea').innerHTML = `<div class="answer-row"><label class="sr-only" for="quizTypedAnswer">Quiz answer</label><input id="quizTypedAnswer" type="text" inputmode="decimal" autocomplete="off" placeholder="x = ?"></div>`;
      $('#quizTypedAnswer').focus({ preventScroll: true });
    }
  }

  function startQuiz() {
    quizQuestions = makeQuiz(quizConfig.count, quizConfig.difficulty, quizConfig.tier);
    quizIndex = 0;
    quizCorrect = 0;
    quizAnswered = false;
    $('#quizBuilder').hidden = true;
    $('#quizResults').hidden = true;
    $('#quizSession').hidden = false;
    $('#quizModeLabel').textContent = quizConfig.mode === 'perfect' ? 'PERFECT RUN' : 'NORMAL RUN';
    renderQuizQuestion();
    $('#quizSession').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  }

  $('#startQuiz').addEventListener('click', startQuiz);
  $('#retryQuiz').addEventListener('click', startQuiz);

  $('#quizAnswerArea').addEventListener('click', event => {
    const button = event.target.closest('.choice-btn');
    if (!button || quizAnswered) return;
    $$('.choice-btn', $('#quizAnswerArea')).forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    quizSelectedChoice = Number(button.dataset.choice);
  });

  $('#quizAnswerArea').addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.id === 'quizTypedAnswer') $('#quizSubmit').click();
  });

  $('#quizSubmit').addEventListener('click', () => {
    if (quizAnswered) return;
    const question = quizQuestions[quizIndex];
    const value = question.type === 'choice' ? quizSelectedChoice : Number($('#quizTypedAnswer')?.value.trim());
    if (!Number.isFinite(value)) {
      $('#quizFeedback').className = 'feedback roomy incorrect';
      $('#quizFeedback').textContent = question.type === 'choice' ? 'Choose an answer first.' : 'Enter a number first.';
      return;
    }

    quizAnswered = true;
    const correct = Math.abs(value - question.answer) < 1e-9;
    if (correct) {
      quizCorrect++;
      $('#quizFeedback').className = 'feedback roomy correct';
      $('#quizFeedback').textContent = `Correct. ${question.explanation}`;
      state.xp += 2;
    } else {
      addMistake(question, 'quiz');
      $('#quizFeedback').className = 'feedback roomy incorrect';
      $('#quizFeedback').textContent = `Incorrect. ${question.explanation} ${question.commonMistake}`;
    }

    $('#quizScore').textContent = quizCorrect;
    $('#quizSubmit').hidden = true;
    $('#quizNext').hidden = false;

    if (!correct && quizConfig.mode === 'perfect') {
      perfectResetPending = true;
      $('#quizFeedback').textContent += ' Perfect Run resets here. The next run will use a fresh question set.';
      $('#quizNext').textContent = 'Restart run';
    } else {
      $('#quizNext').textContent = quizIndex === quizQuestions.length - 1 ? 'See result' : 'Next';
    }
    saveState();
  });

  $('#quizNext').addEventListener('click', () => {
    if (perfectResetPending) {
      quizQuestions = makeQuiz(quizConfig.count, quizConfig.difficulty, quizConfig.tier);
      quizIndex = 0;
      quizCorrect = 0;
      renderQuizQuestion();
      return;
    }
    if (quizIndex >= quizQuestions.length - 1) {
      finishQuiz();
      return;
    }
    quizIndex++;
    renderQuizQuestion();
  });

  $('#quitQuiz').addEventListener('click', () => {
    $('#quizSession').hidden = true;
    $('#quizBuilder').hidden = false;
    $('#quizResults').hidden = true;
  });

  function finishQuiz() {
    const total = quizQuestions.length;
    const accuracy = total ? Math.round((quizCorrect / total) * 100) : 0;
    state.quizResults.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      correct: quizCorrect,
      total,
      accuracy,
      mode: quizConfig.mode,
      tier: quizConfig.tier,
      difficulty: quizConfig.difficulty,
      at: new Date().toISOString()
    });
    state.quizResults = state.quizResults.slice(0, 30);
    state.mastery = clamp(Math.round(state.mastery * .72 + accuracy * .28), 0, 100);
    if (accuracy >= 80) state.xp += 20;
    logActivity('quiz', `Quiz · ${accuracy}%`, `${quizCorrect}/${total} correct · ${quizConfig.mode === 'perfect' ? 'Perfect Run' : 'Normal'}`);
    saveState();

    $('#quizSession').hidden = true;
    $('#quizBuilder').hidden = true;
    $('#quizResults').hidden = false;
    $('#resultHeadline').textContent = accuracy >= 90 ? 'That’s locked in.' : accuracy >= 70 ? 'Solid run.' : 'Useful result.';
    $('#resultSummary').textContent = accuracy >= 90 ? 'You handled this set cleanly. Harder practice is the next useful move.' : accuracy >= 70 ? 'Most of the method is there. Your mistake book shows exactly what to tighten up.' : 'This is what a quiz is for: it exposed the gaps. Review the saved mistakes, then run it again.';
    $('#resultScore').textContent = `${accuracy}%`;
    $('#resultCorrect').textContent = `${quizCorrect}/${total}`;
    $('#resultMastery').textContent = `${Math.round(state.mastery)}%`;
    updateAllProgressUI();
  }

  function renderRoadmap() {
    $('#roadmapList').innerHTML = lessons.map(lesson => {
      const complete = state.completedLessons.includes(lesson.id);
      return `<button class="roadmap-row ${complete ? 'complete' : ''}" type="button" data-roadmap-lesson="${lesson.id}" style="width:100%;border:0;background:transparent;text-align:left;cursor:pointer;color:inherit">
        <span class="roadmap-dot">${complete ? '✓' : lesson.number}</span>
        <div><strong>${lesson.title}</strong><small>${complete ? 'Completed' : `${lesson.tier} · ${lesson.duration}`}</small></div>
      </button>`;
    }).join('');
  }

  $('#roadmapList').addEventListener('click', event => {
    const button = event.target.closest('[data-roadmap-lesson]');
    if (!button) return;
    renderLesson(button.dataset.roadmapLesson);
    goTo('#learn');
  });

  function renderScoreChart() {
    const results = state.quizResults.slice(0, 7).reverse();
    const chart = $('#scoreChart');
    if (!results.length) {
      chart.innerHTML = '';
      $('#scoreEmpty').hidden = false;
      return;
    }
    $('#scoreEmpty').hidden = true;
    chart.innerHTML = results.map(result => `<div class="score-bar" style="height:${Math.max(8, result.accuracy)}%" title="${result.accuracy}%"><span>${result.accuracy}%</span></div>`).join('');
  }

  function renderWeakAreas() {
    const counts = {};
    state.mistakes.filter(m => !m.resolved).forEach(m => { counts[m.tag] = (counts[m.tag] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      $('#weakAreas').innerHTML = '<div class="empty-state">No unresolved weak areas yet. Practice or take a quiz and this will be based on your real mistakes.</div>';
      return;
    }
    $('#weakAreas').innerHTML = entries.map(([tag, count]) => `<div class="weak-row"><div><strong>${prettyTag(tag)}</strong><small>${count} unresolved mistake${count === 1 ? '' : 's'}</small></div><span class="weak-badge">Review</span></div>`).join('');
  }

  function renderActivity() {
    const items = state.activity.slice(0, 6);
    if (!items.length) {
      $('#activityList').innerHTML = '<div class="empty-state">Your activity log is empty. Complete a lesson, answer practice, or finish a quiz.</div>';
      return;
    }
    const icons = { lesson: '✓', practice: '↻', quiz: '◎', check: '?' };
    $('#activityList').innerHTML = items.map(item => {
      const date = new Date(item.at);
      return `<div class="activity-row"><span class="activity-icon">${icons[item.type] || '•'}</span><div><strong>${item.title}</strong><small>${item.detail ? `${item.detail} · ` : ''}${date.toLocaleDateString(undefined, { month:'short', day:'numeric' })}</small></div></div>`;
    }).join('');
  }

  function renderMistakes() {
    const list = $('#mistakeList');
    if (!state.mistakes.length) {
      list.innerHTML = '<div class="empty-state">No mistakes saved yet. That is either excellent or extremely suspicious — go answer something 😭</div>';
      return;
    }
    list.innerHTML = state.mistakes.slice(0, 16).map(m => `<article class="mistake-item ${m.resolved ? 'resolved' : ''}" data-mistake-id="${m.id}">
      <div><h4>${m.question}</h4><p>${m.resolved ? 'Resolved. ' : ''}${m.explanation}</p><div class="retry-inline" hidden><input type="text" inputmode="decimal" aria-label="Retry answer" placeholder="x = ?"><button class="retry-mistake" type="button" data-check-mistake>Check</button></div></div>
      <button class="retry-mistake" type="button" data-retry-mistake>${m.resolved ? 'Retry again' : 'Retry'}</button>
    </article>`).join('');
  }

  $('#mistakeList').addEventListener('click', event => {
    const item = event.target.closest('[data-mistake-id]');
    if (!item) return;
    const mistake = state.mistakes.find(m => m.id === item.dataset.mistakeId);
    if (!mistake) return;
    if (event.target.closest('[data-retry-mistake]')) {
      const row = $('.retry-inline', item);
      row.hidden = !row.hidden;
      if (!row.hidden) $('input', row).focus();
      return;
    }
    if (event.target.closest('[data-check-mistake]')) {
      const input = $('input', item);
      const value = Number(input.value.trim());
      if (!Number.isFinite(value)) return;
      if (Math.abs(value - Number(mistake.answer)) < 1e-9) {
        mistake.resolved = true;
        state.xp += 3;
        logActivity('practice', `Resolved mistake · ${prettyTag(mistake.tag)}`, mistake.question.replace('Solve: ', ''));
        saveState();
        updateAllProgressUI();
      } else {
        input.select();
        input.setCustomValidity('Try again');
        input.reportValidity();
        setTimeout(() => input.setCustomValidity(''), 100);
      }
    }
  });

  $('#clearMistakes').addEventListener('click', () => {
    state.mistakes = state.mistakes.filter(m => !m.resolved);
    saveState();
    updateAllProgressUI();
  });

  $('#resetProgress').addEventListener('click', () => {
    if (!confirm('Reset all locally saved Zouz study progress on this browser?')) return;
    state = defaultState();
    saveState();
    currentLessonId = lessons[0].id;
    practiceLessonId = lessons[0].id;
    practiceQuestion = null;
    $('#practiceStart').hidden = false;
    $('#practiceAnswer').disabled = true;
    $('#practiceSubmit').disabled = true;
    $('#practiceQuestion').textContent = 'Press Start practice to generate your first question.';
    renderLesson(currentLessonId);
    updateAllProgressUI();
  });

  function ensureLiquid(container) {
    if (!container || container.dataset.liquidReady) return;
    container.dataset.liquidReady = '1';
    const goo = document.createElement('span');
    goo.className = 'liquid-goo';
    goo.innerHTML = '<span class="liquid-bridge"></span><span class="liquid-blob"></span>';
    const indicator = document.createElement('span');
    indicator.className = 'liquid-indicator';
    container.prepend(indicator);
    container.prepend(goo);
  }

  function positionLiquid(container, active, animate = true) {
    if (!container || !active) return;
    ensureLiquid(container);
    const ind = container.querySelector('.liquid-indicator');
    const blob = container.querySelector('.liquid-blob');
    const bridge = container.querySelector('.liquid-bridge');
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const x = activeRect.left - containerRect.left;
    const width = activeRect.width;
    const oldX = Number(ind.dataset.x || x);
    const oldWidth = Number(ind.dataset.w || width);
    const oldCenter = oldX + oldWidth / 2;
    const newCenter = x + width / 2;
    const bridgeLeft = Math.min(oldCenter, newCenter);
    const bridgeRight = Math.max(oldCenter, newCenter);
    blob.style.left = `${x}px`;
    blob.style.width = `${width}px`;
    bridge.style.left = `${bridgeLeft - 8}px`;
    bridge.style.width = `${bridgeRight - bridgeLeft + 16}px`;
    ind.style.width = `${width}px`;
    ind.style.transform = `translateX(${x}px)`;
    ind.dataset.x = String(x);
    ind.dataset.w = String(width);

    if (animate && !reduced && Math.abs(newCenter - oldCenter) > 2) {
      ind.classList.remove('moving');
      bridge.classList.remove('animate');
      void ind.offsetWidth;
      ind.classList.add('moving');
      bridge.classList.add('animate');
      clearTimeout(container._liquidTimer);
      container._liquidTimer = setTimeout(() => {
        ind.classList.remove('moving');
        bridge.classList.remove('animate');
      }, 370);
    }
  }

  function setTab(container, item, animate = true) {
    if (!container || !item) return;
    container.querySelectorAll('a,button').forEach(control => control.classList.toggle('active', control === item));
    positionLiquid(container, item, animate);
  }

  $$('[data-liquid-tabs]').forEach(ensureLiquid);

  function refreshLiquids() {
    $$('[data-liquid-tabs]').forEach(container => {
      positionLiquid(container, container.querySelector('.active') || container.querySelector('a,button'), false);
    });
  }

  requestAnimationFrame(refreshLiquids);
  addEventListener('resize', refreshLiquids);

  const navIds = ['home','learn','practice','quiz','progress'];
  const sections = navIds.map(id => document.getElementById(id));
  const desktopTabs = $('#desktopTabs');
  const mobileTabs = $('#mobileTabs');
  let navLock = { id: null, until: 0 };

  function applyNav(id, animate = true) {
    const desktop = desktopTabs.querySelector(`a[href="#${id}"]`);
    const mobile = mobileTabs.querySelector(`a[href="#${id}"]`);
    if (desktop) setTab(desktopTabs, desktop, animate);
    if (mobile) setTab(mobileTabs, mobile, animate);
  }

  function currentSection() {
    const activationY = innerHeight * .42;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= activationY && rect.bottom > activationY) return section.id;
    }
    let best = sections[0];
    let distance = Infinity;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const d = Math.abs(rect.top - activationY);
      if (d < distance) { distance = d; best = section; }
    }
    return best.id;
  }

  let scrollRAF = 0;
  function updateScrollSpy() {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = 0;
      if (navLock.id && performance.now() < navLock.until) {
        const target = document.getElementById(navLock.id);
        if (target) {
          const rect = target.getBoundingClientRect();
          const activationY = innerHeight * .42;
          if (rect.top <= activationY && rect.bottom > activationY) {
            navLock.id = null;
            applyNav(target.id, true);
          } else return;
        }
      }
      applyNav(currentSection(), true);
    });
  }

  addEventListener('scroll', updateScrollSpy, { passive: true });
  $$('#desktopTabs a,#mobileTabs a').forEach(anchor => anchor.addEventListener('click', event => {
    event.preventDefault();
    const id = anchor.getAttribute('href').slice(1);
    navLock = { id, until: performance.now() + 1100 };
    applyNav(id, true);
    goTo(`#${id}`);
  }));

  function goTo(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  $$('[data-go]').forEach(button => button.addEventListener('click', () => goTo(button.dataset.go)));

  if (!reduced && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: .16, rootMargin: '-4% 0px -7% 0px' });
    $$('.reveal,.stagger').forEach(element => revealObserver.observe(element));
  } else {
    $$('.reveal,.stagger').forEach(element => element.classList.add('is-visible'));
  }

  if (!reduced) {
    let heroRAF = 0;
    addEventListener('scroll', () => {
      if (heroRAF) return;
      heroRAF = requestAnimationFrame(() => {
        heroRAF = 0;
        const y = Math.min(42, scrollY * .055);
        $('.hero')?.style.setProperty('--hero-p', `${y}px`);
      });
    }, { passive: true });
  }

  const root = document.documentElement;
  const mqDark = matchMedia('(prefers-color-scheme: dark)');
  const resolveTheme = choice => choice === 'system' ? (mqDark.matches ? 'dark' : 'light') : choice;

  function commitTheme(choice) {
    const next = resolveTheme(choice);
    root.dataset.theme = next;
    $('meta[name=theme-color]').content = next === 'dark' ? '#000000' : '#f5f5f7';
    requestAnimationFrame(refreshLiquids);
  }

  function changeTheme(choice) {
    localStorage.setItem(THEME_KEY, choice);
    const update = () => commitTheme(choice);
    if (document.startViewTransition && !reduced) document.startViewTransition(update);
    else update();
  }

  const initialTheme = localStorage.getItem(THEME_KEY) || 'system';
  commitTheme(initialTheme);
  const initialThemeButton = $(`#themeTabs button[data-theme-choice="${initialTheme}"]`);
  if (initialThemeButton) setTab($('#themeTabs'), initialThemeButton, false);
  mqDark.addEventListener?.('change', () => { if ((localStorage.getItem(THEME_KEY) || 'system') === 'system') commitTheme('system'); });
  $('#themeTabs').addEventListener('click', event => {
    const button = event.target.closest('button[data-theme-choice]');
    if (!button) return;
    setTab($('#themeTabs'), button, true);
    changeTheme(button.dataset.themeChoice);
  });

  const settings = $('#settings');
  function setSettingsOpen(open) {
    settings.classList.toggle('open', open);
    settings.setAttribute('aria-hidden', String(!open));
    if (open) setTimeout(() => $('#settingsClose').focus(), 20);
  }
  $('#settingsOpen').addEventListener('click', () => setSettingsOpen(true));
  $('#settingsClose').addEventListener('click', () => setSettingsOpen(false));
  $('#settingsCloseBg').addEventListener('click', () => setSettingsOpen(false));

  const searchOverlay = $('#searchOverlay');
  function openSearch() {
    searchOverlay.classList.add('open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    $('#globalSearch').value = '';
    renderSearch('');
    setTimeout(() => $('#globalSearch').focus(), 20);
  }
  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchOverlay.setAttribute('aria-hidden', 'true');
  }
  $('#searchOpen').addEventListener('click', openSearch);
  $('#searchCloseBg').addEventListener('click', closeSearch);

  function renderSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      $('#searchResults').innerHTML = '<p class="search-hint">Try “balance”, “brackets”, “both sides”, or “quiz”.</p>';
      return;
    }
    const matches = searchItems.filter(item => `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(q)).slice(0, 8);
    $('#searchResults').innerHTML = matches.length ? matches.map(item => `<button class="search-result" type="button" data-search-id="${item.id}"><div><strong>${item.title}</strong><small>${item.description}</small></div><span>${item.type}</span></button>`).join('') : '<p class="search-hint">No exact match. Try a broader word like “equation”, “practice”, or “progress”.</p>';
  }
  $('#globalSearch').addEventListener('input', event => renderSearch(event.target.value));
  $('#searchResults').addEventListener('click', event => {
    const button = event.target.closest('[data-search-id]');
    if (!button) return;
    const item = searchItems.find(i => i.id === button.dataset.searchId);
    if (!item) return;
    if (item.lessonId) renderLesson(item.lessonId);
    else if (lessons.some(l => l.id === item.id)) renderLesson(item.id);
    closeSearch();
    goTo(item.target);
  });

  addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape') {
      closeSearch();
      setSettingsOpen(false);
    }
  });

  const cursor = $('#cursor');
  if (matchMedia('(pointer:fine)').matches && !reduced) {
    document.documentElement.classList.add('custom-cursor');
    let lastX = 0, lastY = 0, lastT = performance.now();
    let x = -100, y = -100, angle = 0, stretch = 0, targetStretch = 0, speed01 = 0;
    addEventListener('pointermove', event => {
      const now = performance.now();
      const dt = Math.max(7, now - lastT);
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const velocity = Math.hypot(dx, dy) / dt;
      speed01 = Math.min(1, velocity / 2.2);
      if (Math.abs(dx) + Math.abs(dy) > .1) angle = Math.atan2(dy, dx) * 180 / Math.PI;
      targetStretch = speed01 * .58;
      x = event.clientX;
      y = event.clientY;
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = now;
      cursor.classList.add('ready');
    }, { passive: true });
    addEventListener('pointerdown', () => cursor.classList.add('down'));
    addEventListener('pointerup', () => cursor.classList.remove('down'));
    document.addEventListener('mouseover', event => {
      const interactive = !!event.target.closest('a,button,input,textarea,select,.interactive-card');
      cursor.classList.toggle('hover', interactive);
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('ready'));
    function cursorFrame() {
      stretch += (targetStretch - stretch) * .26;
      targetStretch *= .84;
      speed01 *= .88;
      cursor.style.setProperty('--angle', `${angle}deg`);
      cursor.style.setProperty('--sx', String(1 + stretch));
      cursor.style.setProperty('--sy', String(1 - stretch * .30));
      cursor.style.setProperty('--trail', `${(speed01 * 23).toFixed(1)}px`);
      cursor.style.setProperty('--trail-opacity', (speed01 * .26).toFixed(3));
      cursor.style.setProperty('--blur', `${(speed01 * 3.6).toFixed(1)}px`);
      cursor.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${angle}deg) scale(${1 + stretch},${1 - stretch * .30})`;
      requestAnimationFrame(cursorFrame);
    }
    cursorFrame();
  }

  renderLesson(currentLessonId);
  updateAllProgressUI();
  requestAnimationFrame(() => {
    applyNav(currentSection(), false);
    refreshLiquids();
  });
})();
