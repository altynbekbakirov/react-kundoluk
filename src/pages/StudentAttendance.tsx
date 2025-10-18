import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleModel } from '../models/ScheduleModel';
import { MarkModel } from '../models/MarkModel';
import { getStudentTermMarks, mergeStudentScheduleData } from '../services/MarkServices';
import { useAuth } from '../hooks/useAuth';
import { getTerm } from '../services/CommonServices';
import { MarkItem } from '../components/MarkItem';

function StudentAttendance(): JSX.Element {
  const [students, setStudents] = useState<ScheduleModel[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState<number>(getTerm(new Date()));
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showUpButton, setShowUpButton] = useState<boolean>(false);
  const { authData } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  useEffect(() => {
    loadData();
  }, [term]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getStudentTermMarks({
        type: authData.type,
        token: authData.token,
        term,
        absent: 1,
      });
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowUpButton(scrollRef.current.scrollTop > 300);
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildDateContent = (
    groupedMarks: Map<string, MarkModel[]>,
    language: string
  ) => {
    const groups = Array.from(groupedMarks.keys());
    const allMarksByDate: Map<string, Map<string, MarkModel[]>> = new Map();

    // Process all groups to collect marks by date
    groups.forEach((groupKey) => {
      const marks = groupedMarks.get(groupKey) || [];
      const parts = groupKey.split('-');

      if (parts.length < 3) return;

      const subjectName = parts[2];

      // Sort marks by lastName
      const allMarks = [...marks].sort((a, b) => {
        if (!a.last_name) return 1;
        if (!b.last_name) return -1;
        return a.last_name.localeCompare(b.last_name);
      });

      // Group marks by date for this subject
      allMarks.forEach((mark) => {
        if (mark.created_at) {
          const date = new Date(mark.created_at);
          const dateString = `${date.getFullYear()}.${String(
            date.getMonth() + 1
          ).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

          if (!allMarksByDate.has(dateString)) {
            allMarksByDate.set(dateString, new Map());
          }

          const dateMap = allMarksByDate.get(dateString)!;
          if (!dateMap.has(subjectName)) {
            dateMap.set(subjectName, []);
          }

          dateMap.get(subjectName)!.push(mark);
        }
      });
    });

    // Sort dates
    const sortedDates = Array.from(allMarksByDate.keys()).sort();

    // Convert dates to dd.mm format for display
    const dateDisplayMap: Map<string, string> = new Map();
    sortedDates.forEach((date) => {
      const parts = date.split('.');
      const day = parts[2];
      const month = parts[1];
      dateDisplayMap.set(date, `${day}.${month}`);
    });

    // Collect all unique subjects
    const allSubjects = new Set<string>();
    groups.forEach((group) => {
      const parts = group.split('-');
      if (parts.length >= 3) {
        allSubjects.add(parts[2]);
      }
    });
    const sortedSubjects = Array.from(allSubjects).sort();

    return buildSingleDataTable({
      sortedDates,
      dateDisplayMap,
      allMarksByDate,
      subjects: sortedSubjects,
      languageCode: language,
    });
  };

  const buildSingleDataTable = ({
    sortedDates,
    dateDisplayMap,
    allMarksByDate,
    subjects,
  }: {
    sortedDates: string[];
    dateDisplayMap: Map<string, string>;
    allMarksByDate: Map<string, Map<string, MarkModel[]>>;
    subjects: string[];
    languageCode: string;
  }) => {
    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ 
          borderCollapse: 'collapse', 
          border: '1px solid #dee2e6',
          minWidth: '100%',
          backgroundColor: 'white'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ 
                border: '1px solid #dee2e6', 
                padding: '12px', 
                position: 'sticky', 
                left: 0, 
                backgroundColor: '#f8f9fa',
                width: '33%',
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '14px',
                zIndex: 10
              }}>
                {t('lesson')}
              </th>
              {sortedDates.map((date) => (
                <th
                  key={date}
                  style={{ 
                    border: '1px solid #dee2e6', 
                    padding: '12px', 
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  {dateDisplayMap.get(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, idx) => (
              <tr key={subject} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa' }}>
                <td style={{ 
                  border: '1px solid #dee2e6', 
                  padding: '12px', 
                  position: 'sticky', 
                  left: 0, 
                  backgroundColor: 'inherit',
                  fontWeight: '500',
                  fontSize: '14px',
                  zIndex: 5
                }}>
                  {subject}
                </td>
                {sortedDates.map((date) => {
                  const marksForThisDateAndSubject =
                    allMarksByDate.get(date)?.get(subject) || [];
                  return (
                    <td
                      key={date}
                      style={{ 
                        border: '1px solid #dee2e6', 
                        padding: '12px', 
                        textAlign: 'center'
                      }}
                    >
                      {marksForThisDateAndSubject.length > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          {marksForThisDateAndSubject.map((mark, markIdx) => (
                            <MarkItem
                              key={markIdx}
                              mark={mark} language={currentLanguage} />
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '14px', color: '#adb5bd' }}>-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const groupedMarks = students ? mergeStudentScheduleData(students, currentLanguage) : new Map();

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: "100vh", overflowY: "auto", padding: "16px", backgroundColor: '#f8f9fa' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>{t('menu.attendance')}</h2>

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
              {term} {t('quarter')} ▼
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
                {[1, 2, 3, 4].map(y => (
                  <div
                    key={y}
                    onClick={() => {
                      setTerm(y);
                      setShowDropdown(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      backgroundColor: term === y ? '#f0f0f0' : 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = term === y ? '#f0f0f0' : 'white'}
                  >
                    {y} {t('quarter')}
                  </div>
                ))}
              </div>
            )}
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
          {error && (
            <div style={{ color: '#dc3545', padding: '16px', textAlign: 'center' }}>
              {t('error')}: {error}
            </div>
          )}
          {!loading && !error && (!students || students.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              {t('no_data')}
            </div>
          )}
          {!loading && !error && students && students.length > 0 && (
            buildDateContent(groupedMarks, currentLanguage)
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default StudentAttendance;

