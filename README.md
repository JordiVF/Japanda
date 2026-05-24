# Japanda - Guía de Instalación y Uso

---

## 1º Paso - Clonar Repositorio

Dirígete a la carpeta de tu ordenador en la que quieras clonar el proyecto.

Después abres una terminal dentro de la carpeta elegida (abriendo una terminal desde el buscador de Windows y usando el comando `cd` para moverte hasta la carpeta elegida o haciendo click derecho dentro de la carpeta y seleccionando **Abrir Terminal**).

Después pones el siguiente comando en la terminal:

```bash
git clone https://github.com/JordiVF/Japanda.git
```

---

## 2º Paso - Instalar dependencias

Una vez clonado el repositorio tendrás dos carpetas: **backend** y **frontend**. Tendrás que instalar las dependencias de cada parte del proyecto.

Empezando con **backend**: desde la terminal nos movemos a backend con el comando:

```bash
cd ./backend/
```

Dentro de backend usamos el comando:

```bash
npm install
```

Una vez instaladas todas las dependencias cambiamos a la carpeta **frontend** y repetimos el mismo proceso.

Usamos `cd ..` para volver a la carpeta padre y después `cd ./frontend/` para entrar en la carpeta frontend, una vez dentro volvemos a usar:

```bash
npm install
```

---

## 3º Paso - Iniciar el proyecto

Ahora aprovechando que ya estamos dentro de la carpeta **frontend**, escribimos el comando:

```bash
npm run dev
```

Con esto iniciaremos el frontend del proyecto y nos dará un enlace [http://localhost:5173/](http://localhost:5173/) que podremos copiar y pegar en el navegador deseado para verlo.

Solo faltaría volver a la carpeta **backend** usando los mismos pasos mencionados anteriormente y volver a escribir `npm run dev` dentro de la carpeta backend para que se inicialice:

```bash
npm run dev
```

Con eso ya tendríamos el proyecto desplegado y listo para revisión.
