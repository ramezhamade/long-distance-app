// Romantic, cute, and spicy words for Wordle (4-letter words removed)
const wordleWords = [
  // Sweet & Romantic
  'HEART', 'LOVED', 'SWEET', 'MARRY', 'BLISS', 'CHARM', 'TRUST',
  'FLAME', 'ROSES', 'SMILE', 'DREAM', 'HONEY', 'ANGEL', 'CUPID',
  'SWOON', 'CRUSH', 'HAPPY', 'LAUGH', 'GRACE', 'PEACE', 'MAGIC',
  'LIGHT', 'STARS', 'LOYAL', 'ADORE', 'SPARK', 'PRIDE',

  // Communication & Connection
  'PHONE', 'TEXTS', 'VIDEO', 'VISIT', 'DATES',
  'CALLS', 'CHATS', 'FLIRT', 'TEASE', 'WINKS',

  // Physical & Intimate
  'TOUCH', 'CHEEK', 'HANDS', 'VOICE', 'CHEST',
  'WAIST', 'THIGH', 'CURVE', 

  // Activities & Places
  'DANCE', 'MUSIC', 'BEACH',
  'NIGHT', 'PARIS', 'HOTEL', 'PARTY', 'DRUNK', 'SHOTS',

  // Wedding & Commitment
  'PHOTO', 'RINGS', 'BRIDE', 'GROOM', 'UNITY',
  'ALTAR', 'AISLE', 'DRESS',

  // 🔥 Spicy
  'HORNY', 'DIRTY', 'SPICY', 'KINKY', 'NAKED', 'STRIP',
  'MOANS', 'PANTS', 'SHIRT', 'SKIRT', 'TIGHT',
  'ROUGH', 'TEMPT', 'CRAVE', 'STEAM', 'SWEAT',
  'PRESS', 'GRIND', 'THRUST', 'TRACE', 'LUSTY',
  'BITEY', 'FEELS', 'BODYS', 'FETISH',
  'FONDLE', 'CUDDLE', 'NIPPLE', 'LICKED', 'SUCKS',
  'TEASED', 'TICKLE', 'RUBBED', 'PILLOW', 'BLOWN',
  'SQUIRT', 'TONGUE', 'BUBBLY',

  // Time & Moments
  'TODAY', 'LATER', 'EARLY', 'SLEEP', 'AWAKE', 'SNEAK',

  // Common Valid Words
  'ABOUT', 'AFTER', 'AGAIN', 'ALONE', 'ALONG', 'ANGRY',
  'APART', 'BEGAN', 'BEING', 'BELOW', 'BOARD',
  'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BRING',
  'BROWN', 'BUILD', 'BUILT', 'CARRY', 'CATCH',
  'CAUSE', 'CHAIR', 'CHEAP', 'CHECK', 'CHIEF',
  'CHOSE', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR',
  'CLOCK', 'CLOSE', 'CLOUD', 'COULD', 'COUNT',
  'COURT', 'COVER', 'CRAFT', 'CRAZY', 'CREAM',
  'CROSS', 'CROWD', 'CROWN', 'DAILY', 'DEALT',
  'DOUBT', 'DOZEN', 'DRAMA', 'DRANK', 'DRAWN',
  'DRINK', 'DRIVE', 'EARTH', 'EIGHT', 'EMPTY',
  'ENJOY', 'ENTER', 'EQUAL', 'ERROR', 'EVENT',
  'EVERY', 'EXACT', 'EXTRA', 'FAITH', 'FALSE',
  'FAULT', 'FIELD', 'FIGHT', 'FINAL', 'FIRST',
  'FLASH', 'FLOOR', 'FOCUS', 'FORCE', 'FOUND',
  'FRAME', 'FRESH', 'FRONT', 'FRUIT', 'FUNNY',
  'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING',
  'GRADE', 'GRAND', 'GRASS', 'GREAT', 'GREEN',
  'GROUP', 'GROWN', 'GUESS', 'GUIDE', 'HEAVY',
  'HORSE', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE',
  'INNER', 'ISSUE', 'JOINT', 'JUDGE', 'KNOWN',
  'LABEL', 'LARGE', 'LAYER', 'LEARN', 'LEAVE',
  'LEGAL', 'LEVEL', 'LIMIT', 'LOCAL', 'LOGIC',
  'LOOSE', 'LUCKY', 'LUNCH', 'MAJOR',
  'MAKER', 'MATCH', 'MAYBE', 'MEDIA', 'METAL',
  'MIGHT', 'MODEL', 'MONEY', 'MONTH', 'MORAL',
  'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVIE',
  'NEEDS', 'NEVER', 'NORTH', 'NOVEL', 'OCEAN',
  'OFFER', 'ORDER', 'OTHER', 'OWNER', 'PANEL',
  'PAPER', 'PIECE', 'PILOT', 'PLACE', 'PLAIN',
  'PLANE', 'PLANT', 'POINT', 'POWER', 'PRIME',
  'PRINT', 'PROOF', 'PROUD', 'QUEEN', 'QUIET',
  'RADIO', 'RANGE', 'RATIO', 'READY', 'RIGHT',
  'RIVER', 'ROUND', 'ROYAL', 'SCALE', 'SCENE',
  'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN',
  'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHIFT',
  'SHINE', 'SHOCK', 'SHORT', 'SIGHT', 'SINCE',
  'SKILL', 'SLIDE', 'SMALL', 'SMART', 'SMOKE',
  'SOLID', 'SORRY', 'SOUND', 'SPACE', 'SPEAK',
  'SPEED', 'SPEND', 'SPORT', 'STAFF', 'STAGE',
  'STAND', 'START', 'STATE', 'STEEL', 'STICK',
  'STILL', 'STONE', 'STORE', 'STORY', 'STUDY',
  'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'TABLE',
  'TAKEN', 'TASTE', 'TEACH', 'THANK', 'THERE',
  'THINK', 'THIRD', 'THOSE', 'TIMES', 'TITLE',
  'TOPIC', 'TOTAL', 'TOUGH', 'TRACK', 'TRADE',
  'TRAIN', 'TRIAL', 'TRUST', 'TRUTH', 'UNDER',
  'UNION', 'UNTIL', 'UPPER', 'USAGE', 'USUAL',
  'VALUE', 'VITAL', 'WATCH', 'WATER', 'WHEEL',
  'WHILE', 'WHITE', 'WHOLE', 'WORLD', 'WORRY',
  'WORTH', 'WOULD', 'WRITE', 'YIELD', 'YOUNG',
  'YOURS'
];

module.exports = wordleWords;
