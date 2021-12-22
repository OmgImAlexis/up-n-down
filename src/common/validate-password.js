import { verify as verifyPassword } from 'argon2';

export const validatePassword = async (hash, plainTextPassword) => {
    try {
        await verifyPassword(hash, plainTextPassword);
        return true;
    } catch {
        return false;
    }
};