const title = 'New Post';

export const getNew = async (req, res) => {
    if (!req.session.user) {
        return res.render('message', {
            title,
            message: "Please <a href=\"/login\">log in</a> to create a post."
        });
    }

    res.render('new-post2', {
        title: '',
        link: '',
        textContent: '',
        tags: req.query.group ?? '',
        submitLabel: 'Create Post',
        heading: 'New Post'
    });
}