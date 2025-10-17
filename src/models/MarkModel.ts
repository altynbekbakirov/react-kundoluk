import { StudentModel } from "./StudentModel";
import { SubjectModel } from "./SubjectModel";
import { TaskModel } from "./TaskModel";
import { TeacherModel } from "./TeacherModel";
import { TopicModel } from "./TopicModel";

export interface MarkModel {
  lsId?: string;
  lsUid?: string;
  uid?: string;
  studentPin?: number;
  firstName?: string;
  lastName?: string;
  midName?: string;
  mark?: number;
  markType?: string;
  oldMark?: number;
  customMark?: string;
  absent?: boolean;
  absentType?: string;
  lateMinutes?: number;
  status?: string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
  subject?: SubjectModel;
  topic?: TopicModel;
  task?: TaskModel;
  teacher?: TeacherModel;
  student?: StudentModel;
  command?: string;
  offline?: boolean;
}