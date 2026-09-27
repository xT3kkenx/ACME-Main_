/**
 * compra-form.js
 * ------------------------------------------------------------
 * Permite crear y editar compras y calcula el total automáticamente.
 */

const COMPRA_FORM_KEY = 'acme_compras';

document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.querySelector('#form-compra');
  const id = new URLSearchParams(window.location.search).get('id');
  const compra = id ? Storage.findBy(COMPRA_FORM_KEY, 'id', id) : null;

  // Carga los datos existentes si el usuario está editando una compra.
  if (compra) {
    ['proveedor', 'fecha', 'producto', 'valor', 'cantidad', 'total'].forEach(campo => {
      document.querySelector(`#${campo}`).value = compra[campo] ?? '';
    });

    document.querySelector('h2').textContent = 'Editar compra';
    document.querySelector('#btn-guardar').textContent = 'Guardar cambios';
  }

  // Calcula automáticamente el total = valor x cantidad.
  const calcularTotal = () => {
    const valor = Number(document.querySelector('#valor').value) || 0;
    const cantidad = Number(document.querySelector('#cantidad').value) || 0;
    document.querySelector('#total').value = valor * cantidad;
  };

  document.querySelector('#valor').addEventListener('input', calcularTotal);
  document.querySelector('#cantidad').addEventListener('input', calcularTotal);

  // Guarda una compra nueva o actualiza la existente.
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();

    const datos = Object.fromEntries(new FormData(formulario).entries());
    datos.valor = Number(datos.valor);
    datos.cantidad = Number(datos.cantidad);
    datos.total = datos.valor * datos.cantidad;

    if (id && compra) {
      Storage.updateBy(COMPRA_FORM_KEY, 'id', id, datos);
    } else {
      Storage.add(COMPRA_FORM_KEY, {
        id: siguienteId(COMPRA_FORM_KEY, 'COM'),
        ...datos
      });
    }

    window.location.href = 'compras.html';
  });

  // Cancelar vuelve a la lista de compras.
  document.querySelector('.btn-secondary').addEventListener('click', evento => {
    evento.preventDefault();
    window.location.href = 'compras.html';
  });
});

// Genera el siguiente ID consecutivo de compra.
function siguienteId(key, prefijo) {
  const mayor = Storage.getAll(key).reduce((maximo, elemento) => {
    const numero = Number((elemento.id || '').split('-')[1]) || 0;
    return Math.max(maximo, numero);
  }, 0);

  return `${prefijo}-${String(mayor + 1).padStart(3, '0')}`;
}
