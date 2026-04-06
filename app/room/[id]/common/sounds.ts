export const SOUNDS = {
  "Chime 1": "/sounds/chime1.mp3",
  "Chime 2": "/sounds/chime2.mp3",
  "Chime 3": "/sounds/chime3.mp3",
  "Chime 4": "/sounds/chime4.mp3",
  "Chime 5": "/sounds/chime5.mp3",
  "Chime 6": "/sounds/chime6.mp3",
  "Chime 7": "/sounds/chime7.mp3",
  "Chime 8": "/sounds/chime8.mp3",
  "Alarm 1": "/sounds/alarm1.mp3",
  "Alarm 2": "/sounds/alarm2.mp3",
  "Alarm 3": "/sounds/alarm3.mp3",
  "Alarm 4": "/sounds/alarm4.mp3",
} as const;

export type Sound = keyof typeof SOUNDS;