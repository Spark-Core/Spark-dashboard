module.exports = (service, id, email, app) => {
    app.connection.query("select * from users where email = ?", [email], (err, results) => {
        if (error) { return res.sendStatus(404) } else if (results.length == 0) { return create(service, id, email) } else if (results[0].email == email && results[0][service + "_id"] == id) {
            return login(results[0], app)
        } else {
            return link(service, id, email, app)
        }
    })


}