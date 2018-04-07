const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require("mysql")
const config = require("./config.json")
var session = require('express-session')
var socketioJwt = require('socketio-jwt');
const jwt = require("jsonwebtoken")
app.sio = require("socket.io")(server)
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: "spark"
})
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
        socket.keyInfo = results[0]
        return next()
    })



})

app.sio.sockets.on('connection', function(socket) {
    console.log("Logged in successfully!")


})

var store = null;
try {

    if (require.resolve("connect-mongo")) {
        const MongoStore = require('connect-mongo')(session);
        store = new MongoStore({
            host: '127.0.0.1',
            port: '27017',
            db: 'sessions',
            url: 'mongodb://localhost:27017/sessions'
        })
    }
} catch (e) {
    // leave empty to ignore errors;
}

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: '*SCkyRTQU7Y4!rW4MvNNqJCGyKeDGAY%!7yJ6!EKU',
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
    register: require("./routes/register.js")
}
const tools = {
    fetchImages: require("./tools/fetchImages.js"),
    userCache: require("./tools/userCache.js")
}

tools.fetchImages(app)
app.connection.connect(() => {
    app.users = new tools.userCache(app)
})
server.listen(3041)

app.get("/", (req, res) => {
    if (req.session.user == null) {
        return routes.login(req, res, app)
    }
    return routes.dashboard(req, res, app)

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