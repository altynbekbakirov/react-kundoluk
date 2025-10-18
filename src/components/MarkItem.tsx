import { MarkModel } from "../models/MarkModel";
import { getMarkColor } from "../services/MarkServices";

export const MarkItem = ({ mark, language }: { mark: MarkModel, language: string }) => {
  const displayValue = mark.absent
    ? language == 'ru' ? 'нб' : 'кж'
    : (mark.custom_mark || mark.mark || '');
  const bgColor = getMarkColor(mark.mark, mark.absent);

  return (
    <div
      style={{
        display: 'inline-block',
        minWidth: '32px',
        height: '32px',
        borderRadius: '4px',
        backgroundColor: bgColor,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: '32px',
        fontSize: '14px',
        padding: '0 6px',
      }}
    >
      {displayValue}
    </div>
  );
};