const app = require("express")()
const mysql = require("mysql")
const config = require("./config.json")
var session = require('express-session')
app.connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: "spark"
})

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: '*SCkyRTQU7Y4!rW4MvNNqJCGyKeDGAY%!7yJ6!EKU',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

const routes = {
    oauth: require("./routes/oauth.js"),
    dashboard: require("./routes/dashboard.js"),
    login: require("./routes/login.js")
}

app.listen(3041)

app.get("/", (req, res) => {
    console.log(req.session)
    if (req.session.user == null) {
        return routes.login(req, res, app)
    }
    return routes.dashboard(req, res, app)

})

app.get("/redirect/github", (req, res) => {
    res.redirect("https://github.com/login/oauth/authorize?client_id=1bb56238ae4a63f3f744&redirect_uri=https%3A%2F%2Fdashboard.discordspark.tk%2Fcallback%2Fgithub&scope=user:email%20read:user")
})
app.get("/redirect/google", (req, res) => {
    res.redirect("https://accounts.google.com/o/oauth2/v2/auth?client_id=463922476306-0di60822ajkofdqqhkh2cam6qik5eqps.apps.googleusercontent.com&redirect_uri=https://dashboard.discordspark.tk/callback/google&scope=profile%20email&state=1234&response_type=code")
})
app.get("/callback/github", (req, res) => {
    routes.oauth.github(req, res, app)
})
app.get("/callback/google", (req, res) => {
    routes.oauth.google(req, res, app)
})