import mongoose, { Schema } from 'mongoose';

export interface User {
    name: string;
    username: string;
    email: string;
    password: string;
    isVerified?: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    verifyEmailToken?: string;
    verifyEmailTokenExpires?: Date;
    }

const UserSchema: Schema<User> = new mongoose.Schema<User>({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: [true, 'Username already taken'],
        lowercase: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username must be at most 30 characters'],
        match: [/^[a-z0-9_]+$/, 'Username may only contain lowercase letters, numbers, and underscores']
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
    resetPasswordToken: {
        type: String 
    },
    resetPasswordExpires: {
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
