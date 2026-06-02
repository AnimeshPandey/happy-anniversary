var SITE = {
  title:    'Happy Anniversary',
  subtitle: 'One beautiful year',
  date:     'June 2025 to June 2026',

  opening: {
    poem: 'Every love story is beautiful,\nbut ours is my favourite.',
    panels: [
      {
        id: 'panel-1',
        text: 'A year ago, something started that I will spend the rest of my life being grateful for.',
        imageId: 'hero-main'
      },
      {
        id: 'panel-2',
        text: 'It did not look like much from the outside. Just two people, one ordinary day, and an ordinary beginning to something extraordinary.',
        imageId: 'ceremony-bg'
      }
    ]
  },

  chapters: [
    {
      number: '01',
      title: 'How it started',
      body: 'Every great love story has a beginning. Ours started quietly, unexpectedly: the kind of beginning you only recognise as a beginning once you are deep inside the middle of something wonderful. I remember noticing you and thinking: this is different. This one matters.',
      imageId: 'ch1-main',
      layout: 'left'
    },
    {
      number: '02',
      title: 'The first yes',
      body: 'You said yes. Three words that I have replayed more times than I can count. From that moment, the world arranged itself differently. Everything that came before became part of the before, and everything after was painted in a warmer light.',
      imageId: 'ch2-main',
      layout: 'right'
    },
    {
      number: '03',
      title: 'When I knew',
      body: 'There was a specific moment. Not dramatic, not announced. Maybe it was something you said, or the way you laughed, or a quiet afternoon when I looked at you and felt something settle into place. I knew. I absolutely knew. And I have known every day since.',
      imageId: 'ch3-main',
      layout: 'left'
    },
    {
      number: '04',
      title: 'Our first adventure',
      body: 'The best adventures are the ones you almost do not take. We said yes with equal parts excitement and nerves, and what came back from it was not just photographs. It was a version of us that had learned how to be us together in new places. I want more of those.',
      imageId: 'ch4-main',
      layout: 'right'
    },
    {
      number: '05',
      title: 'The little things',
      body: 'Love is not the grand gestures (though those are wonderful). Love is the cup of tea before you asked for it. The way you remember what I mentioned once, weeks ago. The message that arrives exactly when I need it. The little things are, quietly, the whole thing.',
      imageId: 'ch5-main',
      layout: 'left'
    },
    {
      number: '06',
      title: 'When you made everything better',
      body: 'There were days when everything felt hard. And then there was you: not always with solutions, not always with the right words, but always there. You have an extraordinary ability to make difficult things feel survivable. That is an extraordinary kind of love.',
      imageId: 'ch6-main',
      layout: 'right'
    },
    {
      number: '07',
      title: 'The quiet moments',
      body: 'Not every memory is a highlight. Some of the best ones are Tuesday evenings, unhurried mornings, the easy silence of two people who do not need to fill every space with words. Those quiet moments are the architecture of something lasting, and I treasure every single one.',
      imageId: 'ch7-main',
      layout: 'left'
    },
    {
      number: '08',
      title: 'How you changed me',
      body: 'I am different because of you. Better, I think: more patient, more open, more willing to feel things fully. You did not try to change me. You just made space for me to grow into a version of myself I like more. That might be the most loving thing a person can do.',
      imageId: 'ch8-main',
      layout: 'right'
    },
    {
      number: '09',
      title: 'Every ordinary day',
      body: 'Ordinary days with you are not ordinary at all. They are full of small beauties: the way the light falls in the morning, the routines that have become rituals, the conversations that are really just love, worn smooth and comfortable by repetition. I would choose them endlessly.',
      imageId: 'ch9-main',
      layout: 'left'
    },
    {
      number: '10',
      title: 'What I never want to forget',
      body: 'I want to remember all of it. Not just the perfect days but the imperfect ones, the laughter that made no sense, the plans that changed, the moments we did not know were becoming memories until they already were. I want to hold all of it. Every bit.',
      imageId: 'ch10-main',
      layout: 'right'
    },
    {
      number: '11',
      title: 'Where we are going',
      body: 'A year in, and I find myself genuinely excited about everything still ahead. New places, new ordinary days, new versions of us. Whatever comes next, I know I want to face it with you beside me. That certainty is its own kind of quiet, steady joy.',
      imageId: 'ch11-main',
      layout: 'left'
    },
    {
      number: '12',
      title: 'Everything, always',
      body: 'One year. Three hundred and sixty-five days. And somewhere in all of that, you became my favourite part of being alive. Not just on the good days. On all of them. Thank you for choosing me, and for everything that choosing has meant. I love you. Everything, always.',
      imageId: 'ch12-main',
      layout: 'right'
    }
  ],

  crescendo: {
    line1: 'You are the best thing',
    line2: 'that has ever happened to me.',
    line3: 'Happy first anniversary.'
  },

  closing: {
    message:  'With all of my love, always and without reservation. Today and every day that comes after this one.',
    signoff:  'Yours,',
    imageId:  'closing-hero'
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
  'closing-hero': { aspectRatio: '3/4',  placeholder: 'THE photo, the most important image of all' }
};
