<h1>Urbania 360 - Simulador Financiero Inmobiliario</h1>

Este proyecto es una aplicación web desarrollada en Vue.js como parte del Trabajo Final del curso 1ASI0642 - Finanzas e Ingeniería Económica.

La aplicación implementa un simulador de crédito hipotecario (basado en el método francés y lineamientos del Fondo MiVivienda) y un panel de control para la gestión de clientes y propiedades por parte de una empresa inmobiliaria.
* <strong>1. Características Principales</strong>
    * Autenticación: Sistema de Login y Registro de usuarios (inmobiliaria).
    * Gestión de Clientes: CRUD (Crear, Leer, Actualizar, Borrar) para la cartera de clientes.
    * Gestión de Propiedades: CRUD para las propiedades (casas, departamentos) en venta.
    * Simulador Financiero:
      * Cálculo de crédito hipotecario (Método Francés).

      * Soporte para Soles y Dólares.

      * Soporte para tasas de interés efectivas y nominales.

      * Inclusión de periodos de gracia (parcial y total).

      * Cálculo de indicadores clave: VAN, TIR, TCEA.
    * Panel de Reportes: Visualización de métricas de negocio con gráficos (usando Chart.js).

    * Configuración: Panel para editar el perfil de usuario y gestionar las tasas de entidades financieras.
    * 
--> Download the packages bellow
<br>
* npm install
* npm install -g json-server
* npm install vue-chartjs chart.js
* npm install @faker-js/faker
* npm install chart.js vue-chartjs@^5



--> To run, up the fakeapi and put the next command
<br>
* json-server --watch fixtures/db.json --port 3536
* npm run dev

