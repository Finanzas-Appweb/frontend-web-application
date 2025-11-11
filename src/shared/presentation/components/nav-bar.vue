<script setup>
import { ref, onMounted } from 'vue'
import { Home, FileText, Calculator , Bus, Building, Activity, Users, LogOut, X, Menu, Settings } from 'lucide-vue-next'

const isOpen = ref(false)
const toggleMenu = () => (isOpen.value = !isOpen.value)

// Debug: Verifica en consola si se monta
onMounted(() => {
  console.log('¡Navbar montado correctamente! Deberías ver el botón en top-left.')
})
</script>

<template>
  <div>
    <!-- Botón flotante fijo (DEBERÍA VERSE SIEMPRE) -->
    <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle Menu">
      <component :is="isOpen ? X : Menu" size="36" class="menu-icon" />
    </button>
    <!-- Overlay -->
    <div v-if="isOpen" class="overlay" @click="toggleMenu"></div>
    <!-- Sidebar -->
    <aside :class="['sidebar', { open: isOpen }]">
      <nav>
        <div class="brandt">
          <img src="../../../../resources/img.png" width="60px" height="60px">

          <div>
            <div>
              <h3>Urbania 360</h3>
            </div>
            <div>
              <h4>workspaces</h4>
            </div>
          </div>
        </div>

        <ul>
          <li>
        
            <router-link to="/home">
              <Home />
              {{$t('nav-bar.home')}}
            </router-link>
          </li>
          <li>
            <router-link to="/clients">
              <Users />
              {{$t('nav-bar.clients')}}
            </router-link>
          </li>
          <li>
            <router-link to="/simulator">
              <Calculator  />
              {{$t('nav-bar.simulator')}}
            </router-link>
          </li>
          <li>
            <router-link to="/properties">
              <Bus />
              {{$t('nav-bar.properties')}}
            </router-link>
          </li>
          <li>
            <router-link to="/report">
              <Building />
              {{$t('nav-bar.reports')}}
            </router-link>
          </li>
          <li>
            <router-link to="/setting">
              <Settings />
              {{$t('nav-bar.settings')}}
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="international">
        <!-- PvButton global; si error, usa <button> simples -->
        <pv-button class="en-btn" @click="$i18n.locale = 'en'">EN</pv-button>
        <pv-button class="es-btn" @click="$i18n.locale = 'es'">ES</pv-button>
      </div>
      <div class="logout1">
        <router-link to="/login">
          <LogOut />
          Log Out
        </router-link>
      </div>

    </aside>
  </div>
</template>

<!-- Tus estilos quedan IGUALES (con la corrección de align-items que ya tienes) -->
<style scoped>
.menu-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 2000;
  background: #ffffff;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.international {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.en-btn,
.es-btn {
  background-color: #576b81;
  color: white;
  border: none;
  border-radius: 100px;
  padding: 8px 16px;  /* Para que se vean bien */
}

.menu-toggle:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

.menu-icon {
  color: #333;
  transition: color 0.3s ease;
}

.menu-toggle:hover .menu-icon {
  color: #007bff;
}

.sidebar {
  position: fixed;
  top: 0;
  left: -260px;
  width: 260px;
  height: 100%;
  background: #2D6697;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
  padding: 90px 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: left 0.3s ease;
  z-index: 1500;
}

.sidebar.open {
  left: 0;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar nav li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.3s;
}

.sidebar nav li a {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  text-decoration: none;
  width: 100%;
}

.sidebar nav li:hover {
  background: #d5e2ea;
  box-shadow: 10px 5px 40px rgba(82, 159, 159, 0.28);
}

.logout {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  font-weight: 600;
  margin-top: 30px;
  cursor: pointer;
  padding: 12px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logout1:hover {
  background: #2D6697;
  color: #ff4242;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}
img{
  border-radius: 10px;
}
.brandt {
  display: flex;
  color: white;
  font-family: 'Roboto', sans-serif;
  align-content: center;
  gap: 20px;
  margin-top: 0px;

}

</style>