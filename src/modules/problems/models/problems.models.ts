import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import {
    AllowNull,
    Column,
    DataType,
    Model,
    Table,
} from "sequelize-typescript";
import { Problems, ProblemDifficulty } from "../entities/problems.entity";
import { all } from "axios";

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
    topic_id?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "_sub_topic_id",
    })
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
    topic?: any;
    sub_topic?: any;
    test_cases?: any[];
}
