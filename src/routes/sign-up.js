import { validationResult } from 'express-validator';
import { createUser } from '../common/create-user.js';
import { getCurrentSiteMaxWidth } from '../common/get-current-site-max-width.js';

const title = 'Sign Up';

/**
 * Render signup page.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const getSignup = (req, res) => {
    if (req.session.user) {
        return res.render('message', {
            title,
            message: "You already signed up. If you want to create another account then please <a href=\"/logout\">log out</a>.",
        });
    }

    return res.render('sign-up', {
        title,
        autoLogin: 'yes'
    });
}

/**
 * Process signup form.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const postSignup = async (req, res) => {
    // Check body for validation errors
    const [validationError] = validationResult(req).array({ onlyFirstError: true });
    if (validationError) {
        return res.render('sign-up', {
            title,
            error: new Error(validationError.msg),
            username: req.body.username,
            autoLogin: req.body.autoLogin
        });
    }

    const { username, password } = req.body ?? {};

    try {
        // Create the user
        const { rows: [user] } = await createUser(username, password);

        // If the user ticked auto login then
        // authenticate them and redirect them to the homepage
        if (req.body.autoLogin === 'yes') {
            req.session.user = user;
    
            return res.redirect('/');
        }
    
        // Show success message
        return res.render('message', {
            title,
            message: "Sign up was successful, you can now <a href=\"/login\">log in</a>."
        });
    } catch (error) {
        // Render error page
        const errorMessage = error.constraint == 'username_unique_idx' ? `"${username}" already taken` : 'unknown error, please try again';
        console.log(error);
        return res.render('sign-up', {
            title,
            error: new Error(errorMessage),
            username: req.body.username,
            autoLogin: req.body.autoLogin
        });
    }
}
