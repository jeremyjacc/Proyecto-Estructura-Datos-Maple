# Proyecto Final: Estructura de Datos - Agencia de Viajes ✈️

Bienvenido al repositorio del proyecto final para la asignatura de **Estructura de Datos**. Este sistema informático simula una plataforma interactiva para una Agencia de Viajes (gestión de destinos, itinerarios y paquetes turísticos), diseñada aplicando las diferentes estructuras de datos aprendidas a lo largo del semestre de manera óptima y sin utilizar librerías de terceros para su lógica interna.

---

## 🛠️ Cómo ejecutar el programa (Manual de Usuario)

Para correr este proyecto en tu computadora, necesitas tener instalado **Node.js**.

1. **Abrir la terminal** y navegar hasta la carpeta del proyecto:
   ```bash
   cd Proyecto-Estructura-Datos-Maple
   ```
2. **Instalar las dependencias** del proyecto:
   ```bash
   npm install
   ```
3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
4. **Abrir la aplicación**:
   Una vez que el servidor esté corriendo, abre tu navegador web y visita la dirección que aparece en la terminal (generalmente es `http://localhost:5173`).

---

## 🏗️ Para qué sirve cada componente (Estructuras de Datos)

Todo el corazón lógico de la aplicación reside en la carpeta `src/structures`. A continuación, se detalla la función de cada estructura implementada:

### 1. Arreglo Dinámico (`DynamicArray.js`)
* **Uso:** Almacena la colección de "Travel Boards" (tableros de viaje personalizados) del usuario.
* **Justificación:** Los arreglos permiten acceder a cualquier tablero instantáneamente a través de su índice ($O(1)$). El tamaño dinámico evita desperdiciar memoria, ya que crece automáticamente solo cuando el usuario crea nuevos tableros.

### 2. Lista Enlazada (`LinkedList.js`)
* **Uso:** Administra los paquetes turísticos (inserción, lectura, actualización y eliminación - CRUD).
* **Justificación:** Permite insertar o remover paquetes sin necesidad de desplazar elementos consecutivos (como sucedería en un arreglo clásico), proporcionando una gestión de memoria mucho más ágil y eficiente al tratar con listas que cambian constantemente de tamaño.

### 3. Pila / Stack (`Stack.js`)
* **Uso:** Implementa el sistema de "Deshacer" (Undo) de acciones del usuario dentro de los tableros.
* **Justificación:** Utiliza una lógica **LIFO** (Último en entrar, primero en salir). Así se garantiza que la última acción que realizaste sea exactamente la primera en revertirse.

### 4. Cola / Queue (`Queue.js`)
* **Uso:** Organiza las ciudades o destinos pendientes por visitar en un itinerario.
* **Justificación:** Utiliza una lógica **FIFO** (Primero en entrar, primero en salir). Conserva el orden cronológico lógico en el que el usuario planifica su viaje.

### 5. Árbol (`Tree.js`)
* **Uso:** Representa el mapa jerárquico de lugares (Mundo > Continente > País > Ciudad > Punto de Interés).
* **Justificación:** La estructura ideal para representar datos categóricos. Permite buscar destinos rápidamente utilizando algoritmos de recorrido en profundidad (DFS) o anchura (BFS).

### 6. Grafo (`Graph.js`)
* **Uso:** Mapa de interconexiones y redes de rutas turísticas.
* **Justificación:** Es un grafo dirigido con pesos. Permite relacionar una ciudad con otra determinando conexiones directas, calculando distancias (pesos) o costos de transporte entre puntos, un problema clásico e indispensable en aplicaciones de viajes.

---

## 🔍 Algoritmos Incluidos (`src/algorithms`)

Además de las estructuras, el proyecto integra los siguientes algoritmos para optimizar la manipulación de datos:

* **Búsqueda (Searching):** Integración de búsqueda lineal (para filtros de texto flexibles) y búsqueda binaria para datos ordenados.
* **Ordenamiento (Sorting):** Se implementaron **MergeSort** (estable) y **QuickSort** (muy rápido) para organizar listas de destinos, precios o prioridades eficientemente.
