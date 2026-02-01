// Connections puzzles for couples - 16 words in 4 groups
const connectionsPuzzles = [
  {
    date: null,
    theme: 'Romance & Distance',
    groups: [
      { category: 'Things that are RED', words: ['ROSE', 'HEART', 'BLUSH', 'WINE'], difficulty: 'easy' },
      { category: 'Ways to say I LOVE YOU', words: ['TEXT', 'CALL', 'LETTER', 'VISIT'], difficulty: 'medium' },
      { category: 'Feelings when MISSING someone', words: ['LONELY', 'LONGING', 'ACHE', 'YEARN'], difficulty: 'hard' },
      { category: 'Things that CONNECT us', words: ['VIDEO', 'PHONE', 'WIFI', 'FLIGHT'], difficulty: 'medium' }
    ]
  },
  {
    date: null,
    theme: 'Love & Relationships',
    groups: [
      { category: 'Things you do on a DATE', words: ['DINNER', 'MOVIE', 'WALK', 'TALK'], difficulty: 'easy' },
      { category: 'Pet names', words: ['BABE', 'HONEY', 'SWEET', 'LOVE'], difficulty: 'medium' },
      { category: 'Anniversary gifts', words: ['FLOWERS', 'RING', 'WATCH', 'PHOTO'], difficulty: 'hard' },
      { category: 'Words ending in -SHIP', words: ['FRIENDSHIP', 'KINSHIP', 'COURTSHIP', 'WORSHIP'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Communication',
    groups: [
      { category: 'Messaging apps', words: ['WHATSAPP', 'TELEGRAM', 'SIGNAL', 'IMESSAGE'], difficulty: 'easy' },
      { category: 'Emojis you send', words: ['HEART', 'KISS', 'HUG', 'SMILE'], difficulty: 'medium' },
      { category: 'Things you SHARE', words: ['DREAMS', 'SECRETS', 'LAUGHS', 'MUSIC'], difficulty: 'medium' },
      { category: 'Time zones apart', words: ['HOUR', 'DELAY', 'WAIT', 'LATER'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Late Night Energy',
    groups: [
      { category: 'Things you do AFTER DARK', words: ['CUDDLE', 'KISS', 'TOUCH', 'WHISPER'], difficulty: 'easy' },
      { category: 'Bedroom vibes', words: ['CANDLES', 'MUSIC', 'SHEETS', 'LIGHTS'], difficulty: 'medium' },
      { category: 'Ways to tease', words: ['TEASE', 'DESCRIBE', 'TOUCH', 'STARE'], difficulty: 'medium' },
      { category: 'Feelings when things get INTENSE', words: ['HEAT', 'HORNY', 'DESIRE', 'NERVOUS'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Dubai Nights',
    groups: [
      { category: 'Dubai landmarks', words: ['BURJ', 'MARINA', 'PALM', 'DESERT'], difficulty: 'easy' },
      { category: 'Luxury experiences', words: ['YACHT', 'ROOFTOP', 'SPA', 'SUITE'], difficulty: 'medium' },
      { category: 'Hot weather essentials', words: ['SUN', 'SHADE', 'POOL', 'ICE'], difficulty: 'medium' },
      { category: 'Words linked to GOLD', words: ['JEWELRY', 'SAND', 'LUXE', 'SHINE'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'London Love',
    groups: [
      { category: 'London places', words: ['SOHO', 'CAMDEN', 'CHELSEA', 'BRIDGE'], difficulty: 'easy' },
      { category: 'Classic British things', words: ['TEA', 'RAIN', 'COAT', 'TUBE'], difficulty: 'medium' },
      { category: 'Romantic city moments', words: ['STROLL', 'PUB', 'LAUGH', 'HANDHOLD'], difficulty: 'medium' },
      { category: 'Words linked to ROYAL', words: ['CROWN', 'PALACE', 'THRONE', 'REIGN'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Classic Connections',
    groups: [
      { category: 'Synonyms for QUICK', words: ['FAST', 'RAPID', 'SWIFT', 'SPEEDY'], difficulty: 'easy' },
      { category: 'Things you can BREAK', words: ['RULE', 'PROMISE', 'RECORD', 'HEART'], difficulty: 'medium' },
      { category: 'Words that follow NIGHT', words: ['OWL', 'CLUB', 'SHIFT', 'CAP'], difficulty: 'medium' },
      { category: 'Silent letters', words: ['KNIFE', 'WRIST', 'HOUR', 'PSALM'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Travel & Togetherness',
    groups: [
      { category: 'Things at an AIRPORT', words: ['GATE', 'TICKET', 'BAGGAGE', 'SECURITY'], difficulty: 'easy' },
      { category: 'Ways to MOVE', words: ['WALK', 'DRIVE', 'FLY', 'RIDE'], difficulty: 'easy' },
      { category: 'Words tied to WAITING', words: ['DELAY', 'HOLD', 'QUEUE', 'PAUSE'], difficulty: 'medium' },
      { category: 'Words that precede ROOM', words: ['HOTEL', 'LIVING', 'DINING', 'BED'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Love, NYT-Style',
    groups: [
      { category: 'Terms of endearment', words: ['BABE', 'HONEY', 'DEAR', 'LOVE'], difficulty: 'easy' },
      { category: 'Ways to show affection', words: ['HUG', 'KISS', 'CUDDLE', 'HOLD'], difficulty: 'medium' },
      { category: 'Words tied to COMMITMENT', words: ['PROMISE', 'VOW', 'TRUST', 'LOYALTY'], difficulty: 'medium' },
      { category: 'Words with double meanings', words: ['DATE', 'MATCH', 'RING', 'CRUSH'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Tricky Overlaps',
    groups: [
      { category: 'Words related to MUSIC', words: ['NOTE', 'SCALE', 'KEY', 'BAND'], difficulty: 'easy' },
      { category: 'Words related to CRIME', words: ['CASE', 'ROBBERY', 'SUSPECT', 'JAIL'], difficulty: 'medium' },
      { category: 'Words that can follow OPEN', words: ['BAR', 'DOOR', 'MIND', 'CASE'], difficulty: 'hard' },
      { category: 'Words with multiple meanings', words: ['KEY', 'CASE', 'DATE', 'BAND'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Late Night NYT Energy',
    groups: [
      { category: 'Things you do before BED', words: ['BRUSH', 'TEXT', 'READ', 'THINK'], difficulty: 'easy' },
      { category: 'Things that keep you AWAKE', words: ['COFFEE', 'STRESS', 'NOISE', 'SCREEN'], difficulty: 'medium' },
      { category: 'Words tied to DESIRE', words: ['WANT', 'NEED', 'CRAVE', 'ITCH'], difficulty: 'medium' },
      { category: 'Words that can precede DREAM', words: ['DAY', 'LUCID', 'PIPE', 'FEVER'], difficulty: 'hard' }
    ]
  },

  // ✅ 20 more (NYT-style inspired, original)

  {
    date: null,
    theme: 'Wordplay Starters',
    groups: [
      { category: 'Words that precede LIGHT', words: ['MOON', 'SUN', 'SPOT', 'FLASH'], difficulty: 'easy' },
      { category: 'Synonyms for LOOK', words: ['STARE', 'GAZE', 'PEEP', 'GLANCE'], difficulty: 'easy' },
      { category: 'Things you can DRAW', words: ['MAP', 'CARD', 'BREATH', 'BLANK'], difficulty: 'medium' },
      { category: 'Can be followed by LINE', words: ['PUNCH', 'BASE', 'TIME', 'PIPE'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Couples Logic',
    groups: [
      { category: 'Relationship milestones', words: ['FIRSTKISS', 'MEETUP', 'ENGAGE', 'WEDDING'], difficulty: 'medium' },
      { category: 'Ways to say “I’m into you”', words: ['FLIRT', 'TEASE', 'ADMIRE', 'PURSUE'], difficulty: 'medium' },
      { category: 'Things you keep PRIVATE', words: ['DIARY', 'SECRETS', 'DMs', 'PHOTOS'], difficulty: 'hard' },
      { category: 'Things that can be “SWEET”', words: ['TEXT', 'WINE', 'SONG', 'KISS'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'London-ish',
    groups: [
      { category: 'London transit words', words: ['TUBE', 'BUS', 'CAB', 'OYSTER'], difficulty: 'easy' },
      { category: 'Classic UK weather talk', words: ['RAIN', 'CLOUD', 'WIND', 'CHILL'], difficulty: 'easy' },
      { category: 'Pub order words', words: ['PINT', 'LAGER', 'CIDER', 'SNACKS'], difficulty: 'medium' },
      { category: 'Words that precede STREET', words: ['DOWN', 'HIGH', 'FLEET', 'BAKER'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Dubai-ish',
    groups: [
      { category: 'Desert trip items', words: ['SCARF', 'WATER', 'HAT', 'SHADE'], difficulty: 'easy' },
      { category: 'Luxury vibes', words: ['SUITE', 'YACHT', 'SPA', 'LOUNGE'], difficulty: 'medium' },
      { category: 'Heat words', words: ['SUN', 'BLAZE', 'WARMTH', 'SWEAT'], difficulty: 'medium' },
      { category: 'Words linked to SHOPPING', words: ['MALL', 'BOUTIQUE', 'BRAND', 'GOLD'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Foods & Feels',
    groups: [
      { category: 'Romantic dinner things', words: ['CANDLE', 'MENU', 'DESSERT', 'WINE'], difficulty: 'easy' },
      { category: 'Sweet treats', words: ['CAKE', 'CANDY', 'HONEY', 'SUGAR'], difficulty: 'easy' },
      { category: 'Words tied to HUNGER', words: ['CRAVE', 'URGE', 'ITCH', 'NEED'], difficulty: 'medium' },
      { category: 'Can be “BITTER”', words: ['COFFEE', 'TRUTH', 'END', 'TASTE'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Movie Night',
    groups: [
      { category: 'Streaming buttons', words: ['PLAY', 'PAUSE', 'SKIP', 'REWIND'], difficulty: 'easy' },
      { category: 'Snack foods', words: ['CHIPS', 'CANDY', 'PIZZA', 'NACHOS'], difficulty: 'easy' },
      { category: 'Genres', words: ['ROMCOM', 'HORROR', 'DRAMA', 'THRILLER'], difficulty: 'medium' },
      { category: 'Words that follow SCREEN', words: ['SHOT', 'TIME', 'PLAY', 'DOOR'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Double Meanings',
    groups: [
      { category: 'Can be “HIT”', words: ['SONG', 'PUNCH', 'BLOW', 'CLICK'], difficulty: 'medium' },
      { category: 'Can be “CRUSH”', words: ['SODA', 'LOVE', 'ICE', 'GRAPE'], difficulty: 'medium' },
      { category: 'Can be “RING”', words: ['BELL', 'PHONE', 'CIRCLE', 'BOX'], difficulty: 'hard' },
      { category: 'Can be “DATE”', words: ['FRUIT', 'PLAN', 'TIME', 'PERSON'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Flirty Clean',
    groups: [
      { category: 'Flirty gestures', words: ['WINK', 'SMILE', 'BLUSH', 'STARE'], difficulty: 'easy' },
      { category: 'Compliments', words: ['CUTE', 'HOT', 'GORGEOUS', 'STUNNING'], difficulty: 'medium' },
      { category: 'Things that can be “SULTRY”', words: ['VOICE', 'LOOK', 'DRESS', 'SONG'], difficulty: 'medium' },
      { category: 'Words tied to TEASING', words: ['TANTALIZE', 'FLIRT', 'BAIT', 'PROVOKE'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Games & Moves',
    groups: [
      { category: 'Card game words', words: ['DEAL', 'HAND', 'DECK', 'BLUFF'], difficulty: 'easy' },
      { category: 'Chess terms', words: ['KING', 'QUEEN', 'ROOK', 'PAWN'], difficulty: 'easy' },
      { category: 'Board game pieces', words: ['TOKEN', 'DICE', 'CARD', 'TILE'], difficulty: 'medium' },
      { category: 'Words that precede GAME', words: ['MIND', 'END', 'WAR', 'POWER'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Weekend Away',
    groups: [
      { category: 'Hotel items', words: ['TOWEL', 'ROBE', 'KEYCARD', 'MINIBAR'], difficulty: 'easy' },
      { category: 'Things you PACK', words: ['SHOES', 'DRESS', 'CHARGER', 'PERFUME'], difficulty: 'medium' },
      { category: 'Travel verbs', words: ['CHECKIN', 'BOARD', 'DRIVE', 'RETURN'], difficulty: 'medium' },
      { category: 'Words that follow ROOM', words: ['SERVICE', 'MATE', 'KEY', 'RATE'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Sound & Silence',
    groups: [
      { category: 'Quiet sounds', words: ['SIGH', 'HUSH', 'MURMUR', 'WHISPER'], difficulty: 'easy' },
      { category: 'Things that can be LOUD', words: ['MUSIC', 'LAUGH', 'THUNDER', 'CROWD'], difficulty: 'easy' },
      { category: 'Audio gear', words: ['MIC', 'SPEAKER', 'HEADPHONES', 'AMP'], difficulty: 'medium' },
      { category: 'Words with silent letters', words: ['HONEST', 'KNIGHT', 'WRONG', 'PSYCH'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Skyline Date',
    groups: [
      { category: 'Up high', words: ['ROOFTOP', 'TOWER', 'BALCONY', 'SKYBAR'], difficulty: 'easy' },
      { category: 'Night sky words', words: ['STARS', 'MOON', 'NOVA', 'COMET'], difficulty: 'medium' },
      { category: 'Sparkly things', words: ['GLITTER', 'DIAMOND', 'SHINE', 'SPARK'], difficulty: 'medium' },
      { category: 'Words that follow STAR', words: ['SIGN', 'POWER', 'FISH', 'STRUCK'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Text Thread',
    groups: [
      { category: 'Phone UI words', words: ['TYPING', 'DRAFT', 'READ', 'SENT'], difficulty: 'easy' },
      { category: 'Message reactions', words: ['HEART', 'LIKE', 'LAUGH', 'WOW'], difficulty: 'easy' },
      { category: 'Things you can SEND', words: ['GIF', 'PHOTO', 'VOICE', 'LINK'], difficulty: 'medium' },
      { category: 'Words tied to GHOSTING', words: ['SEEN', 'SILENCE', 'VANISH', 'IGNORE'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Connections Classics II',
    groups: [
      { category: 'Synonyms for HAPPY', words: ['GLAD', 'CHEERFUL', 'JOLLY', 'MERRY'], difficulty: 'easy' },
      { category: 'Synonyms for ANGRY', words: ['MAD', 'IRATE', 'FUMING', 'LIVID'], difficulty: 'medium' },
      { category: 'Things that are ROUND', words: ['BALL', 'RING', 'WHEEL', 'GLOBE'], difficulty: 'medium' },
      { category: 'Words with double letters', words: ['SHEEP', 'COFFEE', 'BALLOON', 'KISSED'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'After Hours (Spicy-Clean)',
    groups: [
      { category: 'Flirty verbs', words: ['TEASE', 'TEMPT', 'FLIRT', 'CHARM'], difficulty: 'easy' },
      { category: 'Mood setters', words: ['CANDLES', 'MUSIC', 'SCENT', 'LIGHTS'], difficulty: 'medium' },
      { category: 'Close contact', words: ['HOLD', 'PRESS', 'GRIND', 'TOUCH'], difficulty: 'medium' },
      { category: 'Things that can be “HOT”', words: ['TEA', 'GOSSIP', 'SPICE', 'WEATHER'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'One-Word Date Ideas',
    groups: [
      { category: 'Date activities', words: ['BOWLING', 'PICNIC', 'DANCING', 'HIKING'], difficulty: 'easy' },
      { category: 'Places for a date', words: ['MUSEUM', 'BEACH', 'ROOFTOP', 'CAFE'], difficulty: 'easy' },
      { category: 'Things you can TOAST', words: ['BREAD', 'LOVE', 'WINNER', 'MARRIAGE'], difficulty: 'medium' },
      { category: 'Words ending in -ING', words: ['HIKING', 'DANCING', 'KISSING', 'TEXTING'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Hidden Themes',
    groups: [
      { category: 'Contains a BODY part', words: ['HEART', 'THROAT', 'CHEEK', 'CHEST'], difficulty: 'medium' },
      { category: 'Contains a COLOR', words: ['REDWOOD', 'BLUISH', 'WHITEN', 'GREENE'], difficulty: 'hard' },
      { category: 'Starts with “S”', words: ['SWEET', 'SPARK', 'SMILE', 'SHINE'], difficulty: 'easy' },
      { category: 'Ends with “ER”', words: ['LOVER', 'SINGER', 'DRIVER', 'DANCER'], difficulty: 'medium' }
    ]
  },
  {
    date: null,
    theme: 'City Date Mashup',
    groups: [
      { category: 'London-coded words', words: ['TUBE', 'SOHO', 'OYSTER', 'BAKER'], difficulty: 'easy' },
      { category: 'Dubai-coded words', words: ['BURJ', 'PALM', 'MARINA', 'MALL'], difficulty: 'easy' },
      { category: 'Vacation luxuries', words: ['SPA', 'SUITE', 'YACHT', 'ROOFTOP'], difficulty: 'medium' },
      { category: 'Travel essentials', words: ['PASSPORT', 'TICKET', 'BAGGAGE', 'CHARGER'], difficulty: 'hard' }
    ]
  },
  {
    date: null,
    theme: 'Word Neighbors',
    groups: [
      { category: 'Can follow LOVE', words: ['LETTER', 'SONG', 'STORY', 'BITE'], difficulty: 'medium' },
      { category: 'Can follow HEART', words: ['BREAK', 'BEAT', 'THROB', 'EYES'], difficulty: 'hard' },
      { category: 'Can precede KISS', words: ['FIRST', 'GOODNIGHT', 'FRENCH', 'AIR'], difficulty: 'hard' },
      { category: 'Can precede TIME', words: ['GOOD', 'LONG', 'SHOW', 'PARTY'], difficulty: 'medium' }
    ]
  },
  {
    date: null,
    theme: 'NYT Pattern Party',
    groups: [
      { category: 'Words that are also NAMES', words: ['ROSE', 'MASON', 'GRACE', 'JACK'], difficulty: 'medium' },
      { category: 'Words you can “DROP”', words: ['HINT', 'NAME', 'BALL', 'LINE'], difficulty: 'medium' },
      { category: 'Words tied to “CUT”', words: ['SLICE', 'TRIM', 'EDIT', 'CHOP'], difficulty: 'easy' },
      { category: 'Words with two meanings', words: ['DATE', 'MATCH', 'RING', 'CRUSH'], difficulty: 'hard' }
    ]
  }
];

module.exports = connectionsPuzzles;
