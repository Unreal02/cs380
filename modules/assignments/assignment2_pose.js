export const idle = {
  body: [0, 0, 0],
  head: [0, 0, 0],
  legLU: [0, 0, 0],
  legRU: [0, 0, 0],
  legLD: [0, 0, 0],
  legRD: [0, 0, 0],
  armLU: [0, 0, 14.04],
  armRU: [0, 0, -14.04],
  armLD: [0, 0, 0],
  armRD: [0, 0, 0],
  handL: [0, 0, 0],
  fingerL10: [0, 0, -15],
  fingerL11: [0, 0, 0],
  fingerL20: [0, 0, 0],
  fingerL21: [0, 0, 0],
  fingerL22: [0, 0, 0],
  fingerL30: [0, 0, 0],
  fingerL31: [0, 0, 0],
  fingerL32: [0, 0, 0],
  fingerL40: [0, 0, 0],
  fingerL41: [0, 0, 0],
  fingerL42: [0, 0, 0],
  fingerL50: [0, 0, 0],
  fingerL51: [0, 0, 0],
  fingerL52: [0, 0, 0],
  handR: [0, 0, 0],
  fingerR10: [0, 0, 15],
  fingerR11: [0, 0, 0],
  fingerR20: [0, 0, 0],
  fingerR21: [0, 0, 0],
  fingerR22: [0, 0, 0],
  fingerR30: [0, 0, 0],
  fingerR31: [0, 0, 0],
  fingerR32: [0, 0, 0],
  fingerR40: [0, 0, 0],
  fingerR41: [0, 0, 0],
  fingerR42: [0, 0, 0],
  fingerR50: [0, 0, 0],
  fingerR51: [0, 0, 0],
  fingerR52: [0, 0, 0],
};

export const hello = {
  ...idle,
  armLU: [-30, 0, 0],
  armLD: [-120, 0, 0],
  armRU: [0, 0, -90],
  armRD: [0, 0, -90],
  handL: [-30, 0, 0],
  fingerL30: [90, 0, 0],
  fingerL31: [90, 0, 0],
  fingerL40: [90, 0, 0],
  fingerL41: [90, 0, 0],
  fingerR30: [-90, 0, 0],
  fingerR31: [-90, 0, 0],
  fingerR40: [-90, 0, 0],
  fingerR41: [-90, 0, 0],
  legRU: [-90, 15, 0],
  legRD: [105, 0, 15],
};
