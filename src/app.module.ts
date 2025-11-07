import { DefaultModules, DefaultProviders } from "@config/module/config";
import { AuditLogModule } from "@module/audit-log/audit-log.module";
import { IncrementModule } from "@module/increment/increment.module";
import { RedisModule } from "@module/redis/redis.module";
import { SsoModule } from "@module/sso/sso.module";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { CommonProviderModule } from "./modules/common-provider/common-provider.module";
import { DataPartitionModule } from "./modules/data-partition/data-partition.module";
import { DataProcessModule } from "./modules/data-process/data-process.module";
import { FileModule } from "./modules/file/file.module";
import { ImportSessionModule } from "./modules/import-session/import-session.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { OneSignalModule } from "./modules/one-signal/one-signal.module";
import { QuyTacMaModule } from "./modules/quy-tac-ma/quy-tac-ma.module";
import { SettingModule } from "./modules/setting/setting.module";
import { TopicModule } from "./modules/topic/topic.module";
import { UserModule } from "./modules/user/user.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { ProblemsModule } from "./modules/problems/problems.module";
import { TopicsModule } from "./modules/topics/topics.module";
import { SubTopicsModule } from "./modules/sub-topics/sub-topics.module";
import { TestCasesModule } from "./modules/test-cases/test-cases.module";
import { JudgeNodesModule } from "./modules/judge-nodes/judge-nodes.module";
import { JudgeNodeLogsModule } from "./modules/judge-node-logs/judge-node-logs.module";
import { StudentSubmissionsModule } from "./modules/student-submissions/student-submissions.module";
import { TestCaseResultsModule } from "./modules/test-case-results/test-case-results.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { ClassModule } from "./modules/class/class.module";
import { ClassStudentsModule } from "./modules/class-students/class-students.module";
import { ContestsModule } from "./modules/contests/contests.module";
import { ContestUsersModule } from "./modules/contest-users/contest-users.module";
import { ContestProblemsModule } from "./modules/contest-problems/contest-problems.module";
import { UserProblemProgressModule } from "./modules/user-problem-progress/user-problem-progress.module";
import { ContestSubmissionsModule } from "./modules/contest-submissions/contest-submissions.module";
import { CohortsModule } from "./modules/cohorts/cohorts.module";
import { CohortStudentsModule } from "./modules/cohort-students/cohort-students.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
@Module({
    imports: [
        ...DefaultModules,
        AuthModule,
        UserModule,
        OneSignalModule,
        NotificationModule,
        TopicModule,
        FileModule,
        SettingModule,
        RedisModule,
        SsoModule,
        IncrementModule,
        ImportSessionModule,
        QuyTacMaModule,
        AuditLogModule,
        DataProcessModule,
        DataPartitionModule,
        CommonProviderModule,
        OrganizationModule,
        ProblemsModule,
        TopicsModule,
        SubTopicsModule,
        TestCasesModule,
        JudgeNodesModule,
        JudgeNodeLogsModule,
        StudentSubmissionsModule,
        TestCaseResultsModule,
        CoursesModule,
        ClassModule,
        ClassStudentsModule,
        ContestsModule,
        ContestUsersModule,
        ContestProblemsModule,
        UserProblemProgressModule,
        ContestSubmissionsModule,
        CohortsModule,
        CohortStudentsModule,
        FeedbackModule,
    ],
    providers: [...DefaultProviders],
    controllers: [AppController],
})
export class AppModule {}
