const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require("./config.json")
app.r = require("rethinkdbdash")({
    db: "global",
    servers: config.servers,
    user: config.username,
    password: config.password
})
var session = require('express-session')
const RDBStore = require('session-rethinkdb')(session);
const store = new RDBStore(app.r);
const discord = require("discord.js")
app.client = new discord.Client()
app.client.login(config.discordToken)
var socketioJwt = require('socketio-jwt');
const jwt = require("jsonwebtoken")
app.sio = require("socket.io")(server)
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.sio.use(socketioJwt.authorize({
    secret: config.jwtSecret,
    handshake: true,
    callback: false
}));
app.sio.use((socket, next) => {

    app.connection.query("select * from apikeys where keyid = ? and token = ? and userid =?", [socket.decoded_token.key, socket.handshake.query.token, socket.decoded_token.owner], (err, results) => {
        if (err) {
            return next(err)
        }
        if (results.length == 0) {
            return next(new Error("Token is invalid or has expired."))
        }
        if (results[0].botid != socket.decoded_token.bot_id) {
            return next(new Error(401))
        }
        if (results[0].status == 1) {
            var name = "No name found"
            if (socket.handshake.query.bot_name) {
                name = socket.handshake.query.bot_name
            }
            try {
                app.connection.query("update apikeys set status = 0, name = ? where keyId = ? and token = ? and userid = ?", [name, socket.decoded_token.key, socket.handshake.query.token, socket.decoded_token.owner])
            } catch (e) {
                console.log(e)
                return next(new Error("Couldn't verifiy your key."))
            }
        } else if (results[0].status > 1) {
            return next(new Error(403))
        }
        socket.keyInfo = results[0]
        return next()
    })
})


app.set('trust proxy', 1)
app.use(session({
    secret: config.cookieSecret,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: true
    },
    store
}))

const routes = {
    oauth: require("./routes/oauth.js"),
    dashboard: require("./routes/dashboard.js"),
    login: require("./routes/login.js"),
    logout: require("./routes/logout.js"),
    register: require("./routes/register.js"),
    confirmedBeta: require("./routes/confirmedBeta.js"),
    detailView: require("./routes/detailView.js"),
    error: require("./routes/error.js")
}
const tools = {
    fetchImages: require("./tools/fetchImages.js"),
    userCache: require("./tools/userCache.js"),
    socketHandler: require("./tools/socketHandler.js")
}

tools.fetchImages(app)
tools.socketHandler(app)
app.users = new tools.userCache(app)

server.listen(process.platform == 'linux' ? 3041 : 80)

app.get("/", (req, res) => {
    if (req.session.user == null) {
        return routes.login(req, res, app)
    }
    return routes.dashboard(req, res, app)

})
app.get("/details/:id", (req, res) => {
    if (req.session.user == null) {
        return routes.login(req, res, app)
    }
    return routes.detailView(req, res, app)
})
app.get("/css/login.css", (req, res) => {
    res.sendFile(__dirname + "/css/login.css")
})
app.get("/redirect/github", (req, res) => {
    res.redirect("https://github.com/login/oauth/authorize?client_id=1bb56238ae4a63f3f744&redirect_uri=https%3A%2F%2Fdashboard.discordspark.com%2Fcallback%2Fgithub&scope=user:email%20read:user")
})
app.get("/redirect/google", (req, res) => {
    res.redirect("https://accounts.google.com/o/oauth2/v2/auth?client_id=463922476306-0di60822ajkofdqqhkh2cam6qik5eqps.apps.googleusercontent.com&redirect_uri=https://dashboard.discordspark.com/callback/google&scope=profile%20email&state=1234&response_type=code")
})
app.get("/redirect/discord", (req, res) => {
    res.redirect("https://discordapp.com/oauth2/authorize?client_id=432202494341545994&redirect_uri=https%3A%2F%2Fdashboard.discordspark.com%2Fcallback%2Fdiscord&response_type=code&scope=identify%20email")
})
app.get("/callback/discord", (req, res) => {
    routes.oauth.discord(req, res, app)
})
app.get("/callback/github", (req, res) => {
    routes.oauth.github(req, res, app)
})
app.get("/callback/google", (req, res) => {
    routes.oauth.google(req, res, app)
})
app.get("/logout", (req, res) => {
    routes.logout(req, res)
})
app.post("/api/register", (req, res) => {
    routes.register(req, res, app)
})
app.get("/api/confirmedBeta", routes.confirmedBeta)
app.get("/setup", (req, res) => {
    routes.error(req, res, 503, {
        shortDescription: "Service Unavailable",
        description: "The page you're looking for is not ready yet!",
        extra: "<h1 class=\"title\">This page is currently being worked on!</h1><h2 style=\"margin-bottom: 35px;\"class=\"subtitle\">If you want to stay up to date with Spark's development, join the lounge!</h2><a href=\"https://discord.gg/TezD2Zg\" class=\"is-large button is-warning\"><span class=\"icon\" style=\"margin-right: 3px\"><i class=\"fab fa-discord\"></i></span> Spark Lounge</a>"
    })
})
app.get("*", (req, res) => {
    routes.error(req, res, 404, {
        shortDescription: "Not found",
        description: "The page you're looking for can't be found."
    })
})