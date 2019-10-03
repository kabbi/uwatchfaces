import React, { useReducer } from 'react';
import { Flex, Code, Link, Box } from '@chakra-ui/core';

import Canvas, { makeImage } from './Canvas';
import DropBox from './DropBox';

import { parseWatchface, EntitySpriteCounts } from '../../utils/parser';

const InitialState = {
  loaded: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'load': {
      const parsed = parseWatchface(action.drop.data);
      const spriteSets = {};
      for (const entity of parsed.entities) {
        if (spriteSets[entity.sprite]) {
          continue;
        }
        const canvas = document.createElement('canvas');
        canvas.width = entity.width;
        canvas.height = entity.height;
        const ctx = canvas.getContext('2d');
        spriteSets[entity.sprite] = parsed.sprites
          .slice(entity.sprite, entity.sprite + EntitySpriteCounts[entity.type])
          .map(sprite => {
            const img = makeImage(sprite.data, entity.width, entity.height);
            ctx.putImageData(img, 0, 0);
            return {
              ...sprite,
              url: canvas.toDataURL(),
              width: entity.width,
              height: entity.height,
            };
          });
      }
      return {
        meta: {
          fileName: action.drop.file.name,
          size: action.drop.file.size,
          id: parsed.id,
        },
        flag: parsed.flag,
        entities: parsed.entities,
        sprites: parsed.sprites,
        loaded: true,
        spriteSets,
      };
    }
    default:
      return state;
  }
};

const EditorApp = () => {
  const [state, dispatch] = useReducer(reducer, InitialState);
  if (!state.loaded) {
    return <DropBox onDrop={drop => dispatch({ type: 'load', drop })} />;
  }
  return (
    <Flex width={['100%', '800px']} mx="auto" bg="gray.100" direction="column">
      <Flex>
        <Canvas
          flag={state.flag}
          entities={state.entities}
          sprites={state.sprites}
        />
        <Code flex="1" ml={2} borderBottom="2px dashed black">
          File:{' '}
          <b>
            {state.meta.fileName} (id: {state.meta.id})
          </b>
          <br />
          Entities: <b>{state.entities.length}</b>,{' '}
          <Link
            color="teal.500"
            onClick={() => {
              alert('Not yet');
            }}
          >
            add new
          </Link>
          <br />
          Sprites: <b>{state.sprites.length}</b>,{' '}
          <Link
            color="teal.500"
            onClick={() => {
              alert('Not yet');
            }}
          >
            add new
          </Link>
          <br />
          <Link
            color="teal.500"
            onClick={() => {
              alert('Not yet');
            }}
          >
            Download
          </Link>
        </Code>
      </Flex>
      <Flex
        flex="1"
        flexWrap="wrap"
        overflowY="scroll"
        alignItems="flex-start"
        pt={1}
      >
        {Object.entries(state.spriteSets).map(([name, sprites]) =>
          sprites.map(sprite => (
            <Box key={sprite.index} background="black" p={3} mr={1} mb={1}>
              <img src={sprite.url} alt={`Sprite ${sprite.index}`} />
            </Box>
          )),
        )}
      </Flex>
    </Flex>
  );
};

export default EditorApp;
