import React, { useRef, useEffect } from 'react';
import { PseudoBox, Flex, Box } from '@chakra-ui/core';

import { EntitySpriteCounts } from '../../utils/parser';

export const makeImage = (data, width, height) => {
  const buf = new Uint8ClampedArray(width * height * 4);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const pixelOffset = (x + y * width) * 2;
      const [r, g, b] = readPixel(data, pixelOffset);
      let bufOffset = (x + y * width) * 4;
      buf[bufOffset + 0] = r;
      buf[bufOffset + 1] = g;
      buf[bufOffset + 2] = b;
      buf[bufOffset + 3] = 0xff;
    }
  }
  return new ImageData(buf, width, height);
};

const normalize = (v, source, target) => (v / source) * target;

const readPixel = (dv, offset) => {
  if (offset + 1 >= dv.byteLength) {
    return [0xff, 0xff, 0xff];
  }
  const pixel = dv.getUint16(offset);
  return [
    normalize((pixel >> (5 + 6)) & 0x1f, 0x1f, 0xff),
    normalize((pixel >> 5) & 0x3f, 0x3f, 0xff),
    normalize(pixel & 0x1f, 0x1f, 0xff),
  ];
};

const renderWatchface = (flag, entities, sprites, ctx, time = 0) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 240, 240);

  if (flag === 0) {
    for (let i = 0; i < 10; i++) {
      const sprite = sprites[i];
      ctx.putImageData(makeImage(sprite.data, 240, 24), 0, 24 * i);
    }
  }

  for (const entity of entities) {
    const offset = time % (EntitySpriteCounts[entity.type] || 1);
    const sprite = sprites[entity.sprite + offset];
    let x = entity.x;
    if (entity.type.endsWith('Right')) {
      x -= entity.width + 2;
    }
    if (entity.type.endsWith('Centered')) {
      x -= entity.width / 2 + 1;
    }
    if (!sprite) {
      continue;
    }
    ctx.putImageData(
      makeImage(sprite.data, entity.width, entity.height),
      x,
      entity.y,
    );
  }
};

const Canvas = ({ flag, entities, sprites }) => {
  const ctx = useRef();

  useEffect(() => {
    if (!ctx.current) {
      return;
    }
    renderWatchface(flag, entities, sprites, ctx.current, 0);
  }, [flag, entities, sprites]);

  return (
    <Flex position="relative">
      <canvas
        width={240}
        height={240}
        ref={el => {
          if (!el) {
            return;
          }
          el.width = 240;
          el.height = 240;
          ctx.current = el.getContext('2d');
        }}
      />
      <Box pos="absolute" as="svg" width="100%" height="100%">
        {entities.map(entity => (
          <rect
            x={entity.x}
            y={entity.y}
            width={entity.width}
            height={entity.height}
            stroke="red"
            strokeWidth={2}
            fill="none"
            style={{ filter: 'invert(100%)' }}
          />
        ))}
      </Box>
    </Flex>
  );
};

export default Canvas;
