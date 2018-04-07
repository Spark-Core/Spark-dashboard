module.exports.github = github;
module.exports.discord = discord;
module.exports.google = google;
const request = require("request-promise")
const verify = require("../tools/verify.js")
const config = require("../config.json")
require("request")

// auth url: https://github.com/login/oauth/authorize?client_id=1bb56238ae4a63f3f744&redirect_uri=https%3A%2F%2Fdashboard.discordspark.com%2Fcallback%2Fgithub&scope=user:email%20read:user
async function github(req, res, app) {
    if (!req.query.code) {
        return res.redirect("/")
    }
    try {
        var body = await request({
            method: "POST",
            uri: "https://github.com/login/oauth/access_token",
            form: {
                code: req.query.code,
                client_id: config.github.client_id,
                client_secret: config.github.client_secret,
                redirect_uri: "https://dashboard.discordspark.com/callback/github"
            },
            json: true
        })
        if (!body.access_token) {
            return res.redirect("/")
        }
        var user = await request({
            method: "GET",
            uri: "https://api.github.com/user",
            json: true,
            headers: {
                Authorization: "Token " + body.access_token,
                "user-agent": "Spark Dashboard"
            }
        })
        if (!user.email || !user.id) {
            return res.sendStatus(503)
        }
        // TODO: Add nice page here to show there is no email address linked.
        var result = verify("github", user.id, user.email, user.name, app, req)
        result
            .then(user => {
                return res.redirect("/")
            })
            .catch(code => {
                return res.sendStatus(code)
            })
    } catch (e) {
        if (e) {
            console.error(e)
            return res.redirect("/")
        }
    }
}
async function discord(req, res, app) {
    if (!req.query.code) {
        return res.redirect("/")
    }
    try {
        var body = await request({
            method: "POST",
            uri: "https://discordapp.com/api/oauth2/token",
            form: {
                code: req.query.code,
                client_id: config.discord.client_id,
                client_secret: config.discord.client_secret,
                redirect_uri: "https://dashboard.discordspark.com/callback/discord",
                "grant_type": "authorization_code"
            },
            json: true
        })
        if (!body.access_token) {
            return res.redirect("/")
        }
        var user = await request({
            method: "GET",
            uri: "https://discordapp.com/api/v6/users/@me",
            json: true,
            headers: {
                Authorization: "Bearer " + body.access_token,
                "user-agent": "Spark Dashboard"
            }
        })
        if (!user.email || !user.id) {
            return res.sendStatus(503)
        }
        // TODO: Add nice page here to show there is no email address linked.
        var result = verify("discord", user.id, user.email, user.username + "#" + user.discriminator, app, req)
        result
            .then(user => {
                return res.redirect("/")
            })
            .catch(code => {
                return res.sendStatus(code)
            })
    } catch (e) {
        if (e) {
            console.error(e)
            return res.redirect("/")
        }
    }
}



// auth url: https://accounts.google.com/o/oauth2/v2/auth?client_id=463922476306-0di60822ajkofdqqhkh2cam6qik5eqps.apps.googleusercontent.com&redirect_uri=https://dashboard.discordspark.com/callback/google&scope=profile%20email&state=1234&response_type=code
async function google(req, res, app) {
    if (!req.query.code) {
        return res.redirect("/")
    }
    try {
        var body = await request({
            method: "POST",
            uri: "https://www.googleapis.com/oauth2/v4/token",
            body: {
                "code": req.query.code,
                "client_id": config.google.client_id,
                "client_secret": config.google.client_secret,
                "redirect_uri": "https://dashboard.discordspark.com/callback/google",
                "grant_type": "authorization_code"
            },
            headers: {
                "Content-Type": "application/json"
            },
            json: true
        })
        return res.redirect("/")
    } catch (e) {
        if (e) {
            console.error(e)
            return res.redirect("/")

        }
    }
}