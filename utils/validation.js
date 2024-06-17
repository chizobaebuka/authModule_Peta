import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    dateOfBirth: Joi.date().iso().required(),
    country: Joi.string().required()
});

export const verifySchema = Joi.object({
    email: Joi.string().email().required(),
    otpVerificationToken: Joi.string().length(6).required()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    country: Joi.string().optional()
});