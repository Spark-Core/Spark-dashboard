module.exports = (service, id, email, name, app, req) => {
    return new Promise(async function(resolve, reject) {
        app.connection.query("select * from users where email = ?", [email], async (err, results) => {
            if (err) {
                console.log(err)
                reject(500)
                // TODO: implement a nice page.
            } else if (results.length == 0) {
                var result = await create(service, id, email, name, app, req)
                resolve(result)
            } else if (results[0].email == email && results[0][service + "_id"] == id) {
                var result = await login(results[0], app, req)
                resolve(result)
            } else {
                var result = await link(service, id, email, app, req)
                resolve(result)
            }
        })


    });
}

async function create(service, id, email, name, app, req) {
    return new Promise(function(resolve, reject) {
        require('crypto').randomBytes(64, function(err, buffer) {
            var token = buffer.toString('hex');
            app.connection.query(`insert into users (email, name, ${service}_id, token) values (?, ?, ?, ?)`, [email, name, id, token], (err, results) => {
                if (err) {
                    console.log(err)
                    return reject(500)
                } else {
                    var result = {
                        email,
                        name,
                        token,
                    }
                    result[`${service}_id`] = id
                    return resolve(login(result, app, req))
                }
            })
        });
    });
}
async function login(user, app, req) {
    return new Promise(function(resolve, reject) {
        req.session.user = user;
        resolve(user)
    });
}
async function link(service, id, email, app, req) {
    return new Promise(function(resolve, reject) {
        app.connection.query("update users set " + service + "_id = ? where email = ?", [id, email], (err, results) => {
            if (err) {
                return reject(500)
            } else {
                app.connection.query("select * from users where email = ?", [email], (err, results) => {
                    if (err) {
                        return reject(500)
                    } else if (results.length == 0) {
                        return reject(404)
                    } else {
                        var user = {
                            name: results[0].name,
                            email: results[0].email,
                            token: resuls[0].token
                        }
                        return resolve(login(user, app, req))
                    }
                })
            }
        })
    });
}