import { TeacherModel } from "./TeacherModel";

export interface GradeModel {
  gradeId?: string;
  letter?: string;
  type?: number;
  gradeNumber?: number;
  short?: string;
  shortKg?: string;
  shortRu?: string;
  name?: string;
  nameKg?: string;
  nameRu?: string;
  teacher?: TeacherModel;
  students?: string[] | null;
}