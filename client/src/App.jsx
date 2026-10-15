import { useEffect, useState } from "react";
import Formulario from "./components/Formulario.jsx";
import ListaTareas from "./components/ListaTareas.jsx";

// En produccion (Vercel) viene de VITE_API_URL; en local usa localhost
const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api/tareas";

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar tareas al montar el componente
  useEffect(() => {
    cargarTareas();
  }, []);

  async function cargarTareas() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("No se pudieron cargar las tareas");
      setTareas(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function agregarTarea(titulo) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    });
    if (!res.ok) return;
    const nueva = await res.json();
    setTareas([...tareas, nueva]);
  }

  async function eliminarTarea(id) {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setTareas(tareas.filter((t) => t.id !== id));
  }

  async function toggleTarea(id) {
    const tarea = tareas.find((t) => t.id === id);
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completada: !tarea.completada }),
    });
    if (!res.ok) return;
    const actualizada = await res.json();
    setTareas(tareas.map((t) => (t.id === id ? actualizada : t)));
  }

  // RETO 3: editar el titulo
  async function editarTarea(id, titulo) {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    });
    if (!res.ok) return;
    const actualizada = await res.json();
    setTareas(tareas.map((t) => (t.id === id ? actualizada : t)));
  }

  // RETO 2: eliminar todas las completadas (varios DELETE seguidos)
  async function eliminarCompletadas() {
    const aEliminar = tareas.filter((t) => t.completada);
    const resultados = await Promise.all(
      aEliminar.map((t) =>
        fetch(`${API}/${t.id}`, { method: "DELETE" }).then((r) => ({ id: t.id, ok: r.ok }))
      )
    );
    const borradas = resultados.filter((r) => r.ok).map((r) => r.id);
    setTareas(tareas.filter((t) => !borradas.includes(t.id)));
  }

  if (cargando) return <p className="estado">Cargando...</p>;
  if (error) return <p className="estado">❌ {error}</p>;

  // RETO 1: contador
  const completadas = tareas.filter((t) => t.completada).length;

  return (
    <main className="contenedor">
      <h1>✅ Mis tareas</h1>
      <Formulario onAgregar={agregarTarea} />

      <p className="contador">
        {completadas} de {tareas.length} tareas completadas
      </p>

      {completadas > 0 && (
        <button className="btn-limpiar" onClick={eliminarCompletadas}>
          Eliminar completadas
        </button>
      )}

      <ListaTareas
        tareas={tareas}
        onEliminar={eliminarTarea}
        onToggle={toggleTarea}
        onEditar={editarTarea}
      />
    </main>
  );
}
