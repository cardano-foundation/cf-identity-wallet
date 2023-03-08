import {IonButton} from '@ionic/react';
import React from 'react';

interface buttonProps {
  handlerFunction: () => void;
  shape: string;
  color: string;
  expand: string;
  classes: string;
  label: string;
  wordsLeft: number;
}

type Shape = 'round' | undefined;
type Expand = 'block' | 'full' | undefined;

const SeedCounterButton = ({
  handlerFunction,
  shape,
  color,
  expand,
  classes,
  label,
  wordsLeft,
}: buttonProps) => {
  return (
    <IonButton
      shape={shape as Shape}
      color={color}
      expand={expand as Expand}
      className={classes}
      onClick={
        handlerFunction
          ? () => handlerFunction()
          : () => {
              return;
            }
      }
      disabled={wordsLeft !== 0}>
      {wordsLeft > 0
        ? wordsLeft + ` word${wordsLeft > 1 ? 's' : ''} left`
        : label}
    </IonButton>
  );
};

export default SeedCounterButton;
