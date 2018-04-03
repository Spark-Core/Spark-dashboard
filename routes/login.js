const ejs = require("ejs")

module.exports = (req, res, app) => {
    ejs.renderFile(__dirname + "/../pages/login.ejs", {}, (err, string) => {
        if (err) {
            return res.sendStatus(500)
        }
        res.send(string)
    })
}