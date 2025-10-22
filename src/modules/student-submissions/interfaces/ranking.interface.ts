export interface UserRecord {
    _id: string;
    username: string;
    email: string;
    fullName?: string;
    avatar?: string;
    systemRole: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RankingRecord {
    rankNumber: number;
    user: UserRecord;
    totalProblemsSolved: number;
}

export interface RankingResponse {
    rankings: RankingRecord[];
    totalUsers: number;
    currentUserRank?: RankingRecord;
}
