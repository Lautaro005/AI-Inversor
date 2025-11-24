# AI-Inversor

Aplicación construida con [Astro](https://astro.build/), React y Tailwind para generar análisis institucionales asistidos por LLMs. La interfaz replica el flujo solicitado (landing, ajustes, dashboard) utilizando componentes modulares para facilitar mantenibilidad y futuras iteraciones.

## Requisitos

- Node.js 18 o superior.
- npm (incluido con Node).

## Scripts disponibles

- `npm install`: instala las dependencias si aún no existen.
- `npm run dev`: levanta el servidor de desarrollo en `http://localhost:4321`.
- `npm run build`: genera la versión lista para producción en `./dist`.
- `npm run preview`: sirve la última compilación para verificación.

## Arquitectura

- `src/pages/index.astro`: entrada de Astro, monta el componente React `EquityApp`.
- `src/components/app/`: contiene los módulos del dominio (`EquityApp`, modal de ajustes, landing, dashboard, helpers, constantes, tipos, etc.).
- `src/styles/global.css`: hoja global que importa Tailwind v4.

## Configuración

1. Abre el modal “Ajustes y API”.
2. Selecciona proveedor, modelo, idioma y profundidad del análisis.
3. Introduce una API Key válida para el proveedor elegido.
4. Guarda y lanza el análisis desde la landing introduciendo ticker, objetivo y tesis.

El cliente ejecuta la llamada a la API configurada; asegúrate de que las credenciales permitan peticiones desde el navegador.
