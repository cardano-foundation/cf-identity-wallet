// This is a reference for building Tailwind Storybook.
// Do not delete.

import React from 'react';
import './storybookReference.css';

interface StorybookReferenceProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const StorybookReference = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: StorybookReferenceProps) => {
  const mode = primary
    ? 'storybook-button--primary'
    : 'storybook-button--secondary';
  return <button className="daisy-btn daisy-btn-success">Success</button>;
};
