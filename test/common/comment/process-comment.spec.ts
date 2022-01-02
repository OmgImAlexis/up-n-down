import test from 'ava';
import { processComment } from '../../../src/common/comment/process-comment.js';

test('processes comment', t => {
	t.is(processComment('This is a basic comment.'), 'This is a basic comment.');
});
