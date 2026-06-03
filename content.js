var SITE = {
  title:         'Happy Anniversary',
  subtitle:      'One beautiful year',
  date:          'June 2025 to June 2026',
  recipientName: 'Divya',

  opening: {
    poem: 'Every love story is beautiful,\nBut Divya, ours is my favourite.',
    panels: [
      {
        id: 'panel-1',
        text: 'A year ago, you walked into my life, Divya, and I have spent every day since being grateful for that one ordinary beginning.',
        imageId: 'hero-main'
      },
      {
        id: 'panel-2',
        text: 'From the outside it looked unremarkable: two people, one quiet start. But something was already different. I already knew.',
        imageId: 'ceremony-bg'
      }
    ]
  },

  chapters: [
    {
      number: '01',
      title:  'How it started',
      body:   'Ours began the way the best things do, without announcement. I remember the exact moment I noticed you, Divya: something in me went quiet and certain at once. I thought: this is the one. That thought has not changed once in a year.',
      imageId: 'ch1-main',
      layout:  'left',
      mood:    '🌱'
    },
    {
      number: '02',
      title:  'The first yes',
      body:   'When you said yes, the world rearranged itself. Everything before became the before. Everything after was gentler, brighter, fuller. Three words, and I have been living inside them ever since.',
      imageId: 'ch2-main',
      layout:  'right',
      mood:    '💫'
    },
    {
      number: '03',
      title:  'When I knew',
      body:   'There was a specific moment, nothing dramatic, nothing announced. You said something ordinary, or laughed at something small, and I felt it settle into certainty. I knew. Completely. And I have known it every single day since.',
      imageId: 'ch3-main',
      layout:  'left',
      mood:    '🌙'
    },
    {
      number: '04',
      title:  'Our first adventure',
      body:   'The best adventures are the ones you almost do not take. We said yes with nervousness and full hearts, and what we brought back was not just photographs. It was a version of us that had learned how to be us somewhere new. I want more of those moments, Divya. Many more.',
      imageId: 'ch4-main',
      layout:  'right',
      mood:    '🗺️'
    },
    {
      number: '05',
      title:  'The little things',
      body:   'Love is not only the grand gestures. Love is remembering what I mentioned once, weeks ago. The message that arrives exactly when I need it. The quiet cup of tea before I asked for it. With you, the little things are not little at all. They are the whole thing.',
      imageId: 'ch5-main',
      layout:  'left',
      mood:    '🪴'
    },
    {
      number: '06',
      title:  'When you made everything better',
      body:   'There were hard days. And then there was you, not always with the perfect words, not always with answers, but always there. You have a rare gift, Divya: you make difficult things feel survivable. That is an extraordinary way to be loved.',
      imageId: 'ch6-main',
      layout:  'right',
      mood:    '🌊'
    },
    {
      number: '07',
      title:  'The quiet moments',
      body:   'Not every memory needs to be a highlight. Some of the ones I hold closest are Tuesday evenings, unhurried mornings, the easy silence of two people who do not need to fill every moment with words. Those quiet moments are the architecture of something lasting.',
      imageId: 'ch7-main',
      layout:  'left',
      mood:    '🕊️'
    },
    {
      number: '08',
      title:  'How you changed me',
      body:   'I am a different person because of you. More patient, more open, more willing to feel things fully. You did not try to change me. You simply made space for me to grow into a version of myself I like more. That might be the most loving thing one person can do for another.',
      imageId: 'ch8-main',
      layout:  'right',
      mood:    '🌺'
    },
    {
      number: '09',
      title:  'Every ordinary day',
      body:   'Ordinary days with you are not ordinary. They are full of small, unrepeatable beauties: the way light falls in the morning, the routines that have quietly become rituals, the conversations that are really just love wearing comfortable clothes. I would choose them endlessly.',
      imageId: 'ch9-main',
      layout:  'left',
      mood:    '☀️'
    },
    {
      number: '10',
      title:  'What I never want to forget',
      body:   'I want to remember all of it: not only the beautiful days but the imperfect ones, the laughter that made no sense, the plans that changed. The moments we did not know were becoming memories until they already had. I want to hold every single bit of it.',
      imageId: 'ch10-main',
      layout:  'right',
      mood:    '📸'
    },
    {
      number: '11',
      title:  'Where we are going',
      body:   'A year in, and I find myself genuinely excited about everything still ahead. New places, new ordinary days, new versions of us. Whatever comes next, Divya, I know exactly who I want beside me. That certainty is its own kind of quiet, steady joy.',
      imageId: 'ch11-main',
      layout:  'left',
      mood:    '✨'
    },
    {
      number: '12',
      title:  'Everything, always',
      body:   'One year. Three hundred and sixty-five days. And somewhere inside all of that, you became my favourite part of being alive, not just on the good days, but on all of them. Thank you for choosing me. I love you, Divya. Everything, always.',
      imageId: 'ch12-main',
      layout:  'right',
      mood:    '❤️'
    }
  ],

  hiddenChapter: {
    number: '∞',
    title:  'Wait, one more thing',
    body:   'There are no words big enough for this year. But I keep reaching for them because you deserve every one, the large words and the small, and every quiet one in between. Here is the truest thing I know: I am the luckiest person alive. Not because of anything I did, but because you exist, and somehow I get to love you. That is not a small thing. That is everything there is.',
    imageId: 'hidden-ch',
    layout:  'left'
  },

  crescendo: {
    line1: 'Divya, you are the best thing',
    line2: 'that has ever happened to me.',
    line3: 'Happy first anniversary.'
  },

  closing: {
    message: 'With all of my love, always and without reservation. Today, and every day that comes after this one.',
    signoff: 'Yours, always',
    author:  'Animesh',
    imageId: 'closing-hero'
  }
};

var IMAGE_SLOTS = {
  'hero-main':    { aspectRatio: '9/16', placeholder: 'The two of you, your most beautiful shot' },
  'ceremony-bg':  { aspectRatio: '16/9', placeholder: 'A place you both love, atmospheric background' },
  'ch1-main':     { aspectRatio: '4/3',  placeholder: 'How it started, the very beginning' },
  'ch2-main':     { aspectRatio: '4/3',  placeholder: 'The first yes, that meaningful moment' },
  'ch3-main':     { aspectRatio: '16/9', placeholder: 'When you knew, wherever that was' },
  'ch4-main':     { aspectRatio: '4/3',  placeholder: 'Your first adventure together' },
  'ch5-main':     { aspectRatio: '4/3',  placeholder: 'An everyday moment, the little things' },
  'ch6-main':     { aspectRatio: '3/4',  placeholder: 'When they made everything better' },
  'ch7-main':     { aspectRatio: '16/9', placeholder: 'A quiet, peaceful moment together' },
  'ch8-main':     { aspectRatio: '4/3',  placeholder: 'A moment that shows how they changed you' },
  'ch9-main':     { aspectRatio: '4/3',  placeholder: 'An ordinary day, the best kind' },
  'ch10-main':    { aspectRatio: '4/3',  placeholder: 'A memory you never want to forget' },
  'ch11-main':    { aspectRatio: '16/9', placeholder: 'Looking ahead, a hopeful forward scene' },
  'ch12-main':    { aspectRatio: '4/3',  placeholder: 'Everything always, your favourite photo of all' },
  'closing-hero': { aspectRatio: '3/4',  placeholder: 'THE photo, the most important image of all' },
  'hidden-ch':    { aspectRatio: '1/1',  placeholder: 'The one, the only' }
};
