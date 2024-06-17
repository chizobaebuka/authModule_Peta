import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please input your name'],
        },
        email: {
            type: String,
            required: [true, 'Please input your email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please input your password'],
        },
        date_of_birth: {
            type: Date,
            required: [true, 'Please input your date of birth'],
        },
        country: {
            type: String,
            required: [true, 'Please input your country'],
        },
        verificationToken: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;