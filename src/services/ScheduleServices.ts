import axios from "axios";
import { ScheduleModel } from "../models/ScheduleModel";
import { formatCurrentDate, webUrl } from "./CommonServices";
import { BaseResponseListModel } from "../models/BaseResponseListModel";

export const getCurrentWeekWorkingDays = (initialDate: Date): Date[] => {
  const currentWeekday = initialDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Adjust for JavaScript where Sunday is 0, but we want Monday as start
  const daysFromMonday = currentWeekday === 0 ? 6 : currentWeekday - 1;
  
  // Get Monday of the current week
  const monday = new Date(initialDate);
  monday.setDate(initialDate.getDate() - daysFromMonday);
  
  // Generate 6 days starting from Monday (Monday to Saturday)
  const weekdays: Date[] = Array.from({ length: 6 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
  
  return weekdays;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

interface GetSchedulesParams {
  token: string;
  startDate: Date;
  endDate: Date;
  type: string;
  studentPin?: number;
  isClassManager?: boolean;
  gradeId?: string;
}

const getSchedules = async ({
  token,
  startDate,
  endDate,
  type,
  studentPin,
  isClassManager,
  gradeId,
}: GetSchedulesParams): Promise<ScheduleModel[]> => {
  try {
    const queryParameters: Record<string, string> = {
      start_date: formatCurrentDate(startDate),
      end_date: formatCurrentDate(endDate),
    };

    if (studentPin !== undefined) {
      queryParameters.studentPin = studentPin.toString();
    }

    if (isClassManager !== undefined) {
      queryParameters.isClassManager = isClassManager ? '1' : '0';
    }

    if (gradeId !== undefined) {
      queryParameters.gradeId = gradeId.toString();
    }

    const url = `${webUrl}/${type}/gradebook/list`;

    const response = await axios.get<BaseResponseListModel<ScheduleModel[]>>(url, {
      params: queryParameters,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return response.data.actionResult ?? []; // ⬅️ Return empty array if null
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Schedule Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.toString() || error.message);
    }
    console.error('Schedule Error:', error);
    throw new Error(String(error));
  }
};


export default getSchedules;