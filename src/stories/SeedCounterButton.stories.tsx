import React from 'react';
import {ComponentStory, ComponentMeta} from '@storybook/react';
import SeedCounterButton from '../components/custom/SeedCounterButton';

export default {
  title: 'UI/Controls/SeedCounterButton',
  component: SeedCounterButton,
  argTypes: {
    backgroundColor: {control: 'color'},
  },
} as ComponentMeta<typeof SeedCounterButton>;

const Template: ComponentStory<typeof SeedCounterButton> = (args) => (
  <SeedCounterButton {...args} />
);

export const Default = Template.bind({});

Default.args = {
  handlerFunction: function (): void {
    throw new Error('Function not implemented.');
  },
  shape: 'round',
  color: 'primary',
  expand: 'block',
  classes: 'h-auto my-4',
  label: 'Continue',
  wordsLeft: 0,
};
