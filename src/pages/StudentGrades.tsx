import { useEffect, useRef, useState } from "react";
import { ScheduleModel } from "../models/ScheduleModel";
import { calculateAverage, formatDate, getMarkColor, getMarkTypeLabel, getStudentTermMarks, groupAndSortGrades } from "../services/MarkServices";
import { SubjectModel } from "../models/SubjectModel";
import { MarkModel } from "../models/MarkModel";
import { useAuth } from "../hooks/useAuth";

const MarkContainer: React.FC<{ mark: MarkModel }> = ({ mark }) => {
  const displayValue = mark.absent ? 'н' : (mark.customMark || mark.mark || '');
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
        padding: '0 6px'
      }}
    >
      {displayValue}
    </div>
  );
};

const GradesDialog: React.FC<{
  show: boolean;
  onHide: () => void;
  subject: SubjectModel;
  marks: MarkModel[];
  languageCode: string;
}> = ({ show, onHide, subject, marks, languageCode }) => {
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
            <strong>Учитель:</strong> {marks[0]?.teacher?.lastName} {marks[0]?.teacher?.firstName}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <strong>Средний балл:</strong> {calculateAverage(marks).toFixed(2)}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Дата</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Оценка</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Тип</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Описание</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{mark.createdAt ? formatDate(mark.createdAt.toISOString()) : '-'}</td>
                  <td style={{ padding: '12px' }}><MarkContainer mark={mark} /></td>
                  <td style={{ padding: '12px' }}>{getMarkTypeLabel(mark.markType)}</td>
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
          }}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

function StudentGrades(): JSX.Element {
  const [term, setTerm] = useState<number>(1);
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showUpButton, setShowUpButton] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("topic");
  const [languageCode] = useState<string>('ru');
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectModel | null>(null);
  const [selectedMarks, setSelectedMarks] = useState<MarkModel[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { authData } = useAuth();

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentTermMarks({
        type: authData.type,
        token: authData.token,
        term,
      });
      setSchedules(data);
    } catch (e: any) {
      setError(e.message || "Error fetching grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [term]);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowUpButton(scrollRef.current.scrollTop > 300);
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getMarksBySubject = () => {
    const map = new Map<SubjectModel, MarkModel[]>();
    schedules.forEach(s => {
      if (!s.subject || !s.marks) return;
      if (!map.has(s.subject)) map.set(s.subject, []);
      s.marks.forEach(mark => {
        map.get(s.subject!)?.push({ ...mark, teacher: s.teacher });
      });
    });
    return Array.from(map.entries());
  };

  const handleSubjectClick = (subject: SubjectModel, marks: MarkModel[]) => {
    setSelectedSubject(subject);
    setSelectedMarks(marks);
    setShowDialog(true);
  };

  const buildTermContent = () => {
    const subjectMarks = getMarksBySubject();

    if (subjectMarks.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}>Нет данных</div>;
    }

    return (
      <div style={{ padding: '0' }}>
        {subjectMarks.map(([subject, marks], idx) => {
          const average = calculateAverage(marks);
          const firstLetter = languageCode === 'ru'
            ? subject.nameRu?.substring(0, 1)
            : subject.nameKg?.substring(0, 1);

          return (
            <div key={idx}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '16px 0',
                  cursor: 'pointer'
                }}
                onClick={() => handleSubjectClick(subject, marks)}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(33, 150, 243, 0.6)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    marginRight: '12px',
                    flexShrink: 0
                  }}
                >
                  {firstLetter}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {languageCode === 'ru' ? subject.nameRu : subject.nameKg}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {marks[0]?.teacher?.lastName} {marks[0]?.teacher?.firstName}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', flexShrink: 0 }}>
                      {average > 0 ? average.toFixed(2) : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {marks.map((mark, markIdx) => (
                      <MarkContainer key={markIdx} mark={mark} />
                    ))}
                  </div>
                </div>
              </div>
              {idx < subjectMarks.length - 1 && <hr style={{ margin: '0', border: 'none', borderTop: '1px solid #e0e0e0' }} />}
            </div>
          );
        })}
      </div>
    );
  };

  const buildDateContent = () => {
    const dateGroups = groupAndSortGrades(schedules);
    const dateEntries = Array.from(dateGroups.entries());

    if (dateEntries.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}>Нет данных</div>;
    }

    return (
      <div style={{ padding: '0' }}>
        {dateEntries.map(([date, marks], idx) => (
          <div key={idx}>
            <div style={{ padding: '16px 0' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>
                {date}
              </div>

              {marks.map((mark, markIdx) => {
                const firstLetter = languageCode === 'ru'
                  ? mark.subject?.nameRu?.substring(0, 1)
                  : mark.subject?.nameKg?.substring(0, 1);

                return (
                  <div key={markIdx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(33, 150, 243, 0.6)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        marginRight: '12px',
                        flexShrink: 0
                      }}
                    >
                      {firstLetter}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                          <div>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                              {languageCode === 'ru' ? mark.subject?.nameRu : mark.subject?.nameKg}
                            </span>
                            <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                              ({getMarkTypeLabel(mark.markType)})
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {mark.teacher?.lastName} {mark.teacher?.firstName}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <MarkContainer mark={mark} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {idx < dateEntries.length - 1 && <hr style={{ margin: '0', border: 'none', borderTop: '1px solid #e0e0e0' }} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: "100vh", overflowY: "auto", padding: "16px", backgroundColor: '#f8f9fa' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Оценки</h2>

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
                fontSize: '14px'
              }}
            >
              {term} четверть ▼
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 100,
                minWidth: '120px'
              }}>
                {[1, 2, 3, 4].map(t => (
                  <div
                    key={t}
                    onClick={() => {
                      setTerm(t);
                      setShowDropdown(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      backgroundColor: term === t ? '#f0f0f0' : 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = term === t ? '#f0f0f0' : 'white'}
                  >
                    {t} четверть
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #dee2e6' }}>
            <button
              onClick={() => setActiveTab('topic')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'topic' ? '2px solid #ff9800' : '2px solid transparent',
                color: activeTab === 'topic' ? '#ff9800' : '#666',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'topic' ? 'bold' : 'normal',
                marginBottom: '-2px'
              }}
            >
              По предметам
            </button>
            <button
              onClick={() => setActiveTab('date')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'date' ? '2px solid #ff9800' : '2px solid transparent',
                color: activeTab === 'date' ? '#ff9800' : '#666',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'date' ? 'bold' : 'normal',
                marginBottom: '-2px'
              }}
            >
              По датам
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '16px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
            </div>
          )}
          {error && <div style={{ color: '#dc3545', padding: '16px' }}>{error}</div>}
          {!loading && !error && (
            <>
              {activeTab === 'topic' && buildTermContent()}
              {activeTab === 'date' && buildDateContent()}
            </>
          )}
        </div>

        {showUpButton && (
          <button
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ↑
          </button>
        )}
      </div>

      {selectedSubject && (
        <GradesDialog
          show={showDialog}
          onHide={() => setShowDialog(false)}
          subject={selectedSubject}
          marks={selectedMarks}
          languageCode={languageCode}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default StudentGrades