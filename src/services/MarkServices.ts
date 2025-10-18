import axios from "axios";
import { webUrl } from "./CommonServices";
import { ScheduleModel } from "../models/ScheduleModel";
import { MarkModel } from "../models/MarkModel";
import { StudentModel } from "../models/StudentModel";
import { SubjectModel } from "../models/SubjectModel";

export const getStudentTermMarks = async ({
  type,
  token,
  term,
  studentPin,
  studentId,
  absent,
  withMarks = true,
}: {
  type: string;
  token: string;
  term: number;
  studentPin?: string;
  studentId?: string;
  absent?: number;
  withMarks?: boolean;
}): Promise<ScheduleModel[]> => {
  try {
    const queryParams: Record<string, string> = {};

    if (withMarks) queryParams['with_marks'] = '1';
    if (absent !== undefined) queryParams['absent'] = absent.toString();
    if (studentId) queryParams['student_id'] = studentId;

    if (type === 'parent') {
      if (!studentPin) throw new Error('studentPin is required when type is parent');
      queryParams['student_pin'] = studentPin;
    }

    const url = `${webUrl}/${type}/gradebook/term/${term}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: queryParams,
    });

    if (response.status === 200) {
      // Assuming API returns { data: ScheduleModel[] } structure
      return response.data.actionResult ?? [];
    } else {
      throw new Error(JSON.stringify(response.data));
    }
  } catch (error: any) {
    console.error('Student term marks Error:', error.response?.data || error.message || error);
    throw error;
  }
};

export const getStudentHomeWorks = async ({
  token,
  type,
  term
}: {
  token: string;
  type: string;
  term: number;
}): Promise<ScheduleModel[]> => {
  try {
    const url = `${webUrl}/${type}/homework/list?term_no=${term}`;

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (response.ok) {
      const result = await response.json();

      // Assuming you have a similar BaseResponseListModel structure
      // If result.data exists, return it, otherwise return empty array
      return result.data || [];
    } else {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
  } catch (e: any) {
    console.error('Homework Error:', e.toString());
    throw new Error(e.toString());
  }
};

interface GroupedSchedules {
  [date: string]: ScheduleModel[];
}

export const groupSchedulesByDate = (schedules: ScheduleModel[]): GroupedSchedules => {
  // Create a map to store grouped schedules
  const groupedSchedules: GroupedSchedules = {};

  for (const schedule of schedules) {
    // Skip if any required date component is null
    if (schedule.day == null || schedule.month == null || schedule.year == null) {
      continue;
    }

    // Create the composite key in 'dd.mm.yyyy' format
    const dateKey = `${schedule.day}.${schedule.month}.${schedule.year}`;

    // If this date doesn't exist in the map yet, create a new list
    if (!groupedSchedules[dateKey]) {
      groupedSchedules[dateKey] = [];
    }

    // Add the schedule to the appropriate date's list
    groupedSchedules[dateKey].push(schedule);
  }

  return groupedSchedules;
};

export function mergeStudentScheduleData(
  schedules: ScheduleModel[],
  languageCode: string
): Map<string, MarkModel[]> {
  const mergedSchedules = new Map<string, MarkModel[]>();

  for (const schedule of schedules) {
    if (!schedule.marks || schedule.marks.length === 0) {
      continue; // Skip schedules with no marks
    }

    const key = `${schedule.grade}-${schedule.letter}-${languageCode === 'ru'
        ? schedule.subject?.nameRu
        : schedule.subject?.nameKg
      }`;

    if (!mergedSchedules.has(key)) {
      // Initialize the list if this key doesn't exist yet
      mergedSchedules.set(key, []);
    }

    // Add all marks from this schedule to the appropriate key
    mergedSchedules.get(key)!.push(...schedule.marks);
  }

  return mergedSchedules;
}

export const mergeScheduleData = (originalSchedules: ScheduleModel[]): ScheduleModel[] => {
  const mergedSchedules: { [key: string]: ScheduleModel } = {};

  for (const schedule of originalSchedules) {
    const key = `${schedule.grade}-${schedule.letter}-${schedule.subjectId}`;

    if (!mergedSchedules[key]) {
      mergedSchedules[key] = { ...schedule };
    } else {
      // Merge students - this is the key fix
      if (schedule.students && schedule.students.length > 0) {
        // Create a map of existing students by a unique key (pin + name)
        const existingStudents: { [key: string]: StudentModel } = {};

        for (const student of mergedSchedules[key].students || []) {
          const studentKey = `${student.pin}-${student.firstName}-${student.lastName}`;
          existingStudents[studentKey] = student;
        }

        // Add or merge new students
        for (const newStudent of schedule.students) {
          const newStudentKey = `${newStudent.pin}-${newStudent.firstName}-${newStudent.lastName}`;

          if (existingStudents[newStudentKey]) {
            // Merge marks if student already exists
            const existingStudent = existingStudents[newStudentKey];
            existingStudent.marks = existingStudent.marks || [];

            if (newStudent.marks) {
              // Avoid duplicate marks
              for (const newMark of newStudent.marks) {
                if (!existingStudent.marks.some((mark) => mark.uid === newMark.uid)) {
                  existingStudent.marks.push(newMark);
                }
              }
            }
          } else {
            // Add new student
            if (!mergedSchedules[key].students) {
              mergedSchedules[key].students = [];
            }
            mergedSchedules[key].students!.push(newStudent);
            existingStudents[newStudentKey] = newStudent;
          }
        }
      }
    }
  }

  return Object.values(mergedSchedules);
};

export const getMarksBySubject = ({ schedules }: { schedules: ScheduleModel[] }) => {
  const map = new Map<string, { subject: SubjectModel; marks: MarkModel[] }>();

  schedules.forEach(s => {
    if (!s.subject || !s.marks) return;

    // Use subjectId or code as the key instead of the object itself
    const key = s.subject.subjectId || s.subject.code || s.subject.name || '';

    if (!map.has(key)) {
      map.set(key, { subject: s.subject, marks: [] });
    }

    s.marks.forEach(mark => {
      map.get(key)?.marks.push({ ...mark, teacher: s.teacher });
    });
  });

  return Array.from(map.values()).map(item => [item.subject, item.marks] as [SubjectModel, MarkModel[]]);
};

export const calculateAverage = (marks: MarkModel[]): number => {
  const validMarks = marks.filter(m => m.mark !== null && m.mark !== undefined);
  if (!validMarks.length) return 0;
  return validMarks.reduce((sum, m) => sum + (m.mark ?? 0), 0) / validMarks.length;
};

export const groupAndSortGrades = (schedules: ScheduleModel[]): Map<string, MarkModel[]> => {
  const map = new Map<string, MarkModel[]>();

  schedules.forEach((schedule) => {
    if (!schedule.marks) return;

    schedule.marks.forEach((mark) => {
      // Use created_at instead of createdAt
      if (!mark.created_at) return;

      const dateToFormat = typeof mark.created_at === 'string'
        ? new Date(mark.created_at)
        : mark.created_at;

      const formattedDate = formatDate(dateToFormat);

      if (!map.has(formattedDate)) {
        map.set(formattedDate, []);
      }

      map.get(formattedDate)?.push({
        ...mark,
        teacher: schedule.teacher,
        subject: schedule.subject
      });
    });
  });

  return new Map([...map.entries()].sort((a, b) => {
    const parseDate = (dateStr: string): Date => {
      const parts = dateStr.split('.');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };

    const dateA = parseDate(a[0]);
    const dateB = parseDate(b[0]);
    return dateB.getTime() - dateA.getTime();
  }));
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}.${month}.${year}`;
};

export const getMarkTypeLabel = (t: (key: string) => string, type?: string): string => {
  switch (type) {
    case 'general':
      return t('grade');
    case 'write':
      return t('write_work');
    case 'test':
      return t('test');
    case 'practice':
      return t('practice_work');
    case 'control':
      return t('control_work');
    case 'quarter':
      return t('quarter_mark');
    case 'laboratory':
      return t('laboratory_work');
    default:
      return t('grade');
  }
};

export const getMarkColor = (mark?: number, absent?: boolean): string => {
  if (absent) return '#999';
  if (!mark) return '#666';
  if (mark === 5) return '#4CAF50';
  if (mark === 4) return '#2196F3';
  if (mark === 3) return '#FF9800';
  return '#F44336';
};
