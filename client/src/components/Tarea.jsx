import { useRef, useState } from "react";

export default function Tarea({ tarea, onEliminar, onToggle, onEditar }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(tarea.titulo);
  const temporizador = useRef(null);

  // Clic simple = completar. Se espera un instante por si es doble clic,
  // para no marcar/desmarcar la tarea al entrar en modo edicion.
  function manejarClic() {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(onToggle, 250);
  }

  function manejarDobleClic() {
    clearTimeout(temporizador.current);
    setTexto(tarea.titulo);
    setEditando(true);
  }

  function guardar() {
    const limpio = texto.trim();
    if (limpio && limpio !== tarea.titulo) onEditar(limpio);
    else setTexto(tarea.titulo);
    setEditando(false);
  }

  return (
    <li className={tarea.completada ? "tarea completada" : "tarea"}>
      {editando ? (
        <input
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={guardar}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setTexto(tarea.titulo);
              setEditando(false);
            }
          }}
        />
      ) : (
        <span
          onClick={manejarClic}
          onDoubleClick={manejarDobleClic}
          title="Clic: completar · Doble clic: editar"
        >
          {tarea.titulo}
        </span>
      )}
      <button onClick={onEliminar} className="btn-eliminar" title="Eliminar">
        🗑️
      </button>
    </li>
  );
}
