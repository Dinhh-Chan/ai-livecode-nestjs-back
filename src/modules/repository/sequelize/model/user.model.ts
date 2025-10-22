import { User } from "@module/user/entities/user.entity";
import {
    DataType,
    Column,
    Table,
    Model,
    PrimaryKey,
} from "sequelize-typescript";
import { Gender, SystemRole } from "@module/user/common/constant";
import { v4 as uuidv4 } from "uuid";

@Table({
    tableName: "users",
    timestamps: true,
    paranoid: false,
})
export class UserModel extends Model implements User {
    @PrimaryKey
    @Column({
        type: DataType.STRING(24),
        allowNull: false,
        field: "_id",
        defaultValue: () => uuidv4().replace(/-/g, "").substring(0, 24),
    })
    _id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true,
        field: "username",
    })
    username: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: "password",
    })
    password?: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        unique: true,
        field: "sso_id",
    })
    ssoId?: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: "email",
    })
    email: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        field: "firstname",
    })
    firstname?: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        field: "lastname",
    })
    lastname?: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: "fullname",
    })
    fullname?: string;

    @Column({
        type: DataType.ENUM(...Object.values(Gender)),
        allowNull: true,
        field: "gender",
    })
    gender?: Gender;

    @Column({
        type: DataType.STRING(10),
        allowNull: true,
        field: "dob",
    })
    dob?: string;

    @Column({
        type: DataType.ENUM(...Object.values(SystemRole)),
        allowNull: false,
        field: "system_role",
    })
    systemRole: SystemRole;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
        field: "student_ptit_code",
    })
    studentPtitCode?: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        field: "data_partition_code",
    })
    dataPartitionCode?: string;
}
