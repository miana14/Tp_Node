import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import LoginView from './views/LoginView.vue';
import HomeView from './views/HomeView.vue';
import ShopView from './views/ShopView.vue';
import ContactView from './views/ContactView.vue';
import AdminView from './views/AdminView.vue';
import ProductDetailView from './views/ProductView.vue';
import CartView from './views/CartView.vue';
import ProfileView from './views/ProfileView.vue';
import OrderView from './views/OrderView.vue';


const routes = [
    { path: '/login', component: LoginView, name: 'Login' },
    { path: '/boutique', component: ShopView, name: 'Boutique' },
    { path: '/contact', component: ContactView, name: 'Contact' },
    { path: '/admin', component: AdminView, name: 'Admin', meta: {requiresAdmin: true} },
    { path: '/produit/:id', component: ProductDetailView, name: 'ProductDetail' },
    { path: '/panier', component: CartView, name: 'Cart' },
    { path: '/profil/:id', component: ProfileView, name: 'Profil' },
    { path: '/commande', component: OrderView, name: 'Commande', meta: {requiresAuth: true} },
    { path: '/', component: HomeView, name: 'Home'},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
  });

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore(); // Récupère l'état d'authentification
  if (!authStore.user) {
    await authStore.initializeAuth(); 
  }
  if (to.meta.requiresAuth && !authStore.user) {
    next('login');
  }
  else {
    next()
  }
  const isAdmin = authStore.user?.role === 1; // Vérifie le rôle
  
  if (to.meta.requiresAdmin && !isAdmin) {
      next("/"); // Redirige vers l'accueil si l'utilisateur n'est pas admin
  } else {
      next(); // Autorise l'accès
  }
});

export default router;