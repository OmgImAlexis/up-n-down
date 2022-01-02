import type { Request, Response } from 'express';

const title = 'New Post';

export const getNew = async (request: Request, response: Response) => {
	if (!request.session.user) {
		return response.render('message', {
			html: {
				title,
			},
			message: 'Please <a href="/login">log in</a> to create a post.',
		});
	}

	response.render('posts/new', {
		html: {
			title: 'New post',
		},
		link: '',
		textContent: '',
		tags: request.query.group ?? '',
		submitLabel: 'Create Post',
		heading: 'New Post',
	});
};
