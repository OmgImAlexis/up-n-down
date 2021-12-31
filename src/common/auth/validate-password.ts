import { verify as verifyPassword } from 'argon2';

export const validatePassword = async (hash: string, plainTextPassword: string) => {
	try {
		return verifyPassword(hash, plainTextPassword);
	} catch {
		return false;
	}
};
