const EntityTypes = {
  0x10: 'MonthName',
  0x11: 'Month',
  0x12: 'YearLeft',
  0x30: 'Day',
  0x60: 'DayOfWeek',
  0x61: 'DayOfWeekCZ',
  0x40: 'HoursDigit1',
  0x41: 'HoursDigit2',
  0x43: 'MinutesDigit1',
  0x44: 'MinutesDigit2',
  0x45: 'PMIcon',
  0x46: 'AMIcon',
  0x70: 'StepsProgress',
  0x71: 'StepsIcon',
  0x72: 'StepsLeft',
  0x73: 'StepsCentered',
  0x74: 'StepsRight',
  0x76: 'StepsGoal',
  0x80: 'HeartRateProgress',
  0x81: 'HeartRateIcon',
  0x82: 'HeartRateLeft',
  0x83: 'HeartRateCentered',
  0x84: 'HeartRateRight',
  0x90: 'CaloriesProgress',
  0x91: 'CaloriesIcon',
  0x92: 'CaloriesLeft',
  0x93: 'CaloriesCentered',
  0x94: 'CaloriesRight',
  0xa0: 'DistanceProgress',
  0xa1: 'DistanceIcon',
  0xa2: 'DistanceLeft',
  0xa3: 'DistanceCentered',
  0xa4: 'DistanceRight',
  0xb1: 'SleepIcon',
  0xb2: 'SleepHours',
  0xb4: 'SleepMinutes',
  0xd1: 'BatteryIcon',
  0xd4: 'BatteryPercentageRight',
  0xc0: 'ConnectionStatusIcon',
  0xf0: 'Icon',
};

export const EntitySpriteCounts = {
  Month: 11,
  MonthName: 12,
  Day: 11,
  HoursDigit1: 10,
  HoursDigit2: 10,
  MinutesDigit1: 10,
  MinutesDigit2: 10,
  DayOfWeek: 7,
  DayOfWeekCZ: 7,
  StepsProgress: 11,
  StepsLeft: 10,
  StepsCentered: 10,
  StepsRight: 10,
  StepsGoal: 10,
  HeartRateProgress: 11,
  HeartRateLeft: 10,
  HeartRateCentered: 10,
  HeartRateRight: 10,
  CaloriesProgress: 11,
  CaloriesLeft: 10,
  CaloriesCentered: 10,
  CaloriesRight: 10,
  DistanceProgress: 11,
  DistanceLeft: 11,
  DistanceCentered: 11,
  DistanceRight: 11,
  SleepHours: 10,
  SleepMinutes: 10,
  BatteryPercentageRight: 10,
};

const EntitiesOffset = 11;
const SpriteOffsetsOffset = 200;
const SpriteSizesOffset = 1200;
const SpriteDataOffset = 1700;

const decodeRle = (dv, offset, size) => {
  const result = new Uint16Array(1e6);
  let ptr = 0;
  for (let i = offset; i < offset + size; i += 3) {
    let color = dv.getUint16(i, true);
    const size = dv.getUint8(i + 2);
    result.fill(color, ptr, ptr + size);
    ptr += size;
  }
  return new DataView(result.buffer.slice(0, ptr * 2));
};

export const parseWatchface = data => {
  const parsed = { bg: null, entities: [], sprites: [] };
  const dv = new DataView(data);
  parsed.raw = dv;

  parsed.flag = dv.getUint8(5);

  const entityCount = dv.getUint8(1) - 1;
  const spriteCount = dv.getUint8(2);
  parsed.id = dv.getUint8(3);

  parsed.bg = {
    spriteWidth: dv.getUint8(8),
    spriteHeight: dv.getUint8(9),
    unk: dv.getUint8(10),
  };

  for (let i = 0; i < entityCount; i++) {
    const offset = EntitiesOffset + i * 6;
    const type = dv.getUint8(offset);
    parsed.entities.push({
      index: i,
      type: EntityTypes[type] || `Unknown${type.toString(16).padStart(2, '0')}`,
      x: dv.getUint8(offset + 1),
      y: dv.getUint8(offset + 2),
      width: dv.getUint8(offset + 3),
      height: dv.getUint8(offset + 4),
      sprite: dv.getUint8(offset + 5),
    });
  }

  for (let i = 0; i < spriteCount; i++) {
    const spriteOffset =
      SpriteDataOffset + dv.getUint32(SpriteOffsetsOffset + i * 4, true);
    const length = dv.getUint16(SpriteSizesOffset + i * 2, true);
    const type = dv
      .getUint16(spriteOffset)
      .toString(16)
      .padStart(4, '0');
    parsed.sprites.push({
      index: i,
      data:
        type === '0821'
          ? decodeRle(dv, spriteOffset + 2, length - 2)
          : new DataView(data.slice(spriteOffset, spriteOffset + length)),
      debug: { spriteOffset, length },
      type,
    });
  }

  return parsed;
};
