/**
 * ordenes.js
 * ------------------------------------------------------------
 * Controla la tabla de órdenes de trabajo.
 */

// Llave de almacenamiento de las órdenes.
const ORDENES_KEY = 'acme_ordenes';

// Datos iniciales de ejemplo.
const ORDENES_INICIALES = [
  { id: 'ORD-001', cliente: 'Juan', responsable: 'Pedro', metodo: 'efectivo', valor: 200000, estado: 'proceso', producto: 'Tornillo autoperforante 1"', cantidad: 10, total: 200000 },
  { id: 'ORD-002', cliente: 'Andres', responsable: 'Maria', metodo: 'tarjeta', valor: 150000, estado: 'terminada', producto: 'Pintura blanca mate 1 galón', cantidad: 1, total: 150000 },
  { id: 'ORD-003', cliente: 'Carlos', responsable: 'Jose', metodo: 'transferencia', valor: 300000, estado: 'proceso', producto: 'Taladro percutor 650W', cantidad: 1, total: 300000 },
  { id: 'ORD-004', cliente: 'Jhoana', responsable: 'Laura', metodo: 'efectivo', valor: 120000, estado: 'terminada', producto: 'Guantes anticorte', cantidad: 2, total: 120000 }
];

// Inicializa la tabla y el buscador.
document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(ORDENES_KEY, ORDENES_INICIALES);
  renderizarOrdenes(Storage.getAll(ORDENES_KEY));
  configurarBuscador();
});

// Dibuja las órdenes y coloca los botones flotantes en la última celda.
function renderizarOrdenes(ordenes) {
  const tbody = document.querySelector('#tabla-ordenes tbody');

  if (ordenes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No se encontraron órdenes.</td></tr>';
    return;
  }

  tbody.innerHTML = ordenes.map(orden => `
    <tr>
      <td>${escaparHtml(orden.cliente)}</td>
      <td>${escaparHtml(orden.responsable)}</td>
      <td>${mostrarMetodo(orden.metodo)}</td>
      <td>$${formatearDinero(orden.total)}</td>
      <td class="celda-disponible">
        ${mostrarEstado(orden.estado)}
        <span class="icono-flotante-wrap">
          <a class="icono-accion icono-editar"
             href="nueva-orden.html?id=${encodeURIComponent(orden.id)}"
             title="Editar orden" aria-label="Editar orden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button" class="icono-accion icono-eliminar"
                  data-id="${escaparHtml(orden.id)}"
                  title="Eliminar orden" aria-label="Eliminar orden">
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

  // Conecta los botones eliminar recién creados.
  tbody.querySelectorAll('.icono-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarOrden(boton.dataset.id));
  });
}

// Elimina una orden después de confirmarla.
function eliminarOrden(id) {
  if (!confirm('¿Eliminar esta orden?')) return;

  Storage.removeBy(ORDENES_KEY, 'id', id);

  const buscador = document.querySelector('#buscador-ordenes');
  renderizarOrdenes(filtrarOrdenes(buscador ? buscador.value : ''));
}

// Activa el buscador de órdenes.
function configurarBuscador() {
  const input = document.querySelector('#buscador-ordenes');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarOrdenes(filtrarOrdenes(input.value));
  });
}

// Busca por cliente, responsable, método, producto, estado, ID o total.
function filtrarOrdenes(termino) {
  const buscado = termino.trim().toLowerCase();
  const todas = Storage.getAll(ORDENES_KEY);
  if (buscado === '') return todas;

  return todas.filter(orden => [
    orden.id,
    orden.cliente,
    orden.responsable,
    orden.metodo,
    orden.producto,
    orden.estado,
    orden.total
  ].some(valor => String(valor || '').toLowerCase().includes(buscado)));
}

// Convierte el código interno del método a un texto visible.
function mostrarMetodo(metodo) {
  return {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia'
  }[metodo] || metodo;
}

// Convierte el código interno del estado a un texto visible.
function mostrarEstado(estado) {
  return {
    proceso: 'En proceso',
    terminada: 'Terminada'
  }[estado] || estado;
}

// Formatea los valores monetarios con el formato de Colombia.
function formatearDinero(valor) {
  return Number(valor || 0).toLocaleString('es-CO');
}

// Protege los textos antes de insertarlos como HTML.
function escaparHtml(texto = '') {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
