import React from 'react';
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import SeedCounterButton from './SeedCounterButton';

test('Button should have a label of Continue', () => {
  render(
    <SeedCounterButton
      shape="round"
      color="primary"
      expand="block"
      classes="h-auto my-4"
      handlerFunction={() => {
        return;
      }}
      label="Continue"
      wordsLeft={0}
    />
  );
  expect(screen.getByText('Continue')).toBeVisible();
});

test('Button should have a label of 10 words left', () => {
  render(
    <SeedCounterButton
      shape="round"
      color="primary"
      expand="block"
      classes="h-auto my-4"
      handlerFunction={() => {
        return;
      }}
      label="Continue"
      wordsLeft={10}
    />
  );
  expect(screen.getByText('10 words left')).toBeVisible();
});
