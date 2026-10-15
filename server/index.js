const express = require("express");
const cors = require("cors");

const app = express();
// Si existe CLIENTE_URL (produccion) solo ese origen puede usar la API
app.use(cors({ origin: process.env.CLIENTE_URL || "*" }));
app.use(express.json());

// Datos en memoria (se pierden al reiniciar; ver index.mongodb.js para el Reto 4)
let tareas = [
  { id: 1, titulo: "Aprender React", completada: false },
  { id: 2, titulo: "Conectar con Node.js", completada: false },
];
let siguienteId = 3;

// GET - Obtener todas las tareas
app.get("/api/tareas", (req, res) => {
  res.json(tareas);
});

// POST - Crear una tarea
app.post("/api/tareas", (req, res) => {
  const { titulo } = req.body;
  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: "El titulo es obligatorio" });
  }
  const nueva = { id: siguienteId++, titulo: titulo.trim(), completada: false };
  tareas.push(nueva);
  res.status(201).json(nueva);
});

// PUT - Completar/descompletar y/o editar el titulo (Reto 3)
app.put("/api/tareas/:id", (req, res) => {
  const tarea = tareas.find((t) => t.id === Number(req.params.id));
  if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

  const { titulo, completada } = req.body;
  if (titulo !== undefined) {
    if (!String(titulo).trim()) {
      return res.status(400).json({ error: "El titulo es obligatorio" });
    }
    tarea.titulo = String(titulo).trim();
  }
  if (completada !== undefined) {
    tarea.completada = completada;
  } else if (titulo === undefined) {
    tarea.completada = !tarea.completada;
  }
  res.json(tarea);
});

// DELETE - Eliminar una tarea
app.delete("/api/tareas/:id", (req, res) => {
  const existe = tareas.some((t) => t.id === Number(req.params.id));
  if (!existe) return res.status(404).json({ error: "Tarea no encontrada" });
  tareas = tareas.filter((t) => t.id !== Number(req.params.id));
  res.status(204).send();
});

// Render asigna el puerto con la variable PORT
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API en el puerto ${PORT}`));
