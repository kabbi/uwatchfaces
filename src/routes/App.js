import React from 'react';
import { ThemeProvider } from '@chakra-ui/core';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

import EditorApp from './editor/EditorApp';
import theme from '../utils/theme';

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <Route path="/editor" component={EditorApp} />
      <Route path="/" render={() => <Redirect to="/editor" />} />
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
