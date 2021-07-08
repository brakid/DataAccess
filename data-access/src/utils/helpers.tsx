import { BigNumber } from 'ethers';

export const LARGE_ALLOWANCE = BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

export const showError = (error: string | undefined): JSX.Element | null => {
  if (!!!error || error.length === 0) {
    return (null);
  }

  return (
    <div className='alert alert-danger' role='alert'>
      <b>Error: </b>
      { error }
    </div>
  );
}

export const showConfirmation = (confirmation: string | undefined): JSX.Element | null => {
  if (!!!confirmation || confirmation.length === 0) {
    return (null);
  }

  return (
    <div className='alert alert-success' role='alert'>
      <b>Confirmation: </b>
      { confirmation }
    </div>
  );
}

export const get = (value: string | undefined): string => {
  if (!!!value) {
    throw Error('No value present');
  }
  return value;
}