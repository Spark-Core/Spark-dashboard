const ejs = require("ejs")
const noAccess = require("./noAccess.js")
const socketOnline = require("./../tools/sockets.js")

module.exports = async (req, res, app) => {
    var id = req.params.id
    var userdata = await KeyAccess(app, id, req.session.user)
    if (!userdata) {
        return noAccess(req, res, app)
    }
    if (userdata.status == 1) {
        userdata.status = {
            text: "Unknown",
            color: "#9c9595",
            code: 1
        }
    } else if (socketOnline(app).length > 0) {
        userdata.status = {
            text: "Online",
            color: "#35d48b",
            code: userdata.status
        }
    } else {
        userdata.status = {
            text: "Offline",
            color: "#f04747",
            code: userdata.status
        }
    }
    ejs.renderFile(__dirname + "/../pages/layouts.ejs", {
        content: __dirname + "/../pages/detailPage.ejs",
        user: req.session.user,
        data: userdata
    }, (err, string) => {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.send(string)
    })

}

function KeyAccess(app, id, user) {
    return new Promise(function(resolve, reject) {
        app.r.db("spark").table("keys").get(id)
            .run((err, results) => {
                if (err) {
                    return resolve(false)
                }
                if (!results) {
                    return resolve(false);
                } else if (results.userid !== user.id) {
                    return resolve(false);
                } else {
                    return resolve(results)
                }
            })
    });

}