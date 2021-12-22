export const renderPage = (name, props) => (req, res) => {
    return res.render(name, props);
};