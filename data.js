(() => {
  const lessons = [
    {
      id: 'linear-basics',
      number: 1,
      title: 'Solving linear equations',
      duration: '10 min',
      tier: 'Foundation',
      keywords: ['equation','balance','inverse','linear','algebra','solve x'],
      intro: 'An equation says that the value on the left of the equals sign is exactly the same as the value on the right. Solving an equation means finding the value of x that makes that statement true.',
      meaning: 'Your job is not to “move numbers around”. Your job is to get x by itself while keeping the equation balanced. To do that, look at the operations attached to x and undo them one at a time using inverse operations: addition is undone by subtraction, and multiplication is undone by division.',
      why: 'Imagine both sides of the equation are two sides of a balanced scale. If you remove 5 from only one side, the scale is no longer balanced. But if you remove 5 from both sides, both sides change by the same amount, so they are still equal. Every legal step in solving an equation follows this idea.',
      steps: [
        'Read the equation and identify what is being done to x. For example, in 3x + 5, x is first multiplied by 3 and then 5 is added.',
        'Undo the outermost operation first. In 3x + 5, remove the +5 by subtracting 5 from both sides.',
        'Once only a multiple of x remains, undo the multiplication. If you have 3x, divide both sides by 3.',
        'Never change only one side of the equation. Whatever operation you perform on the left must also be performed on the right.',
        'Check your answer by substituting it back into the original equation. If both sides become the same number, your answer works.'
      ],
      example: {
        title: 'Worked example · Solve 3x + 5 = 20',
        steps: [
          {
            title: '1. Subtract 5 from both sides',
            why: 'We want to isolate the term containing x. The +5 is outside the 3x, so we undo it first. The opposite of adding 5 is subtracting 5. We subtract 5 from both sides so the equation stays balanced.',
            working: ['3x + 5 - 5 = 20 - 5', '3x = 15']
          },
          {
            title: '2. Divide both sides by 3',
            why: 'Now x is still being multiplied by 3. To get one x by itself, undo that multiplication by dividing both sides by 3.',
            working: ['3x ÷ 3 = 15 ÷ 3', 'x = 5']
          },
          {
            title: '3. Check the answer',
            why: 'Put x = 5 back into the original equation. If the left side becomes 20, it matches the right side and proves the solution works.',
            working: ['3(5) + 5 = 20', '15 + 5 = 20', '20 = 20 ✓']
          }
        ]
      },
      mistake: 'A common shortcut is saying “move the 5 to the other side and change its sign”. That can work, but it hides the real reason. The 5 does not magically jump across the equals sign — you are subtracting 5 from both sides. Writing that step makes harder equations much easier to understand.',
      mini: {
        question: 'Solve: 4x + 7 = 31',
        answer: 6,
        explanation: 'Step 1 — Subtract 7 from both sides\nWe want to remove the +7 so only the term with x remains.\n4x + 7 - 7 = 31 - 7\n4x = 24\n\nStep 2 — Divide both sides by 4\n4x means 4 × x, so divide by 4 to leave one x.\n4x ÷ 4 = 24 ÷ 4\nx = 6\n\nCheck: 4(6) + 7 = 31, so the answer is correct.'
      },
      practiceTag: 'two-step'
    },
    {
      id: 'brackets',
      number: 2,
      title: 'Equations with brackets',
      duration: '12 min',
      tier: 'Foundation → Higher',
      keywords: ['brackets','expand','factor','distributive','equation'],
      intro: 'Brackets mean a group of terms is being treated as one expression. You still want x by itself, but first you need to deal with the multiplication around the bracket.',
      meaning: 'In 4(x + 2), the 4 multiplies the entire bracket. That means 4(x + 2) has the same value as 4x + 8. If the whole bracket is multiplied by one number and equals a simple number, dividing first is often the cleanest route.',
      why: 'If 4 copies of the same quantity equal 28, one copy must equal 28 ÷ 4 = 7. That is why dividing both sides by the number outside the bracket can remove that outside multiplication in one step.',
      steps: [
        'Look at the number outside the bracket. It multiplies everything inside the bracket.',
        'If the whole bracket is multiplied by a single number, consider dividing both sides by that number first.',
        'After removing the outside multiplication, solve the simpler equation inside the bracket using inverse operations.',
        'If dividing first is not convenient, expand the bracket by multiplying every term inside it.',
        'Always check the final value in the original bracketed equation.'
      ],
      example: {
        title: 'Worked example · Solve 4(x + 2) = 28',
        steps: [
          {
            title: '1. Divide both sides by 4',
            why: 'The entire bracket is multiplied by 4. Dividing both sides by 4 removes that outside multiplication and leaves just the expression inside the bracket.',
            working: ['4(x + 2) ÷ 4 = 28 ÷ 4', 'x + 2 = 7']
          },
          {
            title: '2. Subtract 2 from both sides',
            why: 'We now have x + 2. To get x by itself, undo the +2 by subtracting 2 from both sides.',
            working: ['x + 2 - 2 = 7 - 2', 'x = 5']
          },
          {
            title: '3. Check the answer',
            why: 'Substitute x = 5 into the original equation and simplify the bracket first.',
            working: ['4(5 + 2) = 28', '4(7) = 28', '28 = 28 ✓']
          }
        ]
      },
      mistake: 'If you choose to expand a bracket, the outside number multiplies every term inside it. For example, 3(x + 5) = 3x + 15. Writing 3x + 5 means you multiplied x by 3 but forgot to multiply the 5.',
      mini: {
        question: 'Solve: 5(x + 3) = 40',
        answer: 5,
        explanation: 'Step 1 — Divide both sides by 5\nThe entire bracket is multiplied by 5, so divide both sides by 5 to remove that multiplication.\n5(x + 3) ÷ 5 = 40 ÷ 5\nx + 3 = 8\n\nStep 2 — Subtract 3 from both sides\nUndo the +3 so x is by itself.\nx + 3 - 3 = 8 - 3\nx = 5\n\nCheck: 5(5 + 3) = 5 × 8 = 40.'
      },
      practiceTag: 'brackets'
    },
    {
      id: 'both-sides',
      number: 3,
      title: 'Unknowns on both sides',
      duration: '14 min',
      tier: 'Higher',
      keywords: ['both sides','unknown both sides','collect x','higher','linear equation'],
      intro: 'Sometimes x appears on both sides of the equals sign. The goal is still the same: get x by itself. First, collect all the x terms onto one side while keeping the equation balanced.',
      meaning: 'In 5x + 4 = 2x + 19, both sides contain x. Subtracting 2x from both sides removes the 2x on the right and leaves 3x on the left. After that, the equation becomes a normal two-step equation.',
      why: 'Because both sides are equal, subtracting the same algebraic amount from both sides keeps them equal. Choosing to remove the smaller x term often leaves a positive x coefficient, which makes the remaining arithmetic easier to read.',
      steps: [
        'Find the x terms on both sides and decide which one to remove. Usually subtract the smaller x term from both sides.',
        'Simplify the x terms. For example, 5x - 2x becomes 3x.',
        'Now remove any ordinary number added to or subtracted from the x term using the opposite operation on both sides.',
        'Divide by the coefficient of x so only x remains.',
        'Substitute your answer into both sides of the original equation and confirm they give the same value.'
      ],
      example: {
        title: 'Worked example · Solve 5x + 4 = 2x + 19',
        steps: [
          {
            title: '1. Subtract 2x from both sides',
            why: 'We want all the x terms on one side. Subtracting 2x removes the 2x on the right. We must also subtract 2x on the left to keep the equation balanced.',
            working: ['5x + 4 - 2x = 2x + 19 - 2x', '3x + 4 = 19']
          },
          {
            title: '2. Subtract 4 from both sides',
            why: 'Now the only thing added to 3x is +4. Undo that addition by subtracting 4 from both sides.',
            working: ['3x + 4 - 4 = 19 - 4', '3x = 15']
          },
          {
            title: '3. Divide both sides by 3',
            why: '3x means 3 multiplied by x. Divide both sides by 3 to leave a single x.',
            working: ['3x ÷ 3 = 15 ÷ 3', 'x = 5']
          },
          {
            title: '4. Check the answer',
            why: 'Substitute x = 5 into both sides. If both sides produce the same number, the solution is correct.',
            working: ['Left: 5(5) + 4 = 29', 'Right: 2(5) + 19 = 29', '29 = 29 ✓']
          }
        ]
      },
      mistake: 'Do not cancel an x term from only one side. For example, if you subtract 2x to remove the 2x on the right, you must also subtract 2x from the left. Otherwise you have changed the equation rather than solved it.',
      mini: {
        question: 'Solve: 7x + 2 = 4x + 20',
        answer: 6,
        explanation: 'Step 1 — Subtract 4x from both sides\nThis collects the x terms on the left.\n7x + 2 - 4x = 4x + 20 - 4x\n3x + 2 = 20\n\nStep 2 — Subtract 2 from both sides\n3x + 2 - 2 = 20 - 2\n3x = 18\n\nStep 3 — Divide both sides by 3\n3x ÷ 3 = 18 ÷ 3\nx = 6\n\nCheck: both sides equal 44 when x = 6.'
      },
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
      const b = nonZero(-12, 12);
      const c = a * answer + b;
      question = `${a}x ${signed(b)} = ${c}`;
      const absB = Math.abs(b);
      const afterConstant = a * answer;
      const opName = b > 0 ? `Subtract ${absB}` : `Add ${absB}`;
      const leftWork = b > 0 ? `${a}x + ${absB} - ${absB}` : `${a}x - ${absB} + ${absB}`;
      const rightWork = b > 0 ? `${c} - ${absB}` : `${c} + ${absB}`;
      explanation =
        `Step 1 — ${opName} on both sides\n` +
        `Why? We want to remove the ${b > 0 ? '+' : '-'}${absB} so the term containing x is by itself. Using the opposite operation undoes it, and doing it to both sides keeps the equation balanced.\n` +
        `${leftWork} = ${rightWork}\n` +
        `${a}x = ${afterConstant}\n\n` +
        `Step 2 — Divide both sides by ${a}\n` +
        `Why? ${a}x means ${a} × x. Dividing by ${a} undoes that multiplication and leaves one x.\n` +
        `${a}x ÷ ${a} = ${afterConstant} ÷ ${a}\n` +
        `x = ${answer}\n\n` +
        `Check: ${a}(${answer}) ${signed(b)} = ${c}, so the solution works.`;
      commonMistake = 'Do not just “move” the constant across the equals sign. Use the opposite operation on both sides so you can see why the equation stays equal.';
    } else if (tag === 'brackets') {
      const a = nonZero(2, 8);
      const b = nonZero(-7, 7);
      const c = a * (answer + b);
      question = `${a}(x ${signed(b)}) = ${c}`;
      const inside = c / a;
      const absB = Math.abs(b);
      const opName = b > 0 ? `Subtract ${absB}` : `Add ${absB}`;
      const insideWork = b > 0 ? `x + ${absB} - ${absB} = ${inside} - ${absB}` : `x - ${absB} + ${absB} = ${inside} + ${absB}`;
      explanation =
        `Step 1 — Divide both sides by ${a}\n` +
        `Why? The entire bracket is multiplied by ${a}. Dividing both sides by ${a} removes that outside multiplication without changing the balance.\n` +
        `${a}(x ${signed(b)}) ÷ ${a} = ${c} ÷ ${a}\n` +
        `x ${signed(b)} = ${inside}\n\n` +
        `Step 2 — ${opName} on both sides\n` +
        `Why? This undoes the number attached to x inside the bracket expression.\n` +
        `${insideWork}\n` +
        `x = ${answer}\n\n` +
        `Check: ${a}(${answer} ${signed(b)}) = ${c}.`;
      commonMistake = 'Remember that the number outside the bracket affects the whole bracket. If you expand instead, multiply every term inside.';
    } else {
      let a = randInt(3, 9);
      let cCoef = randInt(1, a - 1);
      if (difficulty === 'hard' && Math.random() > .5) {
        a = randInt(4, 12);
        cCoef = randInt(1, a - 1);
      }
      const b = nonZero(-10, 12);
      const d = (a - cCoef) * answer + b;
      question = `${a}x ${signed(b)} = ${cCoef}x ${signed(d)}`;
      const coefficient = a - cCoef;
      const absB = Math.abs(b);
      const constantMove = d - b;
      const opName = b > 0 ? `Subtract ${absB}` : `Add ${absB}`;
      const leftConstWork = b > 0 ? `${coefficient}x + ${absB} - ${absB}` : `${coefficient}x - ${absB} + ${absB}`;
      const rightConstWork = b > 0 ? `${d} - ${absB}` : `${d} + ${absB}`;
      explanation =
        `Step 1 — Subtract ${cCoef}x from both sides\n` +
        `Why? x appears on both sides. Removing the smaller x term collects the unknowns onto one side while keeping the equation balanced.\n` +
        `${a}x ${signed(b)} - ${cCoef}x = ${cCoef}x ${signed(d)} - ${cCoef}x\n` +
        `${coefficient}x ${signed(b)} = ${d}\n\n` +
        `Step 2 — ${opName} on both sides\n` +
        `Why? Now we remove the ordinary number attached to the x term.\n` +
        `${leftConstWork} = ${rightConstWork}\n` +
        `${coefficient}x = ${constantMove}\n\n` +
        `Step 3 — Divide both sides by ${coefficient}\n` +
        `Why? ${coefficient}x means ${coefficient} × x, so division leaves one x.\n` +
        `${coefficient}x ÷ ${coefficient} = ${constantMove} ÷ ${coefficient}\n` +
        `x = ${answer}\n\n` +
        `Check by substituting x = ${answer} into both sides; they give the same value.`;
      commonMistake = 'When removing an x term, subtract it from both sides. Cancelling it on only one side changes the equation.';
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