<script>
import axios from "axios"
import FooterContent from "../../../shared/presentation/components/footer-content.vue"

export default {
  name: "login.component",
  components: { FooterContent },
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        alert('Por favor completa todos los campos')
        return
      }

      try {
        // URL de tu fake API
        const response = await axios.get(`http://localhost:3536/users?username=${this.username}&password=${this.password}`)

        if (response.data.length > 0) {
          const user = response.data[0]
          console.log('✅ Usuario autenticado:', user)

          // Guardamos el usuario en localStorage
          localStorage.setItem('urbania360:user', JSON.stringify(user))

          // Redirigimos al dashboard de clientes
          this.$router.push('/clients')
        } else {
          alert('Usuario o contraseña incorrectos')
        }
      } catch (error) {
        console.error('❌ Error al conectar con la API:', error)
        alert('Error al iniciar sesión. Verifica la conexión con el servidor.')
      }
    },

    goToRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-box">
          <img src="../../../../resources/img.png" alt="Logo 360">
        </div>
        <h1>Urbania360</h1>
        <p>Bienvenido de vuelta</p>
      </div>

      <!-- Inputs -->
      <div class="input-group">
        <input
            v-model="username"
            type="text"
            placeholder="Nombre de usuario"
            class="input-field"
        />
      </div>

      <div class="input-group">
        <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            class="input-field"
            @keyup.enter="handleLogin"
        />
      </div>

      <button @click="handleLogin" class="login-btn">
        Iniciar sesión
      </button>

      <div class="footer">
        <p>¿No tienes una cuenta?</p>
        <router-link to="/register">Crear cuenta</router-link>
      </div>
    </div>
  </div>

  <footer-content></footer-content>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #377FBD 0%, #5BA3D0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.login-card {
  background-color: white;
  border-radius: 20px;
  padding: 50px 60px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 440px;
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 35px;
}

.logo-box {
  width: 90px;
  height: 90px;
  margin: 0 auto 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 10px rgba(55, 127, 189, 0.3);
  overflow: hidden;
}

.logo-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-section h1 {
  margin: 0 0 5px 0;
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
}

.logo-section p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Inputs */
.input-group {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 14px 18px;
  font-size: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #377FBD;
}

.input-field::placeholder {
  color: #999;
}

/* Botón */
.login-btn {
  width: 100%;
  padding: 14px;
  margin-top: 8px;
  background-color: #2D6BA1;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(45, 107, 161, 0.3);
}

.login-btn:hover {
  background-color: #255A8A;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(45, 107, 161, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

/* Footer */
.footer {
  text-align: center;
  margin-top: 30px;
  font-size: 14px;
}

.footer p {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-weight: 500;
}

.footer a {
  color: #377FBD;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.footer a:hover {
  color: #2D6BA1;
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    padding: 40px 30px;
    margin: 20px;
  }

  .logo-section h1 {
    font-size: 28px;
  }
}
</style>