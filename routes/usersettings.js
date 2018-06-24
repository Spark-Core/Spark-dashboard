module.exports = async (req, res, app) => {


    ejs.renderFile(__dirname + "/../pages/layouts.ejs", {
        content: __dirname + "/../pages/settings.ejs",
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