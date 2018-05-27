const ejs = require("ejs")
const findClientsSocket = require("./../tools/sockets.js")
const errorPage = require("./error.js")
module.exports = (req, res, app) => {
    app.r.db("spark").table("keys").filter({
        userid: req.session.user.id
    }).run((err, results) => {
        if (err) {
            console.log(err)
            return errorPage(req, res, 500, {
                shortDescription: "Internal Server Error",
                description: "We couldn't fetch all the data for your account.\nTry again later.",
                extra: "<h1 class=\"title\">Does this problem keep occurring?</h1><h2 style=\"margin-bottom: 35px\">Please contact technical support staff about this issue</h2><a href=\"https://discord.gg/TezD2Zg\" class=\"is-large button is-warning\"><span class=\"icon\" style=\"margin-right: 3px\"><i class=\"fab fa-discord\"></i></span> Spark Lounge</a>"
            })
        }
        var data = []
        for (i = 0; data.length < 10; i++) {
            data.push({
                created: false
            })
        }

        var sockets = findClientsSocket(app)
        results.forEach(i => {
            data.pop()
            var online = (sockets.filter(s => {
                if (!s.keyInfo) {
                    return {
                        created: false
                    }
                }
                return s.keyInfo.keyid == i.keyid
            }).length > 0) ? true : false;

            data.unshift({
                keyid: i.id,
                name: i.name,
                status: i.status,
                online
            })
        })

        ejs.renderFile(__dirname + "/../pages/layouts.ejs", {
            content: __dirname + "/../pages/overview.ejs",
            user: req.session.user,
            data,
        }, (err, string) => {
            if (err) {
                console.log(err)
                return res.sendStatus(500)
            }
            res.send(string)
        })
    })
}