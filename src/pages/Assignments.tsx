import { useState, useEffect } from 'react';
import { getDayName, getTerm } from '../services/CommonServices';
import { ScheduleModel } from '../models/ScheduleModel';
import { useAuth } from '../hooks/useAuth';
import { getStudentHomeWorks, groupSchedulesByDate, mergeScheduleData } from '../services/MarkServices';
import { useTranslation } from 'react-i18next';

function Assignments(): JSX.Element {
  const [term, setTerm] = useState<number>(getTerm(new Date()));
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [languageCode] = useState<string>('ru'); // or get from language context
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { authData } = useAuth();
  const { t } = useTranslation();

  const fetchHomeworks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentHomeWorks({
        type: authData.type,
        token: authData.token,
        term,
      });
      setSchedules(data);
    } catch (e: any) {
      setError(e.message || "Ошибка загрузки заданий");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, [term]);

  const buildGroupedSchedules = () => {
    if (schedules.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}>Нет данных</div>;
    }

    const list = mergeScheduleData(schedules);
    const groupedSchedules = groupSchedulesByDate(list);
    const dates = Object.keys(groupedSchedules);

    if (dates.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}>Нет данных</div>;
    }

    return (
      <div>
        {dates.map((day, index) => {
          const daySchedules = groupedSchedules[day];
          const [dayStr, monthStr, yearStr] = day.split('.');

          return (
            <div key={index} style={{ marginBottom: '16px' }}>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontWeight: 'bold', margin: 0, fontSize: '18px' }}>
                  {getDayName(dayStr, monthStr, yearStr, languageCode)}
                </h3>
              </div>

              {daySchedules.map((schedule, idx) => (
                <div key={idx} style={{ padding: '8px' }}>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'rgba(0, 153, 217, 0.12)',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Header with subject and time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div 
                          style={{ 
                            fontWeight: schedule.subject ? 'bold' : 'normal', 
                            fontSize: '16px', 
                            marginBottom: '8px' 
                          }}
                        >
                          {schedule.subject
                            ? languageCode === 'ky'
                              ? schedule.subject.nameKg
                              : schedule.subject.nameRu
                            : 'Нет урока'}
                        </div>
                        {schedule.lastTask && (
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {schedule.lastTask.name}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'right' }}>
                        {schedule.startTime && <div>{schedule.startTime}</div>}
                        {schedule.endTime && <div>{schedule.endTime}</div>}
                      </div>
                    </div>

                    {/* Teacher info */}
                    {schedule.teacher && (
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            color: '#7239EA',
                            fontSize: '16px',
                          }}
                        >
                          👤
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {`${schedule.teacher.lastName} ${schedule.teacher.firstName}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', overflowY: 'auto', padding: '16px', backgroundColor: '#f8f9fa' }}>
      {/* Header with title and term selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Задания</h2>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {term} {t('quarter')} ▼
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 100,
                minWidth: '140px',
              }}
            >
              {[1, 2, 3, 4].map((y) => (
                <div
                  key={y}
                  onClick={() => {
                    setTerm(y);
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: term === y ? '#f0f0f0' : 'white',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = term === y ? '#f0f0f0' : 'white')
                  }
                >
                  {y} {t('quarter')} 
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
        )}
        {error && (
          <div style={{ color: '#dc3545', padding: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        {!loading && !error && buildGroupedSchedules()}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Assignments;


