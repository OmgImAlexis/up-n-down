/**
 * This adds firehose to the main window for all other modules to use.
 */

const firehose = new EventSource('/api/v1/firehose');
window.firehose = firehose;

// Prevent https://bugzilla.mozilla.org/show_bug.cgi?id=833462 in Firefox
window.addEventListener('beforeunload', () => {
	firehose.close();
});
