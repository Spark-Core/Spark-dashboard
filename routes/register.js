const jwt = require("jsonwebtoken")
const config = require("./../config.json")
module.exports = async (req, res, app) => {
    if (!req.session.user) {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "Not logged in.",
            code: 1
        }))
    }
    if (typeof req.body.bot_id != "string") {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "No bot id specified in request",
            code: 2
        }))
    }
    if (req.body.bot_id.length == 0) {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "No bot id specified in request",
            code: 6
        }))
    }
    const result = await app.users.fetch(req.session.user.id)
    if (!result) {
        return res.status(403).set("content-type", "application/json").send(JSON.stringify({
            message: "Not logged in.",
            code: 3
        }))
    }

    try {
        var data = await registerKey(app, result.id, req.body.bot_id)
        return res.json({
            token: data.token,
            id: data.id
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
                code: 5
            }))
        } else if (e == 9) {
            return res.status(402).set("content-type", "application/json").send(JSON.stringify({
                message: "Bot id already used",
                code: 9
            }))
        } else if (e == 10) {
            return res.status(402).set("content-type", "application/json").send(JSON.stringify({
                message: "Bot id cannot include non-number symbols",
                code: 010
            }))
        } else {
            console.log(e)
        }
    }
}


function registerKey(app, id, bot_id) {
    return new Promise(function(resolve, reject) {
        if (isNaN(bot_id)) {
            return reject(9)
        }
        app.r.db("spark").table("keys").filter({
            userid: id
        }).limit(11).run((err, results) => {

            if (err) {
                return reject(4)
            } else if (results.length >= 10) {
                return reject(5)
            } else if (results.map(i => (i.bot_id)).includes(bot_id)) {
                return reject(10)
            }
            app.r.db("spark").table("keys").insert({
                botid: bot_id,
                userid: id,
                name: "Unregistered bot",
                status: 1,
            }).run((err, result) => {

                if (err) {
                    return reject(7)
                }
                var keyInfo = {
                    key: result.generated_keys[0],
                    bot_id,
                    owner: id
                }
                var token = jwt.sign(keyInfo, config.jwtSecret)
                app.r.db("spark").table("keys").get(result.generated_keys[0]).update({
                    token: token
                }).run((err, d) => {
                    if (err) {
                        return reject(8)
                    }
                    console.log(d)
                    return resolve({
                        token,
                        id: result.generated_keys[0]
                    })
                })
            })

        })

    })
}