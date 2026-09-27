/**
 * clientes.js
 * ------------------------------------------------------------
 * Funciones de la página clientes.html.
 *
 * Permite:
 * - Cargar clientes de ejemplo la primera vez.
 * - Mostrar los clientes guardados en localStorage.
 * - Buscar clientes en tiempo real.
 * - Editar un cliente desde el botón flotante.
 * - Eliminar un cliente.
 */

// Nombre de la colección de clientes dentro de localStorage.
const CLIENTES_KEY = 'acme_clientes';

// Datos iniciales: se usan solamente si todavía no existen clientes guardados.
const CLIENTES_INICIALES = [
  { id: 'CLI-001', nombre: 'Juan', apellido: 'Perez', direccion: 'Calle 10 #15-20', correo: 'juan@gmail.com', telefono: '3000000000' },
  { id: 'CLI-002', nombre: 'Andres', apellido: 'Ortiga', direccion: 'Calle 9 #15-20', correo: 'andres@gmail.com', telefono: '3010000000' },
  { id: 'CLI-003', nombre: 'Carlos', apellido: 'Sanza', direccion: 'Calle 10 #15-30', correo: 'carlos@gmail.com', telefono: '3020000000' },
  { id: 'CLI-004', nombre: 'Maria', apellido: 'Martinez', direccion: 'Cra 10 #15-20', correo: 'maria@gmail.com', telefono: '3030000000' }
];

// Inicia la tabla y el buscador cuando el HTML ya está cargado.
document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(CLIENTES_KEY, CLIENTES_INICIALES);
  renderizarClientes(Storage.getAll(CLIENTES_KEY));
  configurarBuscador();
});

// Dibuja las filas de clientes y agrega los botones flotantes.
function renderizarClientes(clientes) {
  const tbody = document.querySelector('#tabla-clientes tbody');

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No se encontraron clientes.</td></tr>';
    return;
  }

  tbody.innerHTML = clientes.map(cliente => `
    <tr>
      <td>${escaparHtml(cliente.nombre)}</td>
      <td>${escaparHtml(cliente.apellido)}</td>
      <td>${escaparHtml(cliente.direccion)}</td>
      <td>${escaparHtml(cliente.correo)}</td>
      <td class="celda-disponible">
        ${escaparHtml(cliente.telefono)}

        <!-- Botones que aparecen flotando al pasar el mouse por la fila. -->
        <span class="icono-flotante-wrap">
          <a
            class="icono-accion icono-editar"
            href="nuevo-cliente.html?id=${encodeURIComponent(cliente.id)}"
            title="Editar cliente"
            aria-label="Editar cliente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>

          <button
            type="button"
            class="icono-accion icono-eliminar"
            data-id="${escaparHtml(cliente.id)}"
            title="Eliminar cliente"
            aria-label="Eliminar cliente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
            </svg>
          </button>
        </span>
      </td>
    </tr>
  `).join('');

  // Conecta el botón eliminar de cada fila con su función.
  tbody.querySelectorAll('.icono-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarCliente(boton.dataset.id));
  });
}

// Elimina un cliente después de pedir confirmación.
function eliminarCliente(id) {
  const cliente = Storage.findBy(CLIENTES_KEY, 'id', id);

  if (!cliente) return;

  const confirmar = confirm(`¿Seguro que deseas eliminar al cliente "${cliente.nombre} ${cliente.apellido}"?`);
  if (!confirmar) return;

  Storage.removeBy(CLIENTES_KEY, 'id', id);

  // Conserva el filtro que estuviera escrito en el buscador.
  const buscador = document.querySelector('#buscador-clientes');
  const termino = buscador ? buscador.value : '';
  renderizarClientes(filtrarClientes(termino));
}

// Hace que la tabla se filtre mientras el usuario escribe.
function configurarBuscador() {
  const input = document.querySelector('#buscador-clientes');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarClientes(filtrarClientes(input.value));
  });
}

// Devuelve los clientes que coinciden con el texto buscado.
function filtrarClientes(termino) {
  const buscado = termino.trim().toLowerCase();
  const todos = Storage.getAll(CLIENTES_KEY);

  if (buscado === '') return todos;

  return todos.filter(cliente => [
    cliente.id,
    cliente.nombre,
    cliente.apellido,
    cliente.direccion,
    cliente.correo,
    cliente.telefono
  ].some(valor => String(valor || '').toLowerCase().includes(buscado)));
}

// Evita insertar texto introducido por el usuario como HTML real.
function escaparHtml(texto = '') {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
