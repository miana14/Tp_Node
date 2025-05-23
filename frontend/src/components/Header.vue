<template>
    <v-app-bar>
        <v-container class="d-flex align-center justify-space-between">
            <!-- Logo et Titre -->
            <div class="d-flex align-center">
                <v-app-bar-nav-icon v-if="isMobile" @click="toggleDrawer"></v-app-bar-nav-icon>
                <router-link to="/" class="d-flex align-center">
                  <v-img :src="logo" contain height="50" width="50" class="me-3"></v-img>
                  <v-spacer></v-spacer>
                  <v-app-bar-title v-if="!isMobile" style="min-width: 120px;" class="text-black">PawShop</v-app-bar-title>                  
              </router-link>

            </div>
            <!-- Liens desktop -->
            <div class="d-flex align-center">
                <v-btn v-if="!isMobile" variant="text" to="/">Accueil</v-btn>
                <v-btn v-if="!isMobile" variant="text" to="/boutique">Boutique</v-btn>
                <v-btn v-if="!isMobile" variant="text" to="/contact">Contact</v-btn>                
            </div>
            <!-- Icones -->
            <div class="d-flex align-center">
              <v-menu v-if="isAuthenticated" offset-y>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props">
                    <v-icon size="32">mdi-account-outline</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item :to="`/profil/${authStore.user.id}`">
                    <v-list-item-title>Mon Profil</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="handleLogout(router)">
                    <v-list-item-title>Déconnexion</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn v-else to="/login">
                <v-icon size="32" >mdi-account-outline</v-icon>
              </v-btn>
                <v-btn stacked to="/panier">
                  <v-badge v-if="quantityInCart > 0" color="success" :content="quantityInCart">
                    <v-icon size="32">mdi-cart-outline</v-icon>                    
                  </v-badge>
                  <v-icon v-else size="32">mdi-cart-outline</v-icon>                    
                </v-btn>
                <v-btn v-if="isAdmin" to="/admin">
                    <v-icon size="32">mdi-police-badge-outline</v-icon>
                </v-btn>
            </div>            
        </v-container>
    </v-app-bar>
  
    <!-- Menu Burger -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item to="/" @click=toggleDrawer>Accueil</v-list-item>
        <v-list-item to="/boutique" @click=toggleDrawer>Boutique</v-list-item>
        <v-list-item to="/contact" @click=toggleDrawer>Contact</v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script setup>
  import { ref, computed, useSSRContext } from 'vue'
  import { storeToRefs } from 'pinia';
  import { useDisplay } from 'vuetify'
  import { useAuthStore } from '../stores/authStore';
  import logo from '../assets/images/logo.png';
  import {useRouter} from 'vue-router';
  import { useOrderStore } from '../stores/orderStore';
  
  const { mobile } = useDisplay() // Détecte si on est sur mobile
  const isMobile = computed(() => mobile.value) // Variable réactive pour mobile
  const drawer = ref(false) // Gère l'ouverture du menu mobile
  const authStore = useAuthStore();
  const orderStore = useOrderStore();
  const {quantityInCart} = storeToRefs(orderStore);
  const router = useRouter()

  const isAuthenticated = computed(() => authStore.user !== null);
  const isAdmin = computed(() => authStore.user?.role === 1);

  function toggleDrawer() {
    drawer.value = !drawer.value
  }

  function handleLogout(router) {
    authStore.logout(router)
  }
  </script>

<style scoped>

</style>