const UserModel = require('../model/user')

class UserController {
    static serviceStockage = null

    static setService(service) {
        console.log("service ok !", service);

        UserController.serviceStockage = service
    }

    static affiche(req, res) {
        const id = req.params.id
        UserController.loadbyId(UserController.serviceStockage, id).then(user => {
            console.log(user.toString());
            res.render("user", { user: user })
        })
    }
    static ajoutForm(req, res) {
        res.render("ajoutForm")
    }
    static ajoutUser(req, res) {
        User.add(req.body.numero, req.body.nom)
        res.redirect('/')
    }
    static afficheAll(req, res) {
        UserModel.loadAll(UserController.serviceStockage).then(users => {
            console.log(users);

            res.render("panier", { users: users })
        })
    }
    static credit(req, res) {
        const id = req.params.id
        UserModel.loadbyId(UserController.serviceStockage, id).then(user => {
            user.credit(req.body.credit)
            res.redirect(`/user/${id}`)
        })
    }
    static debit(req, res) {
        const id = req.params.id
        UserModel.loadbyId(UserController.serviceStockage, id).then(user => {
            user.debit(req.body.debit)
            res.redirect(`/user/${id}`)
        })
    }
}

module.exports = UserController