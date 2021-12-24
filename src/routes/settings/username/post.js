import argon2 from 'argon2';
import { getUserWithUsername } from '../../../common/get-user-with-username.js';
import { getUserWithUserId } from '../../../common/get-user-with-user-id.js';
import { updateUserUsername } from '../../../common/user/update-user.js';

const title = 'Settings / Username';
const regexUsername = /^[a-z0-9-]{4,16}$/i;

const isUsernameTaken = async (currentUserId, username) => {
    // Check the username isn't taken
    const user = await getUserWithUsername(username);

    // If we found a user check that it's not the current user
    return user && user.user_id !== currentUserId;
};

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const postSettingsUsername = async (req, res) => {
    const username = req.body.username;
    
    try {
        if (!req.session.user) throw new Error('You need to be signed in!');

        // Check username is correct length and only using letters, numbers and dashes
        if (!username.match(regexUsername)) throw new Error('Username must be 4-16 characters(letters, numbers and dashes only).');

        // Check if the username has been taken by another user
        if (await isUsernameTaken(req.session.user.user_id, username)) throw new Error('Username already taken.');

        // Check the password is correct
        const user = await getUserWithUserId(req.session.user.user_id);    
        if (!await argon2.verify(user.password, req.body.password)) throw new Error('Invalid password.');

        // Update the user's username
        await updateUserUsername(req.session.user.user_id, username);
        req.session.user.username = username;

        // Render success page
        res.render('my-settings-username', {
            html: {
                title
            },
            username,
            info: {
                message: 'Username successfully saved'
            }
        });
    } catch (error) {
        res.render('my-settings-username', {
            html: {
                title
            },
            username,
            error
        });
    }
}