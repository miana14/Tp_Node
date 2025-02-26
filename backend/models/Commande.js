const {getDB} = require('../config/db');

class Commande {
    #statut
    #total
    #date_commande
    #moyen_paiement
    #id_user

    constructor(statut, total, date_commande, id_user) {
        this.#statut = statut
        this.#total = total
        this.#date_commande = date_commande
        this.#id_user = id_user
    }

    getStatut() {
        return this.#statut
    }
    getTotal() {
        return this.#total
    }
    getDate_commande() {
        return this.#date_commande
    }
    getMoyen_paiement() {
        return this.#moyen_paiement ?? "Aucun moyen de paiement enregistré";
    }
    getId_user() {
        return this.#id_user
    }

    setStatut(statut){
        statut = this.#statut
    }
    setTotal(total){
        total = this.#total
    }
    setDate_commande(date_commande){
        date_commande = this.#date_commande
    }
    setMoyen_paiment(moyen_paiement) {
        this.#moyen_paiement = moyen_paiement;
    }

    // TODO: vérifier moyen paiement en fonction du statut

    static async getAll() {
        const db = getDB();
        try {
            console.log('arrivé');
            const query = `SELECT * FROM commande`;

            const [results] = await db.query(query);
            console.log(results);
            
            return results;
        }
        catch (error) {
            console.error({message: "Erreur lors de la récupération des commandes :", error: error.message || error});
            throw error;
        }
    }
    static async getById(id) {
        const db = getDB();
        try {
            const query = `SELECT * FROM commande WHERE id_commande = ?`;
            const values = [id];
            const [results] = await db.query(query, values);
            return results;
        }
        catch (error) {
            console.error(`Erreur lors de la récupération de la commande n°${id} :`, error);
            throw error;
        }
    }

    static async create(data) {
        const db = getDB();

        try {
            const queryCommande = `INSERT INTO commande (statut, total, date_commande, moyen_paiement, id_user) VALUES (?, ?, ?, ?, ?)`;
            const valuesCommande = [data.statut, data.total, data.date_commande, data.moyen_paiement, data.id_user];

            const [resultsCommande] = await db.query(queryCommande, valuesCommande);
            const commandeId = resultsCommande.insertId;

            if (data.produits.length) {
                const queryProduit = `INSERT INTO contenir (id_produit, id_commande) VALUES ${data.produits.map(() => "(?, ?)").join(", ")}`;
                const valuesProduit = data.produits.flatMap(produitId => [produitId, commandeId]);
                const [resultsProduit] = await db.query(queryProduit, valuesProduit);

                return {commande: resultsCommande, produit: resultsProduit};
            }
            else return {commande: resultsCommande};
        }
        catch (error) {
            console.error("Erreur lors de la création de l'utilisateur : ", error);
            throw error;
        }
    }
    static async delete(id) {
        const db = getDB();

        try {
             const query = `DELETE FROM commande WHERE id_commande = ?`
             const values = [id];

             const [results] = await db.query(query, values);
             return results
        }
        catch (error) {
            console.error("Erreur lors de la suppression de la commande:", error)
            throw error;
        }
    }
    static async update(id, data) {

        const db = getDB();

        try {
            const fields = [];
            const values = [];

            if (data.statut) {
                fields.push("statut = ?");
                values.push(data.statut);
            }
            if (data.total) {
                fields.push("total = ?");
                values.push(data.total);
            }
            if (data.date_commande) {
                fields.push("date_commande = ?");
                values.push(data.date_commande);
            }
            if (data.moyen_paiement) {
                fields.push("moyen_paiement = ?");
                values.push(data.moyen_paiement);
            }
            if (fields.length === 0) {
                throw new Error("Aucune donnée valide à mettre à jour.");
            }

            values.push(id);
            const query = `UPDATE commande SET ${fields.join(", ")} WHERE id_commande = ?`;
            const results = await db.query(query, values);

            return results
        }
        catch (error) {
            console.error("Erreur lors de la mise à jour de la commande : ", error);
            throw error;
        }
    }

}

module.exports = Commande