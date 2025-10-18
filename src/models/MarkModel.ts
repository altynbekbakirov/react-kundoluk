import { StudentModel } from "./StudentModel";
import { SubjectModel } from "./SubjectModel";
import { TaskModel } from "./TaskModel";
import { TeacherModel } from "./TeacherModel";
import { TopicModel } from "./TopicModel";

export interface MarkModel {
  mark_id?: string;
  ls_uid?: string;
  uid?: string;
  student_pin?: number;
  first_name?: string;
  last_name?: string;
  mid_name?: string;
  mark?: number;
  mark_type?: string;
  old_mark?: number;
  custom_mark?: string;
  absent?: boolean;
  absent_type?: string;
  late_minutes?: number;
  status?: string;
  note?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  subject?: SubjectModel;
  topic?: TopicModel;
  task?: TaskModel;
  teacher?: TeacherModel;
  student?: StudentModel;
  command?: string;
  offline?: boolean;
}