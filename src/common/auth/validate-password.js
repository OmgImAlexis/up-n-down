import { verify as verifyPassword } from 'argon2';

export const validatePassword = async (hash, plainTextPassword) => {
    try {
        return verifyPassword(hash, plainTextPassword);
    } catch {
        return false;
    }
};