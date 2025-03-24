import {defineStore} from 'pinia';
import { useStore } from './store';
import axios from 'axios';

export const useOrderStore = defineStore("orders", {
    state: () => ({
        __ListOrders: [],

        // Définition des différents status des commandes
        __ListStatus: [
            {
                status: "En attente",
                color: "yellow",
            },
            {
                status: "Payé",
                color: "#2ecc71",
            },
            {
                status: "En cours de traitement",
                color: "blue"
            },
            {
                status: "Expédiée",
                color: "purple"
            },
            {
                status: "Livrée",
                color: "green"
            },
            {
                status: "Annulée",
                color: "red"
            }
        ],

        selectedOrder: null,

        editOrderModaleState: false,
        isEditingOrder: false,
        orderToEdit: null

    }),

    actions : {
        async getAllOrdersWithProducts() {
            try {
                const response = await axios.get(
                    "http://localhost:3000/commandes/produits",
                    { 
                        withCredentials: true,
                    }
                );
                console.log(response)
                await this.setListOrders(response.data);
            }
            catch(error) {
                console.error(error)
            }
        },

        async setListOrders(orders) {
            this.__ListOrders = orders;
            console.log("Commandes : ", this.__ListOrders);
        },

        async updateOrder(order) {
            const store = useStore();
            try{
                const csrfToken = await store.getCsrfToken();
                // Récupère l'id par "get" car product est un formData
                const response = await axios.put(`http://localhost:3000/commandes/${order.id}`, 
                    order,
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-Token": csrfToken,
                    }
                });
                console.log(response.data.order);
                if (response.status === 200 && response.data.order) {
                    this.updateOrderInList(response.data.order[0]);
                    store.sendSnackBar({
                        color: "success",
                        text: "Commande mise à jour avec succès !"
                    })
                }
            } catch(error) {
                console.error("Erreur lors de la mise à jour de la commande : ", error.message);
                store.sendSnackBar({
                    color: "error",
                    text: "Erreur lors de la mise à jour de la commande !"
                });
            }
        },

        async deleteOrder(order) {
            const store = useStore();
            try {
                const csrfToken = await store.getCsrfToken();
                const response = await axios.delete(`http://localhost:3000/produits/${order.id_commande}`,
                    {
                        withCredentials: true,
                        headers: {
                            "X-CSRF-Token": csrfToken
                        }
                    });
                    console.log(response);
                    if (response.status === 200) {
                        store.sendSnackBar({
                            color: "success",
                            text: "Commande supprimée avec succès !"
                        });
                        this.deleteOrderInList(order)
                    }
                    
            } catch (error) {
                console.error("Erreur lors de la suppression du produit : ", error)
                store.sendSnackBar({
                    color: "error",
                    text: "Erreur lors de la suppression du produit !"
                });
            }
        },

        updateOrderInList(updatedOrder) {
            const index = this.__ListOrders.findIndex(order => order.id_commande === updatedOrder.id_commande);

            if (index !== -1) {
                this.__ListOrders[index].statut = updatedOrder.statut
            }
        },
        addOrderInList(newOrder) {
            this.__ListOrders.push(newOrder);
        },

        deleteOrderInList(deletedOrder) {
            const index = this.__ListOrders.findIndex(order => order.id_commande === deletedOrder.id_commande);

            if (index !== -1) {
                this.__ListOrders.splice(index, 1);
            }
        },
        toggleEditOrderModale(order) {
            this.orderToEdit = order;
            this.editOrderModaleState = !this.editOrderModaleState;
        },

        getStatutColor(status) {
            const foundStatus = this.__ListStatus.find(item => item.status === status);

            return foundStatus ? foundStatus.color : 'gray';
        }

    }
});