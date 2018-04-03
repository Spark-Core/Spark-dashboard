const ejs = require("ejs")

module.exports = (req, res, app) => {
    ejs.renderFile(__dirname + "/../pages/layouts.ejs", {
        content: __dirname + "/../pages/userpage.ejs",
        user: req.session.user
    }, (err, string) => {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.send(string)
    })
}