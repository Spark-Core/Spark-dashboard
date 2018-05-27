module.exports = (req, res) => {
    if (!req.session.user) {
        return res.sendStatus(403)
    } else {
        req.session.user.confirmedBeta = true;
        return res.sendStatus(200)
    }
}