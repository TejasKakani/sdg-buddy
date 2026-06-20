import mongoose, {Schema} from "mongoose";

export interface SDGGridData {
    sdgId: number;
    points: number;
}

export interface MonthlySDGData {
    [sdg: number]: number; // SDG number -> points
}

export interface YearlyMonthlyPoints {
    [year: number]: {
        [month: number]: MonthlySDGData; // Month (1-12) -> SDG data
    };
}

export interface Profile{
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    name: string;
    username: string;
    totalPoints: number;
    currentStreak: number;
    acheivements: number;
    lastActivity: Date;
    sdgGrid: SDGGridData[]; // Direct SDG grid data (17 SDGs)
    yearlyMonthlyPoints: YearlyMonthlyPoints; // Chart data organized by year and month
};

const ProfileSchema: Schema<Profile> = new mongoose.Schema<Profile>({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    name: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    totalPoints: {type: Number, default: 0},
    currentStreak: {type: Number, default: 0},
    acheivements: {type: Number, default: 0},
    lastActivity: {type: Date, default: new Date(0)},
    sdgGrid: [{
        sdgId: {type: Number, required: true, min: 1, max: 17},
        points: {type: Number, default: 0}
    }],
    yearlyMonthlyPoints: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

//attach index for leaderboard sorting
ProfileSchema.index({totalPoints: -1});

export const ProfileModel = mongoose.models.Profile as mongoose.Model<Profile> || 
mongoose.model<Profile>('Profile', ProfileSchema);



