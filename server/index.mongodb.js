// RETO 4: misma API pero guardando en MongoDB Atlas (persistencia real).
// Uso:  npm run dev:mongo   (necesita server/.env con MONGODB_URI)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors({ origin: process.env.CLIENTE_URL || "*" }));
app.use(express.json());

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  completada: { type: Boolean, default: false },
});
// Mongo usa _id; lo exponemos como "id" para que el frontend no cambie
tareaSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
const Tarea = mongoose.model("Tarea", tareaSchema);

// Atrapa errores de funciones async y los manda al manejador de errores
const ah = (fn) => (req, res, next) => fn(req, res, next).catch(next);

app.get("/api/tareas", ah(async (req, res) => {
  res.json(await Tarea.find().sort({ _id: 1 }));
}));

app.post("/api/tareas", ah(async (req, res) => {
  const { titulo } = req.body;
  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: "El titulo es obligatorio" });
  }
  res.status(201).json(await Tarea.create({ titulo }));
}));

app.put("/api/tareas/:id", ah(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  const tarea = await Tarea.findById(req.params.id);
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
  await tarea.save();
  res.json(tarea);
}));

app.delete("/api/tareas/:id", ah(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  const borrada = await Tarea.findByIdAndDelete(req.params.id);
  if (!borrada) return res.status(404).json({ error: "Tarea no encontrada" });
  res.status(204).send();
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error del servidor" });
});

const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado a MongoDB");
    app.listen(PORT, () => console.log(`API en el puerto ${PORT}`));
  })
  .catch((err) => {
    console.error("No se pudo conectar a MongoDB:", err.message);
    process.exit(1);
  });
