<script>
import FooterContent from "../../../shared/presentation/components/footer-content.vue";
import { register } from "../services/auth.service.js";


export default {
  name: "Register.component",
  components: { FooterContent },
  data() {
    return {
      formData: {
        username: '',
        nombres: '',
        apellidos: '',
        dni: '',
        telefono: '',
        email: '',
        password: ''
      }
    };
  },
  methods: {
    async handleRegister() {
      const { username, nombres, apellidos, dni, telefono, email, password } = this.formData;

      if (!username || !nombres || !apellidos || !dni || !telefono || !email || !password) {
        alert('Por favor completa todos los campos');
        return;
      }

      if (dni.length !== 8 || !/^\d+$/.test(dni)) {
        alert('El DNI debe tener 8 dígitos');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Por favor ingresa un correo válido');
        return;
      }

      const newUser = {
        username,
        firstName: nombres,
        lastName: apellidos,
        dni,
        phone: telefono,
        email,
        password
      };

      try {
        const response = await register(newUser);
        console.log("Usuario registrado:", response);

        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        this.$router.push("/login"); // ✅ redirige al login después del registro
      } catch (error) {
        console.error("Error al registrar:", error);
        alert("Hubo un error al registrar el usuario.");
      }
    }
  }
};
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-box">
          <img src="../../../../resources/img.png" alt="Logo 360">
        </div>
        <h1>Urbania360</h1>
        <h2>Crear Cuenta</h2>
      </div>

      <!-- Inputs -->
      <div class="input-group">
        <input v-model="formData.username" type="text" placeholder="Nombre de usuario" class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="formData.nombres" type="text" placeholder="Nombres" class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="formData.apellidos" type="text" placeholder="Apellidos" class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="formData.dni" type="text" placeholder="Número de DNI" class="input-field" maxlength="8" />
      </div>

      <div class="input-group">
        <input v-model="formData.telefono" type="tel" placeholder="Teléfono" class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="formData.email" type="email" placeholder="Correo Electrónico" class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="formData.password" type="password" placeholder="Contraseña" class="input-field" />
      </div>

      <!-- Botón -->
      <button @click="handleRegister" class="register-btn">
        Registrarse
      </button>

      <!-- Footer -->
      <div class="footer">
        <p>¿Ya tienes una cuenta?</p>
        <RouterLink to="/login">Iniciar sesión</RouterLink>
      </div>
    </div>
  </div>

  <footer-content></footer-content>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #377FBD 0%, #5BA3D0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.register-card {
  background-color: white;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 440px;
  margin: 20px;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-box {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  background: #377FBD;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(55, 127, 189, 0.3);
  overflow: hidden;
}

.logo-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-section h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.logo-section h2 {
  margin: 0;
  color: #4A88B8;
  font-size: 18px;
  font-weight: 500;
}

.input-group {
  margin-bottom: 16px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
  color: #4A88B8;
  font-weight: 500;
  background-color: rgba(202, 202, 202, 0.59);
}

.input-field:focus {
  border-color: #377FBD;
}

.input-field::placeholder {
  color: #4A88B8;
  font-weight: 500;
}

.register-btn {
  width: 100%;
  padding: 13px;
  margin-top: 8px;
  background-color: #4A6FA3;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(74, 111, 163, 0.3);
}

.register-btn:hover {
  background-color: #3D5B89;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 111, 163, 0.4);
}

.register-btn:active {
  transform: translateY(0);
}

.footer {
  text-align: center;
  margin-top: 25px;
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

@media (max-width: 600px) {
  .register-card {
    padding: 35px 25px;
  }

  .logo-section h1 {
    font-size: 24px;
  }

  .logo-section h2 {
    font-size: 16px;
  }

  .input-field {
    padding: 11px 14px;
    font-size: 13px;
  }

  .input-group {
    margin-bottom: 14px;
  }
}
</style>
