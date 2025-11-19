import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { StudentSubmissionsModule } from "@module/student-submissions/student-submissions.module";
import { ProblemsModule } from "@module/problems/problems.module";
import { UserProblemProgressModule } from "@module/user-problem-progress/user-problem-progress.module";
import { TopicsModule } from "@module/topics/topics.module";
import { Module, forwardRef } from "@nestjs/common";
import { UserImportController } from "./controller/user-import.controller";
import { UserController } from "./controller/user.controller";
import { UserSqlRepository } from "./repository/user-sql.repository";
import { UserImportService } from "./service/user-import.service";
import { UserService } from "./service/user.service";
import { AdminInitService } from "./services/admin-init.service";

@Module({
    imports: [
        forwardRef(() => StudentSubmissionsModule),
        forwardRef(() => ProblemsModule),
        forwardRef(() => UserProblemProgressModule),
        forwardRef(() => TopicsModule),
    ],
    controllers: [UserController, UserImportController],
    providers: [
        UserService,
        UserImportService,
        AdminInitService,
        RepositoryProvider(Entity.USER, UserSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    exports: [UserService],
})
export class UserModule {}
