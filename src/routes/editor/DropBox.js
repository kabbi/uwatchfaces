import React, { useState } from 'react';
import { Flex, Link, Heading, Text } from '@chakra-ui/core';

const fetchData = async url =>
  fetch(url).then(response => response.arrayBuffer());

const DropBox = ({ onDrop }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Flex
      margin={20}
      border="5px dashed black"
      borderRadius={10}
      justifyContent="center"
      alignItems="center"
      flex="1"
      background={hovered ? 'tomato' : null}
      onDragOver={event => {
        event.stopPropagation();
        event.preventDefault();
        setHovered(true);
      }}
      onDragOut={event => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onDragLeave={event => {
        setHovered(false);
      }}
      onDrop={event => {
        event.stopPropagation();
        event.preventDefault();
        const reader = new FileReader();
        const [file] = event.dataTransfer.files;
        reader.onload = () => onDrop({ file, data: reader.result });
        reader.readAsArrayBuffer(file);
        setHovered(false);
      }}
    >
      <Flex alignItems="center" direction="column" p={20}>
        <Heading textAlign="center">
          Drop watchface .bin files here to get started
        </Heading>
        <Text>
          or{' '}
          <Link
            color="teal.500"
            onClick={() => {
              alert('Not yet');
            }}
          >
            create new
          </Link>
          ,{' '}
          <Link
            color="teal.500"
            onClick={async () => {
              const data = await fetchData('/data/26.bin');
              onDrop({
                file: {
                  name: 'demo.bin',
                  size: 2424,
                },
                data,
              });
            }}
          >
            load demo file
          </Link>
          ,{' '}
          <Link color="teal.500" href="https://xkcd.com" isExternal>
            read some xkcd
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default DropBox;
