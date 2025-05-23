const {getDB} = require('../config/db')
const fs = require ('fs');

class Produit {
    // Déclaration des propriétés privées
    #nom
    #prix
    #illustration
    #description

    constructor(nom, prix) {
        this.#nom = nom
        this.#prix = prix
    }

    // Méthodes getter pour accéder aux attributs privés
    getNom() {
        return this.#nom;
    }
    getPrix() {
        return this.#prix;
    }
    getIllustration() {
        return this.#illustration;
    }
    getDescription() {
        return this.#description
    }

    // Méthodes setter pour modifier les valeurs des attributs
    setNom(nom){
        this.#nom = nom;
    }
    setPrix(prix){
        this.#prix = prix;
    }
    setIllustration(illustration) {
        this.#illustration = illustration;
    }
    setDescription(description) {
        this.#description = description
    }

    // Récupérer tous les produits
    static async getAll() {
        const db = getDB();
        try {
            const query = 'SELECT * FROM produit';

            const [results] = await db.query(query);
            console.log("resultats :", results);
            
            return results;
        }
        catch (error) {
            console.error("Erreur lors de la récupération des produits :", error);
            throw error;
        }
    }

    // Récupérer tous les produits avec leurs catégories associées
    static async getAllWithCategories() {
        const db = getDB();
        try {
            const query = `
                    SELECT 
                        p.id_produit, 
                        p.nom AS produit_nom, 
                        p.prix,
                        p.description,
                        p.illustration, 
                        GROUP_CONCAT(c.id_categorie) AS id_categories,
                        GROUP_CONCAT(c.nom) AS categories_noms
                    FROM produit p
                    JOIN appartenir a ON p.id_produit = a.id_produit
                    JOIN categorie c ON a.id_categorie = c.id_categorie
                    GROUP BY p.id_produit
                `;
                const [results] = await db.query(query);
                console.log("resultats getAllWithCategories:", results);  
                // On renvoit les données formatées 
                return results.map(product => ({
                    ...product,
                    id_categories: product.id_categories ? product.id_categories.split(",").map(Number) : [],
                    categories_noms: product.categories_noms ? product.categories_noms.split(",") : []
                }));         
        }
        catch (error) {
            console.error("Erreur lors de la récupération des produits avec catégories :", error)
            throw error;
        }
    }

    // Récupérer un produit par son ID
    static async getById(id) {
        const db = getDB();
        try {
            const query = `
                    SELECT 
                        p.id_produit, 
                        p.nom AS produit_nom, 
                        p.prix,
                        p.description,
                        p.illustration, 
                        GROUP_CONCAT(c.id_categorie) AS id_categories,
                        GROUP_CONCAT(c.nom) AS categories_noms
                    FROM produit p
                    JOIN appartenir a ON p.id_produit = a.id_produit
                    JOIN categorie c ON a.id_categorie = c.id_categorie
                    WHERE p.id_produit = ?
                    GROUP BY p.id_produit
                `;
            const values = [id];
            const [results] = await db.query(query, values);
            return results.map(product => ({
                ...product,
                id_categories: product.id_categories ? product.id_categories.split(",").map(Number) : [],
                categories_noms: product.categories_noms ? product.categories_noms.split(",") : []
            })); 
        }
        catch (error) {
            console.error(`Erreur lors de la récupération du produit n°${id} :`, error);
            throw error;
        }
    }

    // Crée un nouveau produit avec des catégories associées 
    static async create(nom, prix, categories, description = null, illustration = null, file = null) {
            const db = getDB();
            try {
                let queryProduit;
                let valuesProduit = [nom, prix];
                let fileName = file !== null? file.filename : null;
                if (illustration && description) {
                    queryProduit = `INSERT INTO produit (nom, prix, illustration, description) VALUES (?, ?, ?, ?)`;
                    valuesProduit = [nom, prix, fileName, description];
                } else if (illustration) {
                    queryProduit = `INSERT INTO produit (nom, prix, illustration) VALUES (?, ?, ?)`;
                    valuesProduit = [nom, prix, fileName];
                } else if (description) {
                    queryProduit = `INSERT INTO produit (nom, prix, description) VALUES (?, ?, ?)`;
                    valuesProduit = [nom, prix, description];
                } else {
                    queryProduit = `INSERT INTO produit (nom, prix) VALUES (?, ?)`;
                    valuesProduit = [nom, prix];
                }
    
                const [resultsProduit] = await db.query(queryProduit, valuesProduit);
                console.log("resultats de l'insertion :", resultsProduit);
                const produitId = resultsProduit.insertId;
                console.log(produitId)
                if (categories.length) {
                    categories = JSON.parse(categories)
                    const queryCategorie = `INSERT INTO appartenir (id_produit, id_categorie) VALUES ${categories.map(() => "(?, ?)").join(", ")}`;
                    const valuesCategorie = categories.flatMap(categorieId => [produitId, categorieId]);  
                    const [resultsCategorie] = await db.query(queryCategorie, valuesCategorie);
                    console.log({produit: resultsProduit, categorie: resultsCategorie});
                    
                    // récupère le produit créé et le renvoi
                    const newProduit = await this.getById(produitId);
                    return newProduit[0];
                }
            } catch (error) {
                console.error("Erreur lors de la création du produit :", error);
                throw error;
            }
    }

    // Supprime un produit ainsi que ses liens dans la table "appartenir"
    static async delete(id) {
        const db = getDB();

        try {
            const queryProduit = `DELETE FROM produit WHERE id_produit = ?`
            const queryAppartenir = `DELETE FROM appartenir WHERE id_produit = ?`
            const values = [id]
            await db.query(queryAppartenir, values);
            const [resultsProduit] = await db.query(queryProduit, values);
            return resultsProduit;
        }
        catch (error) {
            console.error('Erreur lors de la suppression du produit : ', error);
            throw error;
        }
    }

    // Mettre à jour un produit avec de nouvelles informations
    static async update(id, data, file) {
        const db = getDB();

        try {
            const fields = [];
            const values = [];

            // Mise à jour des champs fournis
            if (data.nom) {
                fields.push("nom = ?");
                values.push(data.nom);
            }
            if (data.prix) {
                fields.push("prix = ?");
                values.push(data.prix);
            }
            if (data.categories) {
                this.updateCategories(id, JSON.parse(data.categories));
            }
            if (file && data.illustration) {
                let newFileName = file.filename  
                // Récupère l'ancien produit pour supprimer l'ancienne image
                const oldProduct = await db.query("SELECT illustration FROM produit WHERE id_produit = ?", [id]);
                if (oldProduct[0]?.illustration) {
                    const oldImagePath = path.join("frontend/public/uploads/productsImages/", oldProduct[0].illustration);
                    
                    // Supprime l'ancienne image si elle existe
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                fields.push("illustration = ?");
                values.push(newFileName);
            }
            if (data.description) {
                fields.push("description = ?");
                values.push(data.description);
            }
            if (fields.length === 0) {
                throw new Error("Aucune donnée valide à mettre à jour.");
            }

            values.push(id);
            const query = `UPDATE produit SET ${fields.join(", ")} WHERE id_produit = ?`;
            await db.query(query, values);

            // const queryUpdatedProduit = `SELECT * FROM produit WHERE id_produit = ?`;
            // const idProduit = [id]
            // const updatedProduit = await db.query(queryUpdatedProduit, idProduit);
            const updatedProduit = await this.getById(id);

            return updatedProduit[0];

        }
        catch (error) {
            console.error("Erreur lors de la mise à jour du produit : ", error);
            throw new Error(error);
        }
    }

    // Mettre à jour les catégories associées à un produit
    static async updateCategories(id_produit, categories) {
        const db = getDB();

        try {
            // On supprime les ancienntes associations pour éviter les doublons
            await db.query('DELETE FROM appartenir WHERE id_produit = ?', [id_produit]);

            if (categories.length) {
                const query = `INSERT INTO appartenir (id_produit, id_categorie) VALUES ${categories.map(() => "(?, ?)").join(", ")}`
                const values = categories.flatMap(categorieId => [id_produit, categorieId]);
                const [results] = await db.query(query, values);
                return results;
            }
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour des catégories du produit : ', error);
            throw error;
        }
    }
}

module.exports = Produit