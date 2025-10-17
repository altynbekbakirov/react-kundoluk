import { useEffect, useState } from 'react';
import getSchedules, { getCurrentWeekWorkingDays, isToday } from '../services/ScheduleServices';
import { ScheduleModel } from '../models/ScheduleModel';
import { useAuth } from '../hooks/useAuth';

function HomeScreen(): JSX.Element {
  const [workingDays, setWorkingDays] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { authData } = useAuth();

  useEffect(() => {
    setWorkingDays(getCurrentWeekWorkingDays(currentDate));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false)
      try {
        const result = await getSchedules({
          token: authData.token,
          startDate: currentDate,
          endDate: currentDate,
          type: authData.type,
        });

        setSchedules(result);
      } catch (err) {
        console.error('Error loading schedules:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentDate]);


  const handleDateChange = (newDate: Date): void => {
    setCurrentDate(newDate);
    setWorkingDays(getCurrentWeekWorkingDays(newDate));
  };

  const handleLessonClick = (schedule: ScheduleModel): void => {
    alert(`Navigating to details for ${schedule.id}\n\nIn a real app, this would navigate to a detail page.`);
    // In real app, use navigation:
    // navigate('/detail', { state: { login, schedule } });
  };

  return (
    <div className="min-vh-100 bg-light">
      <main className="container py-4">
        {/* 🗓️ Week Day Selector */}
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">Your Week</h5>

            <div className="d-flex gap-2 overflow-auto pb-2">
              {workingDays.map((day: Date, index: number) => {
                const isCurrent = day.toDateString() === currentDate.toDateString();
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateChange(day)}
                    className={`btn ${isCurrent
                        ? 'btn-primary'
                        : isCurrentDay
                          ? 'btn-outline-danger shadow-sm'
                          : 'btn-outline-secondary'
                      } flex-shrink-0 px-3 py-2 rounded-3`}
                    style={{ minWidth: '80px' }}
                  >
                    <div className="small fw-semibold text-uppercase mb-1">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="fs-5 fw-bold">{day.getDate()}</div>
                    <div className="small text-muted">
                      {day.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 📅 Date Picker */}
            <div className="border-top pt-3 mt-3">
              <label className="form-label fw-semibold small">Select a date</label>
              <input
                type="date"
                value={currentDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                className="form-control"
              />
            </div>

            
          </div>
        </div>

        {/* ⏳ Loading */}
        {loading && (
          <div className="text-center py-5 text-secondary">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: '3rem', height: '3rem' }}
            ></div>
            <p className="mb-0">Loading schedule...</p>
          </div>
        )}

        {/* ⚠️ Error */}
        {error && !loading && (
          <div className="text-center py-5 text-danger">
            <i className="bi bi-exclamation-triangle fs-1 mb-2"></i>
            <p className="fs-5 fw-semibold">Failed to load data</p>
            <p className="text-muted">Please try again later.</p>
          </div>
        )}

        {/* 🚫 Empty */}
        {!loading && !error && schedules.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-calendar-x fs-1 mb-2"></i>
            <p className="fs-5 fw-semibold">No lessons found</p>
            <p>Enjoy your free time 😊</p>
          </div>
        )}

        {/* 🧾 Schedule Cards */}
        {!error && schedules.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {schedules.map((schedule: ScheduleModel) => (
              <div
                key={schedule.uid}
                className="card border-0 shadow-sm hover-shadow-sm transition"
                onClick={() => handleLessonClick(schedule)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body d-flex align-items-start gap-3">
                  <div
                    className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '56px', height: '56px' }}
                  >
                    <span className="fs-4 fw-bold">
                      {schedule.lesson}
                    </span>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h5 className="fw-semibold mb-0">{schedule.lesson}</h5>
                      <span className="badge bg-light text-primary border border-primary">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>

                    <p className="mb-1 small text-muted">
                      <i className="bi bi-geo me-1"></i>Cabinet{' '}
                      <strong>{schedule.room}</strong>
                    </p>
                    <p className="mb-1 small text-muted">
                      <i className="bi bi-person me-1"></i>
                      {schedule.teacher?.lastName} {schedule.teacher?.firstName}
                    </p>
                    <p className="mb-2 small text-muted">
                      <i className="bi bi-building me-1"></i>
                      {schedule.schoolNameRu} • Grade {schedule.grade}
                      {schedule.letter}
                    </p>

                    {schedule.lastTask && (
                      <div className="bg-warning-subtle border border-warning rounded-3 p-2">
                        <span className="fw-semibold text-warning d-block small">
                          Last Task:
                        </span>
                        <span className="small text-dark">
                          {schedule.lastTask?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>

  );
}

export default HomeScreen;