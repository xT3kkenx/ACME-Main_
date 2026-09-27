/**
 * proveedores.js
 * ------------------------------------------------------------
 * Controla la tabla de proveedores: carga, búsqueda, edición y eliminación.
 */

// Llave usada para guardar proveedores en localStorage.
const PROVEEDORES_KEY = 'acme_proveedores';

// Proveedores que aparecen la primera vez que se abre la página.
const PROVEEDORES_INICIALES = [
  { id: 'PRO-001', nombre: 'Ferreimport S.A.S', contacto: 'Nicolas Vasquez', direccion: 'Zona Industrial', correo: 'ferre@gmail.com', telefono: '3100000000' },
  { id: 'PRO-002', nombre: 'Pinturas Andinas Ltda', contacto: 'Ans Astudillo', direccion: 'Calle 100 #20-4', correo: 'pinturas@gmail.com', telefono: '3110000000' },
  { id: 'PRO-003', nombre: 'Electrico Colombia S.A', contacto: 'Mopan Duran', direccion: 'Avenida Principal', correo: 'electrico@gmail.com', telefono: '3120000000' },
  { id: 'PRO-004', nombre: 'PVC Solutions', contacto: 'Camilo Ruiz', direccion: 'Avenida Principal', correo: 'pvc@gmail.com', telefono: '3130000000' },
  { id: 'PRO-005', nombre: 'Seguridad Industrial Pro', contacto: 'Manuel Inchima', direccion: 'Calle 70 #40-3', correo: 'seguridad@gmail.com', telefono: '3140000000' }
];

// Inicializa la tabla y el buscador.
document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(PROVEEDORES_KEY, PROVEEDORES_INICIALES);
  renderizarProveedores(Storage.getAll(PROVEEDORES_KEY));
  configurarBuscador();
});

// Construye las filas de proveedores y sus botones flotantes.
function renderizarProveedores(proveedores) {
  const tbody = document.querySelector('#tabla-proveedores tbody');

  if (proveedores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No se encontraron proveedores.</td></tr>';
    return;
  }

  tbody.innerHTML = proveedores.map(proveedor => `
    <tr>
      <td>${escaparHtml(proveedor.nombre)}</td>
      <td>${escaparHtml(proveedor.contacto)}</td>
      <td>${escaparHtml(proveedor.direccion)}</td>
      <td>${escaparHtml(proveedor.correo)}</td>
      <td class="celda-disponible">
        ${escaparHtml(proveedor.telefono)}
        <span class="icono-flotante-wrap">
          <a class="icono-accion icono-editar"
             href="nuevo-proveedor.html?id=${encodeURIComponent(proveedor.id)}"
             title="Editar proveedor" aria-label="Editar proveedor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button" class="icono-accion icono-eliminar"
                  data-id="${escaparHtml(proveedor.id)}"
                  title="Eliminar proveedor" aria-label="Eliminar proveedor">
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

  // Conecta cada botón de eliminar con su proveedor correspondiente.
  tbody.querySelectorAll('.icono-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarProveedor(boton.dataset.id));
  });
}

// Elimina un proveedor y actualiza la tabla.
function eliminarProveedor(id) {
  const proveedor = Storage.findBy(PROVEEDORES_KEY, 'id', id);
  if (!proveedor) return;

  if (!confirm(`¿Eliminar el proveedor "${proveedor.nombre}"?`)) return;

  Storage.removeBy(PROVEEDORES_KEY, 'id', id);

  const buscador = document.querySelector('#buscador-proveedores');
  renderizarProveedores(filtrarProveedores(buscador ? buscador.value : ''));
}

// Activa la búsqueda en tiempo real.
function configurarBuscador() {
  const input = document.querySelector('#buscador-proveedores');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarProveedores(filtrarProveedores(input.value));
  });
}

// Filtra por cualquier dato visible o por el ID interno.
function filtrarProveedores(termino) {
  const buscado = termino.trim().toLowerCase();
  const todos = Storage.getAll(PROVEEDORES_KEY);
  if (buscado === '') return todos;

  return todos.filter(proveedor => [
    proveedor.id,
    proveedor.nombre,
    proveedor.contacto,
    proveedor.direccion,
    proveedor.correo,
    proveedor.telefono
  ].some(valor => String(valor || '').toLowerCase().includes(buscado)));
}

// Convierte texto a HTML seguro antes de insertarlo con innerHTML.
function escaparHtml(texto = '') {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
