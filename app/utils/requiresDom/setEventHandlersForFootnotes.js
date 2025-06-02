/**
 * Finds footnotes in dom and adds appropriate event handler
 * @param {Element} ref    A container element in which to bind handlers (must already contain .note nodes)
 * @param {Function} handler  Called with `{ id, coords }` when a note is clicked
 */
const setEventHandlersForFootnotes = (ref, handler) => {
	if (!ref) return;
	// grab everything with class="note"
	const notes = Array.from(ref.querySelectorAll('.note'));

	notes.forEach((note) => {
		// remove any <a href> inside the note so clicks don't navigate
		note.querySelectorAll('a[href]').forEach((a) => a.removeAttribute('href'));

		// remove any old listeners (optional cleanup)
		note.replaceWith(note.cloneNode(true));
	});

	// We re‐select after the replaceWith above to clear old listeners:
	Array.from(ref.querySelectorAll('.note')).forEach((note) => {
		note.addEventListener('click', (e) => {
			e.stopPropagation();
			const id = note.getAttribute('id');

			// compute a popup position
			const x = Math.min(window.innerWidth - 300, e.clientX);
			const y = e.clientY;

			handler({ id, coords: { x, y } });
		});
	});
};

export default setEventHandlersForFootnotes;
