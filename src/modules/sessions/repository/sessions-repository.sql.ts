import { InjectModel } from "@nestjs/sequelize";
import { SessionModel } from "../models/sessions.model";
import { Session } from "../entities/sessions.entity";
import { SessionsRepository } from "./sessions-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";

export class SessionsSqlRepository
    extends SqlRepository<Session>
    implements SessionsRepository
{
    constructor(
        @InjectModel(SessionModel)
        private readonly sessionModel: ModelCtor<SessionModel>,
    ) {
        super(sessionModel);
    }
}
