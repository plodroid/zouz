(() => {
  const lessons = [
    {
      id: 'linear-basics',
      number: 1,
      title: 'Solving linear equations',
      duration: '8 min',
      tier: 'Foundation',
      keywords: ['equation','balance','inverse','linear','algebra','solve x'],
      intro: 'An equation is a statement that two expressions have the same value. Solving it means finding the value of the unknown that keeps both sides equal.',
      meaning: 'Think of an equation like a balanced scale. Whatever you do to one side, you must do to the other. Your goal is to undo the operations around x until x is by itself.',
      why: 'The equals sign says both sides have the same value. If two equal amounts are changed in exactly the same way, they stay equal. That is why subtracting 5 from both sides, or dividing both sides by 3, keeps the equation valid.',
      steps: [
        'Look at what has been done to x.',
        'Undo addition or subtraction first using the opposite operation.',
        'Undo multiplication or division next.',
        'Do the same operation to both sides every time.',
        'Check by putting your answer back into the original equation.'
      ],
      example: {
        title: 'Worked example · Solve 3x + 5 = 20',
        lines: [
          ['3x + 5 = 20', 'Start with the original equation.'],
          ['3x = 15', 'Subtract 5 from both sides.'],
          ['x = 5', 'Divide both sides by 3.'],
          ['3(5) + 5 = 20', 'Check: 15 + 5 = 20, so x = 5 works.']
        ]
      },
      mistake: 'Do not move a number across the equals sign and “change its sign” without understanding why. That shortcut is really applying the opposite operation to both sides. Writing the operation keeps your method reliable when equations get harder.',
      mini: { question: 'Solve: 4x + 7 = 31', answer: 6, explanation: 'Subtract 7 from both sides: 4x = 24. Then divide both sides by 4, so x = 6.' },
      practiceTag: 'two-step'
    },
    {
      id: 'brackets',
      number: 2,
      title: 'Equations with brackets',
      duration: '10 min',
      tier: 'Foundation → Higher',
      keywords: ['brackets','expand','factor','distributive','equation'],
      intro: 'Brackets do not change the goal: get x on its own. They just give you a choice — expand first, or sometimes divide by the number outside the bracket first.',
      meaning: 'In 3(x + 4), the 3 multiplies everything inside the bracket. You can expand it to 3x + 12. But if the whole bracket equals a number, dividing first can be quicker.',
      why: 'Multiplication distributes across addition: a(b + c) = ab + ac. Both forms have exactly the same value, so you can choose the version that makes the equation easiest to solve.',
      steps: [
        'Decide whether expanding or dividing first is simpler.',
        'If you expand, multiply every term inside the bracket.',
        'Collect or simplify terms if needed.',
        'Use inverse operations on both sides until x is alone.',
        'Substitute your answer back into the original bracketed equation to check.'
      ],
      example: {
        title: 'Worked example · Solve 4(x + 2) = 28',
        lines: [
          ['4(x + 2) = 28', 'The whole bracket is multiplied by 4.'],
          ['x + 2 = 7', 'Divide both sides by 4.'],
          ['x = 5', 'Subtract 2 from both sides.'],
          ['4(5 + 2) = 28', 'Check: 4 × 7 = 28.']
        ]
      },
      mistake: 'If you expand, the outside number must multiply every term inside the bracket. For example, 3(x + 5) is 3x + 15, not 3x + 5.',
      mini: { question: 'Solve: 5(x + 3) = 40', answer: 5, explanation: 'Divide both sides by 5: x + 3 = 8. Subtract 3, so x = 5.' },
      practiceTag: 'brackets'
    },
    {
      id: 'both-sides',
      number: 3,
      title: 'Unknowns on both sides',
      duration: '12 min',
      tier: 'Higher',
      keywords: ['both sides','unknown both sides','collect x','higher','linear equation'],
      intro: 'When x appears on both sides, the equation is still a balance. First collect the x terms onto one side, then solve the simpler equation that remains.',
      meaning: 'For 5x + 4 = 2x + 19, both expressions are equal. Subtracting 2x from both sides removes the x term from the right without breaking the equality.',
      why: 'Subtracting the same algebraic term from two equal expressions preserves equality. Choosing the smaller x term to remove often keeps the remaining coefficient positive, which makes the arithmetic easier.',
      steps: [
        'Identify the x terms on both sides.',
        'Subtract the smaller x term from both sides so x remains on one side.',
        'Move constant numbers using the opposite operation on both sides.',
        'Divide by the coefficient of x.',
        'Check the result in both sides of the original equation.'
      ],
      example: {
        title: 'Worked example · Solve 5x + 4 = 2x + 19',
        lines: [
          ['5x + 4 = 2x + 19', 'Start with x on both sides.'],
          ['3x + 4 = 19', 'Subtract 2x from both sides.'],
          ['3x = 15', 'Subtract 4 from both sides.'],
          ['x = 5', 'Divide both sides by 3.'],
          ['29 = 29', 'Check: both sides equal 29 when x = 5.']
        ]
      },
      mistake: 'Do not subtract an x term from only one side. If you remove 2x from the right, you must also subtract 2x from the left.',
      mini: { question: 'Solve: 7x + 2 = 4x + 20', answer: 6, explanation: 'Subtract 4x from both sides: 3x + 2 = 20. Subtract 2: 3x = 18. Divide by 3, so x = 6.' },
      practiceTag: 'both-sides'
    }
  ];

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const nonZero = (min, max) => {
    let value = 0;
    while (value === 0) value = randInt(min, max);
    return value;
  };

  const signed = (n, first = false) => {
    if (first) return String(n);
    return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
  };

  function makeChoices(answer) {
    const candidates = new Set([answer]);
    const offsets = [-4,-3,-2,-1,1,2,3,4];
    while (candidates.size < 4) {
      candidates.add(answer + pick(offsets));
    }
    return [...candidates].sort(() => Math.random() - 0.5);
  }

  function makeQuestion(difficulty = 'easy', preferredTag = null, forceType = null) {
    let tag = preferredTag;
    if (!tag) {
      tag = difficulty === 'easy' ? 'two-step' : difficulty === 'medium' ? pick(['two-step','brackets']) : pick(['brackets','both-sides']);
    }

    const answer = randInt(-9, 12);
    let question = '';
    let explanation = '';
    let commonMistake = '';

    if (tag === 'two-step') {
      const a = nonZero(2, difficulty === 'easy' ? 7 : 10);
      const b = randInt(-12, 12);
      const c = a * answer + b;
      question = `${a}x ${signed(b)} = ${c}`;
      const inverseText = b >= 0 ? `Subtract ${b}` : `Add ${Math.abs(b)}`;
      explanation = `${inverseText} on both sides to get ${a}x = ${a * answer}. Then divide both sides by ${a}, so x = ${answer}.`;
      commonMistake = 'Undo the constant on both sides before dividing by the coefficient of x.';
    } else if (tag === 'brackets') {
      const a = nonZero(2, 8);
      const b = randInt(-7, 7);
      const c = a * (answer + b);
      question = `${a}(x ${signed(b)}) = ${c}`;
      const first = c / a;
      const inverseText = b >= 0 ? `subtract ${b}` : `add ${Math.abs(b)}`;
      explanation = `Divide both sides by ${a}: x ${signed(b)} = ${first}. Then ${inverseText}, giving x = ${answer}.`;
      commonMistake = 'The number outside a bracket multiplies the entire bracket, not just x.';
    } else {
      let a = randInt(3, 9);
      let cCoef = randInt(1, a - 1);
      if (difficulty === 'hard' && Math.random() > .5) {
        a = randInt(4, 12);
        cCoef = randInt(1, a - 1);
      }
      const b = randInt(-10, 12);
      const d = (a - cCoef) * answer + b;
      question = `${a}x ${signed(b)} = ${cCoef}x ${signed(d)}`;
      const coefficient = a - cCoef;
      const rhsAfterX = d;
      const constantMove = rhsAfterX - b;
      explanation = `Subtract ${cCoef}x from both sides: ${coefficient}x ${signed(b)} = ${rhsAfterX}. Then ${b >= 0 ? `subtract ${b}` : `add ${Math.abs(b)}`} on both sides: ${coefficient}x = ${constantMove}. Divide by ${coefficient}, so x = ${answer}.`;
      commonMistake = 'When removing an x term from one side, perform the same subtraction on the other side.';
    }

    const type = forceType || (Math.random() < .42 ? 'choice' : 'typed');
    const id = `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      id,
      subject: 'Mathematics',
      topic: 'Algebra',
      subtopic: tag,
      difficulty,
      tier: tag === 'both-sides' ? 'higher' : 'foundation',
      question: `Solve: ${question}`,
      answer,
      type,
      choices: type === 'choice' ? makeChoices(answer) : null,
      explanation,
      commonMistake,
      marks: 1,
      tags: [tag, 'linear-equations']
    };
  }

  function difficultyForIndex(index, total, mix = 'mixed', tier = 'foundation') {
    if (mix !== 'mixed') return mix;
    const fraction = index / Math.max(1, total - 1);
    if (tier === 'foundation') {
      if (fraction < .45) return 'easy';
      if (fraction < .85) return 'medium';
      return 'hard';
    }
    if (fraction < .25) return 'easy';
    if (fraction < .62) return 'medium';
    return 'hard';
  }

  function makeQuiz(count = 20, mix = 'mixed', tier = 'foundation') {
    return Array.from({ length: count }, (_, index) => {
      const difficulty = difficultyForIndex(index, count, mix, tier);
      let preferredTag = null;
      if (tier === 'foundation' && difficulty === 'hard') preferredTag = pick(['brackets','two-step']);
      if (tier === 'higher' && difficulty === 'hard') preferredTag = 'both-sides';
      return makeQuestion(difficulty, preferredTag);
    });
  }

  const searchItems = [
    ...lessons.map(lesson => ({
      id: lesson.id,
      type: 'Lesson',
      title: lesson.title,
      description: lesson.intro,
      keywords: lesson.keywords.join(' '),
      target: '#learn'
    })),
    { id:'practice-search', type:'Mode', title:'Practice linear equations', description:'Adaptive practice that steps difficulty up and down.', keywords:'practice train adaptive mastery', target:'#practice' },
    { id:'quiz-search', type:'Mode', title:'Quizzer', description:'Random 20–50 question tests, including Perfect Run.', keywords:'quiz test perfect run questions', target:'#quiz' },
    { id:'progress-search', type:'Mode', title:'Progress & mistake book', description:'Real completion, quiz history, weak areas, and saved mistakes.', keywords:'progress mistakes scores history weak', target:'#progress' },
    { id:'balance-search', type:'Concept', title:'Why equations stay balanced', description:'Doing the same operation to equal values keeps them equal.', keywords:'balance equals both sides inverse operation', target:'#learn', lessonId:'linear-basics' }
  ];

  window.ZouzData = { lessons, makeQuestion, makeQuiz, searchItems };
})();