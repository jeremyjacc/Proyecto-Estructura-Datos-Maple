/**
 * dataLoader.js — Carga los JSON y construye Tree + Graph
 *
 * Conecta los datos estáticos con nuestras estructuras manuales.
 * Se ejecuta una vez al iniciar la app.
 */
import { Tree } from '../structures/Tree.js';
import { Graph } from '../structures/Graph.js';

const CONTINENT_FILES = ['europe', 'asia', 'americas', 'africa', 'oceania'];

/**
 * Cargar todos los datos y construir las estructuras.
 * @returns {{ tree: Tree, graph: Graph, allCities: Array, continents: Array }}
 */
export async function loadAllData() {
  const tree = new Tree();
  const graph = new Graph();
  const allCities = [];
  const continents = [];

  // Cargar todos los JSON en paralelo
  const responses = await Promise.all(
    CONTINENT_FILES.map((file) =>
      fetch(`/data/${file}.json`).then((r) => r.json())
    )
  );

  for (const data of responses) {
    const { continent, countries, connections } = data;
    continents.push(continent);

    // Insertar continente en el Tree
    tree.insert('world', continent.key, {
      name: continent.name,
      description: continent.description,
      emoji: continent.emoji,
    }, 'continent');

    // Insertar países y ciudades
    for (const country of countries) {
      tree.insert(continent.key, country.key, {
        name: country.name,
        emoji: country.emoji,
      }, 'country');

      for (const city of country.cities) {
        // Insertar ciudad en el Tree
        tree.insert(country.key, city.key, {
          name: city.name,
          country: city.country,
          continent: city.continent,
          description: city.description,
          budgetPerDay: city.budgetPerDay,
          recommendedDays: city.recommendedDays,
          currency: city.currency,
          language: city.language,
          bestSeason: city.bestSeason,
          image: city.image,
        }, 'city');

        // Insertar atracciones, hoteles y restaurantes
        for (const attraction of (city.attractions || [])) {
          tree.insert(city.key, attraction.key, { ...attraction }, 'attraction');
        }
        for (const hotel of (city.hotels || [])) {
          tree.insert(city.key, hotel.key, { ...hotel }, 'hotel');
        }
        for (const restaurant of (city.restaurants || [])) {
          tree.insert(city.key, restaurant.key, { ...restaurant }, 'restaurant');
        }

        // Agregar ciudad al Graph (nodo)
        if (!graph.getNode(city.key)) {
          graph.addNode(city.key, {
            name: city.name,
            country: city.country,
            continent: city.continent,
          });
        }

        // Agregar a la lista plana de ciudades
        allCities.push({
          key: city.key,
          name: city.name,
          country: city.country,
          continent: city.continent,
          description: city.description,
          budgetPerDay: city.budgetPerDay,
          recommendedDays: city.recommendedDays,
          currency: city.currency,
          language: city.language,
          bestSeason: city.bestSeason,
          image: city.image,
          attractions: city.attractions || [],
          hotels: city.hotels || [],
          restaurants: city.restaurants || [],
        });
      }
    }

    // Agregar conexiones al Graph (aristas)
    for (const conn of (connections || [])) {
      try {
        graph.addEdge(conn.from, conn.to, {
          distance: conn.distance,
          cost: conn.cost,
        });
      } catch {
        // Skip if nodes don't exist (cross-continent connections)
      }
    }
  }

  return { tree, graph, allCities, continents };
}
