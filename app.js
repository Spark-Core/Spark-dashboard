const app = require("express")()
const routes = { oauth: require("./routes/oauth.js") }

app.listen(3041)





app.get("/callback/github", routes.oauth.github)
app.get("/callback/google", routes.oauth.google)