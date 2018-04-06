const jwt = require("jsonwebtoken")
const config = require("./../config.json")
module.exports = async (req, res, app) => {
    console.log(req)
    if (!req.session.user) {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "Not logged in.",
            code: 001
        }))
    }
    if (typeof req.body.name != "string") {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "No name specified in request",
            code: 002
        }))
    }
    if (req.body.name.length == 0) {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "No name specified in request",
            code: 006
        }))
    }
    const result = await app.users.fetch(req.session.user.id)
    if (!result) {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "Not logged in.",
            code: 003
        }))
    }

    try {
        var token = await registerKey(app, result.id, req.body.name)
        return res.json({
            token
        })

    } catch (e) {
        console.log(e)
        if ([4, 7, 8].includes(e)) {
            return res.status(500).set("content-type", "application/json").send(JSON.stringify({
                message: "Can't create a key because of an unknown error",
                code: e
            }))
        } else if (e == 5) {
            return res.status(402).set("content-type", "application/json").send(JSON.stringify({
                message: "You have reached the limit of api keys",
                code: 005
            }))
        } else {
            console.log(e)
        }
    }
}


function registerKey(app, id, name) {
    return new Promise(function(resolve, reject) {
        app.connection.query("select count(*) from apikeys where keyid = ?;", [id], (err, results) => {
            if (err) {
                return reject(4)
            } else if (results[0]["count(*)"] >= 10) {
                return reject(5)
            }
            app.connection.query("insert into apikeys (name, userid) values (?, ?)", [name, id], (err, result) => {
                if (err) {
                    return reject(7)
                }
                var keyInfo = {
                    key: result.insertId,
                    name,
                    owner: id
                }
                var token = jwt.sign(keyInfo, config.jwtSecret)
                app.connection.query("update apikeys set token = ? where keyid = ?", [token, result.insertId], (err) => {
                    if (err) {
                        return reject(8)
                    }
                    return resolve(token)
                })
            })

        })

    })
}