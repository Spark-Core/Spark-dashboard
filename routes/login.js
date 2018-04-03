const ejs = require("ejs")

module.exports = (req, res, app) => {
    var image = app.images[Math.floor(Math.random() * (app.images.length - 0 + 1))]
    ejs.renderFile(__dirname + "/../pages/login.ejs", {
        image
    }, (err, string) => {
        if (err) {
            return res.sendStatus(500)
        }
        res.send(string)
    })
}