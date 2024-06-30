import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { sendOTPByEmail } from '../middlewares/emailOtpMiddleware.js';
import { compareOTP, generateOTP } from '../utils/otpTokenGenerator.js';
import { HTTP_STATUS_CODE } from '../constants/httpStatusCodes.js';
import { loginSchema, registerSchema, updateProfileSchema, verifySchema } from '../utils/validation.js';

export const registerUser = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const { name, email, password, dateOfBirth, country } = req.body;
    
    try {
        const existingUser = await User.findOne({ email: email });
        if(existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const otp = generateOTP();
        sendOTPByEmail(email, otp);
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User ({
            name: name,
            email: email,
            password:  hashedPassword,
            date_of_birth: dateOfBirth,
            country: country,
            verificationToken: otp
        })

        await user.save();
        res.status(HTTP_STATUS_CODE.CREATED).json({
            message: 'User registered successfully. Verification OTP token sent to email',
            user: {
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: error.message });
    }
}

export const verifyUser = async (req, res) => {
    const { error } = verifySchema.validate(req.body);
    if (error) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const { email, otpVerificationToken } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: `User not found with email ${email}` });
        }

        if (!compareOTP(otpVerificationToken, user.verificationToken)) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: 'Invalid OTP verification token, check your mail' });
        }

        // Update user as verified and clear verification token
        user.isVerified = true;
        user.verificationToken = null;

        // Save the user to the database
        await user.save();
        // Generate a token for the user and save to cookie
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        });
        
        res.status(HTTP_STATUS_CODE.CREATED).json(
            { 
                message: 'User verified successfully', 
                user: {
                    name: user.name,
                    isVerified: user.isVerified
                }
            }
        );

    } catch (error) {
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        res.clearCookie('token');
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.clearCookie('token');
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'User not found, invalid credentials!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            res.clearCookie('token');
            return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ message: 'User is not verified' });
        }

        // Create and assign a Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(HTTP_STATUS_CODE.SUCCESS).json({ token, user: user.name });

    } catch (error) {
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: `User not found with email ${email}` });
        }

        // Delete the user
        await user.deleteOne({ email });
        
        res.status(HTTP_STATUS_CODE.SUCCESS).json({ message: 'User deleted successfully', user });

    } catch (error) {
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const { name, dateOfBirth, country } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.date_of_birth = dateOfBirth || user.date_of_birth;
        user.country = country || user.country;
        await user.save();

        res.status(HTTP_STATUS_CODE.SUCCESS).json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(HTTP_STATUS_CODE.SUCCESS).json(users);
    } catch (error) {
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: error.message });
    }
};






