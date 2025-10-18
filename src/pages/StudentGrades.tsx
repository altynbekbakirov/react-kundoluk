import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GradesDialog } from "../components/GradesDialog";
import { MarkItem } from "../components/MarkItem";
import { useAuth } from "../hooks/useAuth";
import { MarkModel } from "../models/MarkModel";
import { ScheduleModel } from "../models/ScheduleModel";
import { SubjectModel } from "../models/SubjectModel";
import { getTerm } from "../services/CommonServices";
import { calculateAverage, getMarkTypeLabel, getMarksBySubject, getStudentTermMarks, groupAndSortGrades } from "../services/MarkServices";

function StudentGrades(): JSX.Element {
  const [term, setTerm] = useState<number>(getTerm(new Date()));
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showUpButton, setShowUpButton] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("topic");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectModel | null>(null);
  const [selectedMarks, setSelectedMarks] = useState<MarkModel[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { authData } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentTermMarks({
        type: authData.type,
        token: authData.token,
        term,
        withMarks: true
      });

      // Convert snake_case to camelCase and parse dates
      const processedData = data.map((schedule: any) => ({
        ...schedule,
        marks: schedule.marks?.map((mark: any) => ({
          ...mark,
          markId: mark.mark_id,
          lsUid: mark.ls_uid,
          studentPin: mark.student_pin,
          studentPinAsString: mark.student_pin_as_string,
          firstName: mark.first_name,
          lastName: mark.last_name,
          midName: mark.mid_name,
          markType: mark.mark_type,
          oldMark: mark.old_mark,
          customMark: mark.custom_mark,
          absentType: mark.absent_type,
          absentReason: mark.absent_reason,
          lateMinutes: mark.late_minutes,
          createdAt: mark.created_at ? new Date(mark.created_at) : undefined,
          updatedAt: mark.updated_at ? new Date(mark.updated_at) : undefined,
        }))
      }));

      setSchedules(processedData);
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

  const handleSubjectClick = (subject: SubjectModel, marks: MarkModel[]) => {
    setSelectedSubject(subject);
    setSelectedMarks(marks);
    setShowDialog(true);
  };

  const buildTermContent = () => {
    const subjectMarks = getMarksBySubject({ schedules: schedules });

    if (subjectMarks.length === 0) {
      return <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('no_data')}</div>;
    }

    return (
      <div style={{ padding: '0' }}>
        {subjectMarks.map(([subject, marks], idx) => {
          const average = calculateAverage(marks);
          const firstLetter = currentLanguage === 'ru'
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
                        {currentLanguage === 'ru' ? subject.nameRu : subject.nameKg}
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
                      <MarkItem key={markIdx} mark={mark} language={currentLanguage} />
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
      return <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('no_data')}</div>;
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
                const firstLetter = currentLanguage === 'ru'
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
                              {currentLanguage === 'ru' ? mark.subject?.nameRu : mark.subject?.nameKg}
                            </span>
                            <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                              ({getMarkTypeLabel(t, mark.mark_type)})
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {mark.teacher?.lastName} {mark.teacher?.firstName}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <MarkItem mark={mark} language={currentLanguage} />
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
          <h2 style={{ margin: 0 }}>{t('menu.grades')}</h2>

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
              {t('by_topic')}
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
              {t('by_date')}
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
          languageCode={currentLanguage}
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