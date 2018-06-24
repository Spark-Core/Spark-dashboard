module.exports = (req, res, app) => {
    if (!req.session.user) {
        return res.sendStatus(403)
    } else {
        req.session.user.beta_accept = true;
        app.r.table("users").get(req.session.user.id).update({
            beta_accept: true
        }).run((e, r) => {
            console.log(e, r)
            return res.sendStatus(200)
        })
    }
}