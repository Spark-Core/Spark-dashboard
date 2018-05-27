module.exports = (service, id, email, name, app, req) => {
    return new Promise(async function(resolve, reject) {
        app.r.db("spark").table("users").filter({
            email
        }).run(async (err, results) => {
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
            var data = {
                email,
                name,
                token
            }
            data[`${service}_id`] = id
            app.r.db("spark").table("users").insert(data).run((err, data) => {
                if (err) {
                    console.log(err)
                    return reject(500)
                } else {
                    return resolve(login(data, app, req))
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
        var data = {}[service + "_id"] = id
        app.r.db("spark").table("users").filter({
            email
        }).update(data).run((err, results) => {
            if (err) {
                return reject(500)
            } else {
                r.table("users").filter({
                    email
                }).run((err, results) => {
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