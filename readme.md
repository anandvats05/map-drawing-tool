# 🗺️ Map Drawing Tool (React + Leaflet + Leaflet.Draw)

A web application that renders **OpenStreetMap free tiles** and allows users to **draw and manage geometrical features** (Polygon, Rectangle, Circle, LineString) on the map.

The system ensures **non-overlapping polygons** and provides an option to **export all drawn features as a GeoJSON file**.

---

## 🚀 Features
- Draw **Polygon, Rectangle, Circle, and LineString** on the map.
- Smooth click-and-drag support for rectangles and circles.
- Shapes styled with custom colors and stored in a global state.
- Prevents overlapping polygons (explained below).
- Metadata popup for each shape (ID, type, timestamp).
- Export drawn features as **GeoJSON**.

---

## 🛠️ Tech Stack
- [React](https://react.dev/) (Frontend)
- [Leaflet](https://leafletjs.com/) (Map rendering)
- [Leaflet.Draw](https://leaflet.github.io/Leaflet.draw/) (Drawing tools)
- [OpenStreetMap](https://www.openstreetmap.org/) (Free map tiles)
- Zustand (state management)

---

## 📦 Setup & Run Instructions

1. Clone this repository:
  
   cd project
2. Install dependencies:

    npm install
3. Run the development server:

    npm run dev
4. Open in your browser:

    http://localhost:5173