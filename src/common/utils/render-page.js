/**
 *
 * @param {string} name
 * @param {*} props
 * @returns
 */
export const renderPage = (name, props) => (req, res) => res.render(name, props);
