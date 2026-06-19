import mongoose, { Schema } from "mongoose";

/**
 * One-way follow edge: `follower` follows `following` and can see their
 * progress. There is no acceptance step. A compound unique index prevents
 * duplicate follows of the same person.
 */
export interface Follow {
    _id?: mongoose.Types.ObjectId;
    follower: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const FollowSchema: Schema<Follow> = new mongoose.Schema<Follow>(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        following: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate follow edges and speed up "who do I follow" lookups.
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
// Speed up "who follows this user" lookups (e.g. follower counts).
FollowSchema.index({ following: 1 });

export const FollowModel =
    (mongoose.models.Follow as mongoose.Model<Follow>) ||
    mongoose.model<Follow>("Follow", FollowSchema);
