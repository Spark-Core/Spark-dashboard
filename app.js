const app = require("express")()
const mysql = require("mysql")
const config = require("./config.json")
app.connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: "spark"
})
const routes = { oauth: require("./routes/oauth.js") }

app.listen(3041)





app.get("/callback/github", (req, res) => { routes.oauth.github(req, res, app) })
app.get("/callback/google", (req, res) => { routes.oauth.google(req, res, app) })