import {IonButton} from '@ionic/react';
import React from 'react';

interface buttonProps {
  handlerFunction: () => void;
  title: string;
  label: string;
  wordsLeft: number;
}

const SeedCounterButton = ({
  handlerFunction,
  label,
  wordsLeft,
}: buttonProps) => {
  return (
    <IonButton
      shape="round"
      color="primary"
      expand="block"
      className="h-auto my-4"
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
