import { useTranslation } from "react-i18next";
import { MarkModel } from "../models/MarkModel";
import { SubjectModel } from "../models/SubjectModel";
import { calculateAverage, formatDate, getMarkTypeLabel } from "../services/MarkServices";
import { MarkItem } from "./MarkItem";

export const GradesDialog: React.FC<{
  show: boolean;
  onHide: () => void;
  subject: SubjectModel;
  marks: MarkModel[];
  languageCode: string;
}> = ({ show, onHide, subject, marks, languageCode }) => {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onHide}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              {languageCode === 'ru' ? subject.nameRu : subject.nameKg}
            </h3>
            <button onClick={onHide} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}>×</button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>{t('teacher')}:</strong> {marks[0]?.teacher?.lastName} {marks[0]?.teacher?.firstName}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <strong>{t('average_grade')}:</strong> {calculateAverage(marks).toFixed(2)}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Дата</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>{t('grade')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>{t('type')}</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>{t('description')}</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{mark.created_at ? formatDate(mark.created_at) : '-'}</td>
                  <td style={{ padding: '12px' }}><MarkItem mark={mark} language="ru" /></td>
                  <td style={{ padding: '12px' }}>{getMarkTypeLabel(t, mark.mark_type)}</td>
                  <td style={{ padding: '12px' }}>{mark.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #e0e0e0', textAlign: 'right' }}>
          <button onClick={onHide} style={{
            padding: '8px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
};