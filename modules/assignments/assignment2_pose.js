export const idle = {
  camera: {
    position: [0, 0, 20],
    rotation: [0, 0, 0],
  },
  position: {
    body: [0, 0, 0],
    legLD: [0.3, -4, 0],
  },
  rotation: {
    body: [0, 0, 0],
    head: [0, 0, 0],
    legLU: [0, 0, 0],
    legRU: [0, 0, 0],
    legLD: [0, 0, 0],
    legRD: [0, 0, 0],
    footL: [0, 0, 0],
    footR: [0, 0, 0],
    armLU: [0, 0, 14.04],
    armRU: [0, 0, -14.04],
    armLD: [0, 0, 0],
    armRD: [0, 0, 0],
    handL: [0, 90, 0],
    handR: [0, -90, 0],
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
  },
};

export const pose1 = {
  camera: {
    position: [0, 0, 25],
    rotation: [0, 0, 0],
  },
  position: idle.position,
  rotation: {
    ...idle.rotation,
    armLU: [-30, 0, 0],
    armLD: [-120, 0, 0],
    armRU: [0, 0, -90],
    armRD: [0, -180, -90],
    handL: [-30, 0, 0],
    handR: [0, 0, 0],
    fingerL10: [90, 0, -45],
    fingerL11: [90, 0, 0],
    fingerL30: [90, 0, 0],
    fingerL31: [90, 0, 0],
    fingerL40: [90, 0, 0],
    fingerL41: [90, 0, 0],
    fingerR10: [90, 0, 45],
    fingerR11: [90, 0, 0],
    fingerR30: [90, 0, 0],
    fingerR31: [90, 0, 0],
    fingerR40: [90, 0, 0],
    fingerR41: [90, 0, 0],
    legRU: [-90, 15, 0],
    legRD: [105, 0, 15],
    footR: [45, 0, 0],
  },
};

export const pose2 = {
  camera: {
    position: [-12, 2, 16],
    rotation: [-5.711, -36.87, 0],
  },
  position: idle.position,
  rotation: {
    ...idle.rotation,
    body: [60, 0, 0],
    armLU: [-30, 0, 15],
    armLD: [-120, 0, -30],
    armRU: [0, 0, -75],
    armRD: [0, -180, -105],
    handL: [-30, -15, -15],
    handR: [0, 0, 0],
    fingerL10: [90, 0, -45],
    fingerL11: [90, 0, 0],
    fingerL30: [90, 0, 0],
    fingerL31: [90, 0, 0],
    fingerL40: [90, 0, 0],
    fingerL41: [90, 0, 0],
    fingerR10: [90, 0, 45],
    fingerR11: [90, 0, 0],
    fingerR30: [90, 0, 0],
    fingerR31: [90, 0, 0],
    fingerR40: [90, 0, 0],
    fingerR41: [90, 0, 0],
    legLU: [-90, 0, 0],
    legRU: [-60, 0, 0],
    legLD: [45, 0, 0],
    legRD: [90, 0, 0],
    footL: [-45, 0, 0],
    footR: [-45, 0, 0],
  },
};

export const jumpReady = {
  camera: {
    position: [14.14, 0, 14.14],
    rotation: [0, 45, 0],
  },
  position: idle.position,
  rotation: {
    ...idle.rotation,
    body: [60, 0, 0],
    armLD: [-135, 0, 14.04],
    armRD: [-135, 0, -14.04],
    fingerL10: [90, 0, -90],
    fingerL11: [90, 0, 0],
    fingerL20: [90, 0, 0],
    fingerL21: [90, 0, 0],
    fingerL22: [90, 0, 0],
    fingerL30: [90, 0, 0],
    fingerL31: [90, 0, 0],
    fingerL32: [90, 0, 0],
    fingerL40: [90, 0, 0],
    fingerL41: [90, 0, 0],
    fingerL42: [90, 0, 0],
    fingerL50: [90, 0, 0],
    fingerL51: [90, 0, 0],
    fingerL52: [90, 0, 0],
    fingerR10: [90, 0, 90],
    fingerR11: [90, 0, 0],
    fingerR20: [90, 0, 0],
    fingerR21: [90, 0, 0],
    fingerR22: [90, 0, 0],
    fingerR30: [90, 0, 0],
    fingerR31: [90, 0, 0],
    fingerR32: [90, 0, 0],
    fingerR40: [90, 0, 0],
    fingerR41: [90, 0, 0],
    fingerR42: [90, 0, 0],
    fingerR50: [90, 0, 0],
    fingerR51: [90, 0, 0],
    fingerR52: [90, 0, 0],
    legLU: [-90, 0, 0],
    legRU: [-60, 0, 0],
    legLD: [45, 0, 0],
    legRD: [90, 0, 0],
    footL: [-45, 0, 0],
    footR: [-45, 0, 0],
  },
};

export const jump = {
  camera: {
    position: [28.28, 0, 28.28],
    rotation: [5, 45, 0],
  },
  position: {
    ...idle.position,
    legLD: [0.3, 1, 0],
  },
  rotation: {
    ...idle.rotation,
    armLU: [-180, 0, 0],
    armRU: [-180, 0, 0],
    handL: [0, 90, 0],
    handR: [0, -90, 0],
    fingerL10: [90, 0, -90],
    fingerL11: [90, 0, 0],
    fingerL20: [90, 0, 0],
    fingerL21: [90, 0, 0],
    fingerL22: [90, 0, 0],
    fingerL30: [90, 0, 0],
    fingerL31: [90, 0, 0],
    fingerL32: [90, 0, 0],
    fingerL40: [90, 0, 0],
    fingerL41: [90, 0, 0],
    fingerL42: [90, 0, 0],
    fingerL50: [90, 0, 0],
    fingerL51: [90, 0, 0],
    fingerL52: [90, 0, 0],
    fingerR10: [90, 0, 90],
    fingerR11: [90, 0, 0],
    fingerR20: [90, 0, 0],
    fingerR21: [90, 0, 0],
    fingerR22: [90, 0, 0],
    fingerR30: [90, 0, 0],
    fingerR31: [90, 0, 0],
    fingerR32: [90, 0, 0],
    fingerR40: [90, 0, 0],
    fingerR41: [90, 0, 0],
    fingerR42: [90, 0, 0],
    fingerR50: [90, 0, 0],
    fingerR51: [90, 0, 0],
    fingerR52: [90, 0, 0],
    footL: [45, 0, 0],
    footR: [45, 0, 0],
  },
};

export const cheese = {
  camera: idle.camera,
  position: idle.position,
  rotation: {
    ...idle.rotation,
    body: [0, 0, -15],
    legRU: [0, 0, -15],
    legRD: [90, 0, 0],
    armLD: [0, 0, 60],
    armRU: [0, 0, -90],
    armRD: [0, -180, -120],
    handL: [0, 180, 0],
    handR: [0, 0, 0],
    fingerR10: [90, 0, 90],
    fingerR11: [90, 0, 0],
    fingerR20: [0, 0, 30],
    fingerR21: [0, 0, 0],
    fingerR22: [0, 0, 0],
    fingerR30: [0, 0, 0],
    fingerR31: [0, 0, 0],
    fingerR32: [0, 0, 0],
    fingerR40: [90, 0, 0],
    fingerR41: [90, 0, 0],
    fingerR42: [90, 0, 0],
    fingerR50: [90, 0, 0],
    fingerR51: [90, 0, 0],
    fingerR52: [90, 0, 0],
    footR: [45, 0, 0],
  },
};
