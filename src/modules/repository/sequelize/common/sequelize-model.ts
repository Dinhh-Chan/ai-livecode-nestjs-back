import { CoursesModel } from "@module/courses/models/courses.model";
import { HamSinhMaModel } from "@module/quy-tac-ma/models/ham-sinh-ma.model";
import { QuyTacMaModel } from "@module/quy-tac-ma/models/quy-tac-ma.model";
import { ProblemsModel } from "@module/problems/models/problems.models";
import { SubTopicsModel } from "@module/sub-topics/models/sub-topics.models";
import { TestCasesModel } from "@module/test-cases/models/test-cases.models";
import { TopicsModel } from "@module/topics/models/topics.models";
import { UserProblemProgressModel } from "@module/user-problem-progress/models/user-problem-progress.model";
import { Model, ModelCtor } from "sequelize-typescript";
import { AuditLogModel } from "../model/audit-log.model";
import { AuthModel } from "../model/auth.model";
import { CourseStudent } from "../model/course-student";
import { CourseTeacher } from "../model/course-teacher";
import { DataPartitionUserModel } from "../model/data-partition-user.model";
import { DataPartitionModel } from "../model/data-partition.model";
import { FileModel } from "../model/file.model";
import { IncrementModel } from "../model/increment.model";
import { NotificationModel } from "../model/notification.model";
import { OneSignalUserModel } from "../model/one-signal-user.model";
import { SettingModel } from "../model/setting.model";
import TopicModel from "../model/topic.model";
import { UserModel } from "../model/user.model";

export const SequelizeModel: ModelCtor<Model>[] = [
    UserModel,
    AuthModel,
    FileModel,
    NotificationModel,
    OneSignalUserModel,
    TopicModel,
    TopicsModel,
    SubTopicsModel,
    ProblemsModel,
    TestCasesModel,
    UserProblemProgressModel,
    SettingModel,
    IncrementModel,
    QuyTacMaModel,
    HamSinhMaModel,
    AuditLogModel,
    DataPartitionModel,
    DataPartitionUserModel,
    CoursesModel,
    CourseStudent,
    CourseTeacher,
];
