import { siteName } from '../../config/index.js';

export const getLeaving = async (req, res) => {
    const link = req.query.link;
    if (!link) return res.redirect('/');
    res.render('leaving', {
        link,
        siteName
    });
};
