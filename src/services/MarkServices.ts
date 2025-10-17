import axios from "axios";
import { webUrl } from "./CommonServices";
import { ScheduleModel } from "../models/ScheduleModel";
import { MarkModel } from "../models/MarkModel";

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

export const calculateAverage = (marks: MarkModel[]): number => {
  const validMarks = marks.filter(m => m.mark !== null && m.mark !== undefined);
  if (!validMarks.length) return 0;
  return validMarks.reduce((sum, m) => sum + (m.mark ?? 0), 0) / validMarks.length;
};

export const groupAndSortGrades = (schedules: ScheduleModel[]): Map<string, MarkModel[]> => {
  const map = new Map<string, MarkModel[]>();
  
  schedules.forEach(schedule => {
    if (!schedule.marks) return;
    
    schedule.marks.forEach(mark => {
      const date = mark.createdAt?.toDateString() || 'Unknown date';
      const formattedDate = formatDate(date);
      
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
    const dateA = new Date(a[0].split('.').reverse().join('-'));
    const dateB = new Date(b[0].split('.').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  }));
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const getMarkTypeLabel = (markType?: string): string => {
  const types: { [key: string]: string } = {
    general: 'Оценка',
    write: 'Письменная работа',
    test: 'Тест',
    practice: 'Практическая работа',
    control: 'Контрольная работа',
    quarter: 'Четвертная оценка'
  };
  return types[markType || 'general'] || 'Оценка';
};

export const getMarkColor = (mark?: number, absent?: boolean): string => {
  if (absent) return '#999';
  if (!mark) return '#666';
  if (mark === 5) return '#4CAF50';
  if (mark === 4) return '#2196F3';
  if (mark === 3) return '#FF9800';
  return '#F44336';
};
