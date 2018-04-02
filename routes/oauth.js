module.exports.github = github;
module.exports.google = google;


// auth url: https://github.com/login/oauth/authorize?client_id=1bb56238ae4a63f3f744&redirect_uri=https%3A%2F%2Fdashboard.discordspark.tk%2Fcallback%2Fgithub&scope=user:email%20read:user
function github(req, res) {
    if (!req.query.code) {
        return res.redirect("/")
    }
    console.log(req.query.code)
}

// auth url: https://accounts.google.com/o/oauth2/v2/auth?client_id=463922476306-0di60822ajkofdqqhkh2cam6qik5eqps.apps.googleusercontent.com&redirect_uri=https://dashboard.discordspark.tk/callback/google&scope=profile%20email&state=1234&response_type=code
function google(req, res) {
    if (!req.query.code) {
        return res.redirect("/")
    }
    console.log(req.query.code)
}