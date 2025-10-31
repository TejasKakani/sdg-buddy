import mongoose, { Schema } from 'mongoose';

export interface User {
    name: string;
    email: string;
    password: string;
    isVerified?: boolean;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    verifyEmailToken?: string;
    verifyEmailTokenExpires?: Date;
    }

const UserSchema: Schema<User> = new mongoose.Schema<User>({
    name: { 
        type: String, 
        required: [true, 'Please provide your name']
    },
    email: { 
        type: String, required: [true, 'Please provide your email'], 
        unique: [true, 'Email already exists']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    password: { 
        type: String, 
        required: [true, 'Please provide your password']
    },
    passwordResetToken: { 
        type: String 
    },
    passwordResetExpires: { 
        type: Date 
    },
    verifyEmailToken: {
        type: String
    },
    verifyEmailTokenExpires: {
        type: Date
    }
},
{ timestamps: true }
);

export const UserModel = mongoose.models.User as mongoose.Model<User> || 
mongoose.model<User>('User', UserSchema);
