import { createRouter, createWebHistory } from 'vue-router'
import RegisterComponent from "../domains/authentication/components/Register.component.vue";
import loginComponent from "../domains/authentication/components/Login.component.vue";
import clientsComponent from "../domains/clients/components/clients.component.vue";
import Home from "../views/Home.vue";
import propertiesComponent from "../domains/properties/components/properties.component.vue";
import reportComponent from "../domains/reports/components/reports.component.vue";
import settingComponent from "../domains/settings/components/settings.component.vue";
import simulatorComponent from "../domains/simulator/components/simulator.component.vue";
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path:"/", redirect: "/login"},
        {path: '/login', component: loginComponent },
        {path: '/home', component: Home},
        {path: '/register', component: RegisterComponent },
        {path:'/clients', component: clientsComponent},
        { path: '/properties', component: propertiesComponent },
        { path: '/simulator', component: simulatorComponent },
        { path: '/report', component: reportComponent },
        { path: '/setting', component: settingComponent },

    ]
})

/*router.beforeEach((to) => {
    if (to.name !== 'home') return true
    try { if (!JSON.parse(localStorage.getItem('kapakid:user')||'null')) return { name:'login' } }
    catch { return { name:'login' } }
    return true
})*/

export default router