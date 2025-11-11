<script>
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  }
}
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="brand">
        <h3>Urbania360</h3>
        <p>{{ $t('footer.copyright') }}</p>
      </div>

      <div class="social-icons">
        <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="icon instagram"
        >
          <i class="pi pi-instagram"></i>
        </a>

        <a
            href="https://www.x.com"
            target="_blank"
            rel="noopener noreferrer"
            class="icon x"
        >
          <i class="pi pi-twitter"></i>
        </a>

        <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            class="icon facebook"
        >
          <i class="pi pi-facebook"></i>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  background-color: #1c4163;
  color: white;
  padding: 1.2rem ;
  width: 100%;
  text-align: center;


}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1rem;
}

.brand h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.brand p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.social-icons {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 0;
  padding: 0;
}

.icon {
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
  -moz-outline-style: none;
  outline-style: none;
}
.icon,
.icon * {
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  border: none !important;
}

.icon {
  font-size: 1.5rem;
  color: white;
  transition: transform 0.18s ease, color 0.25s ease, box-shadow 0.25s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: 50%;
  background: transparent;
}

.icon:hover {
  transform: scale(1.1);
}

.icon:active {
  transform: scale(1.05);
  box-shadow: none !important;
  background: transparent !important;
}



.icon.instagram:hover {
  color: #e4405f;
  box-shadow: 0 5px 30px rgba(228, 64, 95, 0.28);
}

.icon.x:hover {
  color: #020f15;
  box-shadow: 0 5px 30px rgba(29, 161, 242, 0.28);
}

.icon.facebook:hover {
  color: #1877f2;
  box-shadow: 0 5px 30px rgba(24, 119, 242, 0.28);
}

@media (max-width: 600px) {
  .footer-content {
    gap: 1rem;
  }

  .social-icons {
    margin-top: 0.5rem;
  }
}
</style>
