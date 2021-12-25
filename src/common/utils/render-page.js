/**
 * 
 * @param {string} name 
 * @param {*} props 
 * @returns 
 */
export const renderPage = (name, props) => (req, res) => {
    return res.render(name, props);
};