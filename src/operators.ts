export const Operators = {
  SJ: "SJ",
  MTR: "Mälartåg",
  TiB: "Tåg i Bergslagen",
  UL: "UL",
  VL: "VL",
  SL: "SL",
  LT: "LT",
  FlixBus: "FlixBus",
  FlixTrain: "FlixTrain",
  Vy: "Vy",
  VR: "VR",
} as const;
export type Operators = keyof typeof Operators;