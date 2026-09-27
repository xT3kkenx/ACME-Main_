/**
 * compras.js
 * ------------------------------------------------------------
 * Controla la tabla de compras: cargar, buscar, editar y eliminar.
 */

const COMPRAS_KEY = 'acme_compras';

// Datos iniciales de ejemplo.
const COMPRAS_INICIALES = [
  { id: 'COM-001', proveedor: 'FerreImport S.A.S', fecha: '2026-08-01', producto: 'Producto general', cantidad: 10, valor: 50000, total: 500000 },
  { id: 'COM-002', proveedor: 'PVC Solutions', fecha: '2026-08-02', producto: 'Producto general', cantidad: 5, valor: 60000, total: 300000 },
  { id: 'COM-003', proveedor: 'Electrico Colombia S.A', fecha: '2026-08-03', producto: 'Producto general', cantidad: 8, valor: 50000, total: 400000 },
  { id: 'COM-004', proveedor: 'Materiales Constructivos', fecha: '2026-08-04', producto: 'Producto general', cantidad: 12, valor: 50000, total: 600000 }
];

// Inicializa la tabla cuando el HTML ya está cargado.
document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(COMPRAS_KEY, COMPRAS_INICIALES);
  renderizarCompras(Storage.getAll(COMPRAS_KEY));
  configurarBuscador();
});

// Construye las filas de compras y los botones flotantes.
function renderizarCompras(compras) {
  const tbody = document.querySelector('#tabla-compras tbody');

  if (compras.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No se encontraron compras.</td></tr>';
    return;
  }

  tbody.innerHTML = compras.map(compra => `
    <tr>
      <td>${escaparHtml(compra.proveedor)}</td>
      <td>${escaparHtml(compra.cantidad)}</td>
      <td class="celda-disponible">
        $${formatearDinero(compra.total)}
        <span class="icono-flotante-wrap">
          <a class="icono-accion icono-editar"
             href="nueva-compra.html?id=${encodeURIComponent(compra.id)}"
             title="Editar compra" aria-label="Editar compra">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button" class="icono-accion icono-eliminar"
                  data-id="${escaparHtml(compra.id)}"
                  title="Eliminar compra" aria-label="Eliminar compra">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

  // Conecta los botones de eliminar.
  tbody.querySelectorAll('.icono-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarCompra(boton.dataset.id));
  });
}

// Elimina una compra y vuelve a mostrar la tabla.
function eliminarCompra(id) {
  if (!confirm('¿Eliminar esta compra?')) return;

  Storage.removeBy(COMPRAS_KEY, 'id', id);

  const buscador = document.querySelector('#buscador-compras');
  renderizarCompras(filtrarCompras(buscador ? buscador.value : ''));
}

// Activa la búsqueda en tiempo real.
function configurarBuscador() {
  const input = document.querySelector('#buscador-compras');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarCompras(filtrarCompras(input.value));
  });
}

// Busca por proveedor, producto, fecha, cantidad, total o ID.
function filtrarCompras(termino) {
  const buscado = termino.trim().toLowerCase();
  const todas = Storage.getAll(COMPRAS_KEY);
  if (buscado === '') return todas;

  return todas.filter(compra => [
    compra.id,
    compra.proveedor,
    compra.producto,
    compra.fecha,
    compra.cantidad,
    compra.total
  ].some(valor => String(valor || '').toLowerCase().includes(buscado)));
}

// Formatea valores monetarios.
function formatearDinero(valor) {
  return Number(valor || 0).toLocaleString('es-CO');
}

// Convierte texto en HTML seguro.
function escaparHtml(texto = '') {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
