/**
 * proveedor-form.js
 * ------------------------------------------------------------
 * Permite crear y editar proveedores con el mismo formulario.
 */

const PROVEEDORES_FORM_KEY = 'acme_proveedores';

document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.querySelector('#form-proveedor');
  const id = new URLSearchParams(window.location.search).get('id');
  const proveedor = id ? Storage.findBy(PROVEEDORES_FORM_KEY, 'id', id) : null;

  // Carga los datos si estamos editando un proveedor existente.
  if (proveedor) {
    ['nombre', 'contacto', 'direccion', 'correo', 'telefono'].forEach(campo => {
      document.querySelector(`#${campo}`).value = proveedor[campo] || '';
    });

    document.querySelector('h2').textContent = 'Editar proveedor';
    document.querySelector('#btn-guardar').textContent = 'Guardar cambios';
  }

  // Guarda un proveedor nuevo o actualiza el existente.
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();

    const datos = Object.fromEntries(new FormData(formulario).entries());

    if (!datos.nombre.trim() || !datos.contacto.trim()) {
      alert('Nombre y contacto son obligatorios.');
      return;
    }

    if (id && proveedor) {
      Storage.updateBy(PROVEEDORES_FORM_KEY, 'id', id, datos);
    } else {
      Storage.add(PROVEEDORES_FORM_KEY, {
        id: siguienteId(PROVEEDORES_FORM_KEY, 'PRO'),
        ...datos
      });
    }

    window.location.href = 'proveedores.html';
  });

  // Cancelar regresa a la lista de proveedores.
  document.querySelector('.btn-secondary').addEventListener('click', evento => {
    evento.preventDefault();
    window.location.href = 'proveedores.html';
  });
});

// Genera un ID consecutivo para proveedores.
function siguienteId(key, prefijo) {
  const mayor = Storage.getAll(key).reduce((maximo, elemento) => {
    const numero = Number((elemento.id || '').split('-')[1]) || 0;
    return Math.max(maximo, numero);
  }, 0);

  return `${prefijo}-${String(mayor + 1).padStart(3, '0')}`;
}
