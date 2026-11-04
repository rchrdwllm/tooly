#!/usr/bin/env node
import {render} from 'ink';
import {InkPictureProvider} from 'ink-picture';
import {App} from './app.js';

render(
  <InkPictureProvider>
    <App />
  </InkPictureProvider>,
);
