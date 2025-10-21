import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from "sequelize-typescript";
import { Problems, ProblemDifficulty } from "../entities/problems.entity";
import { Topics } from "../../topics/entities/topics.entity";
import { SubTopics } from "../../sub-topics/entities/sub-topics.entity";
import { TopicsModel } from "../../topics/models/topics.models";
import { SubTopicsModel } from "../../sub-topics/models/sub-topics.models";
import { TestCases } from "../../test-cases/entities/test-cases.entity";
import { TestCasesModel } from "../../test-cases/models/test-cases.models";

@Table({
    tableName: Entity.PROBLEMS,
    timestamps: true,
})
export class ProblemsModel extends Model implements Problems {
    @StrObjectId()
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        field: "_id",
    })
    _id: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "_topic_id",
    })
    @ForeignKey(() => TopicsModel)
    topic_id?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "_sub_topic_id",
    })
    @ForeignKey(() => SubTopicsModel)
    sub_topic_id?: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        field: "_name",
    })
    name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: "_description",
    })
    description: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: ProblemDifficulty.EASY,
        field: "_difficulty",
    })
    difficulty: ProblemDifficulty;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_code_template",
    })
    code_template?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_guidelines",
    })
    guidelines?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_solution",
    })
    solution?: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1000,
        field: "_time_limit_ms",
    })
    time_limit_ms: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 512,
        field: "_memory_limit_mb",
    })
    memory_limit_mb: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_number_of_tests",
    })
    number_of_tests: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "_is_public",
    })
    is_public: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "_is_active",
    })
    is_active: boolean;
    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
        field: "_sets",
    })
    sets?: string;
    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
        field: "_steps",
    })
    steps?: string;

    // Virtual fields for relationships
    @BelongsTo(() => TopicsModel, {
        targetKey: "_id",
        foreignKey: "topic_id",
    })
    topic?: Topics;

    @BelongsTo(() => SubTopicsModel, {
        targetKey: "_id",
        foreignKey: "sub_topic_id",
    })
    sub_topic?: SubTopics;

    @HasMany(() => TestCasesModel, {
        sourceKey: "_id",
        foreignKey: "problem_id",
    })
    test_cases?: TestCases[];
}
