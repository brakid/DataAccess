import React from 'react';

interface InputFieldProps<T> {
  value?: T,
  returnValue: (value: T) => void,
  handleError: (error: string) => void,
};

export const IntInputField = ({ value, returnValue, handleError }: InputFieldProps<number>) => {
  const updateValue = (value: string): void => {
    try {
      returnValue(parseInt(value));
    } catch (e) {
      handleError(JSON.stringify(e));
    }
  }

  return (
    <input type='text' value={ '' + (value || '') } onChange={ (e) => updateValue(e.target.value) } />
  );
};

export const greaterEqualZero = (returnValue: (v: number) => void): ((v: number) => void) => {
  return (v: number): void => {
    if (v >= 0) {
      returnValue(v);
    }
  };
};