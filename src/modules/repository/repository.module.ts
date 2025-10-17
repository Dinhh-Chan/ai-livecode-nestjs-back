import MongooseSchemaProvider from "@module/repository/mongo/mongoose-model-provider";
import { SequelizeModel } from "@module/repository/sequelize/common/sequelize-model";
import { SequelizeService } from "@module/repository/sequelize/sequelize.service";
import { Global, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

import MongooseModel from "./mongo/mongoose-model";

@Global()
@Module({
    imports: [MongooseModel, SequelizeModule.forFeature(SequelizeModel)],
    providers: [...MongooseSchemaProvider, SequelizeService],
    exports: [MongooseModel, ...MongooseSchemaProvider, SequelizeModule],
})
export class RepositoryModule {}
