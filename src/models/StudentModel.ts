import { MarkModel } from "./MarkModel";
import { SchoolModel } from "./SchoolModel";
import { TeacherModel } from "./TeacherModel";

export interface StudentModel {
  userId?: string;
  studentId?: string;
  okpo?: string;
  pin?: number;
  pinAsString?: string;
  grade?: number;
  letter?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  marks?: MarkModel[];
  grades?: MarkModel[];
  marksForToday?: MarkModel[];
  school?: SchoolModel;
  birthdate?: Date;
  scheduleItemId?: string;
  lessonDay?: Date;
  objectId?: string;
  schoolId?: string;
  groupId?: string;
  teacher?: TeacherModel;
  districtName?: string;
  cityName?: string;
}