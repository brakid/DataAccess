import React from 'react';
import { Record } from './utils/types';

interface RecordViewProps {
  record: Record
};

const RecordView = ({ record }: RecordViewProps) => {
  
  return (
    <span>
      Age: { record.age }, Height: { record.height }, Weight: { record.weight }
    </span>
  );
}

export default RecordView;