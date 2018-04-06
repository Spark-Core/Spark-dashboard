const ejs = require("ejs")
const errorPage = require("./error.js")
module.exports = (req, res, app) => {
    app.connection.query("select * from apikeys where userid = ?", req.session.user.id, (err, results) => {
        if (err) {
            console.log(err)
            return errorPage(res, 8)
        }
        var data = [{
            created: false
        }, {
            created: false
        }, {
            created: false
        }, {
            created: false
        }, {
            created: false
        }, {
            created: false
        }, {
            created: false
        }, {
            created: false
        }, {
            created: false
        }, {
            created: false
        }]

        var sockets = findClientsSocket()
        results.forEach(i => {
            data.pop()
            var online = (sockets.filter(s => {
                if (!s.keyInfo) {
                    return {
                        created: false
                    }
                }
                return s.keyInfo.keyid == i.keyid
            }).length > 0) ? true : false;

            data.unshift({
                keyid: i.keyid,
                name: i.name,
                online
            })
        })

        ejs.renderFile(__dirname + "/../pages/layouts.ejs", {
            content: __dirname + "/../pages/userpage.ejs",
            user: req.session.user,
            data,
        }, (err, string) => {
            if (err) {
                console.log(err)
                return res.sendStatus(500)
            }
            res.send(string)
        })
    })

    function findClientsSocket(roomId, namespace) {
        var res = []
            // the default namespace is "/"
            ,
            ns = app.sio.of(namespace || "/");

        if (ns) {
            for (var id in ns.connected) {
                if (roomId) {
                    var index = ns.connected[id].rooms.indexOf(roomId);
                    if (index !== -1) {
                        res.push(ns.connected[id]);
                    }
                } else {
                    res.push(ns.connected[id]);
                }
            }
        }
        return res;
    }
}