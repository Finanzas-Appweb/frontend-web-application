import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material';
import 'primeicons/primeicons.css';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import i18n from "./i18n.js";
import 'primeicons/primeicons.css';



createApp(App)
    .use(i18n)
    .use(PrimeVue, {ripple:true, theme:{preset:Material}})
    .use(router)
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-inputText', InputText)
    .component('pv-select-button', SelectButton)
    .mount('#app')
