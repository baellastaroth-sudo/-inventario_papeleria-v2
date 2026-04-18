// script.js

// Almacenamos los productos registrados en memoria
let inventario = [];

// Función para mostrar/ocultar formularios y limpiar vista
function showForm(formId) {
    // Ocultar todos los formularios
    document.querySelectorAll('.formulario').forEach(form => {
        form.style.display = 'none';
    });
    // Ocultar pantalla inicial
    document.getElementById('inicial').style.display = 'none';
    // Mostrar el formulario seleccionado
    const formActivo = document.getElementById(formId);
    if (formActivo) {
        formActivo.style.display = 'block';
    }
    
    // Si se muestra el formulario de ventas, actualizar sugerencias de producto
    if (formId === 'venta') {
        actualizarDatalistVentas();
    }
}

// Función para volver al menú inicial (la agregaremos a los formularios dinámicamente)
function volverInicio() {
    document.querySelectorAll('.formulario').forEach(form => {
        form.style.display = 'none';
    });
    document.getElementById('inicial').style.display = 'block';
}

// ---------- FORMULARIO DE REGISTRO ----------
const btnAgregarRegistro = document.getElementById('btnAgregar');
const btnLimpiarRegistro = document.getElementById('btnLimpiar');
const cuerpoTablaRegistro = document.querySelector('#idregistro #cuerpoTabla');

// Cargar inventario desde localStorage al iniciar
function cargarInventario() {
    const datos = localStorage.getItem('inventarioPapeleria');
    if (datos) {
        inventario = JSON.parse(datos);
    } else {
        // Datos de ejemplo para probar
        inventario = [
            { codigo: 'PAP-001', nombre: 'Cuaderno Cosido', precio: 2.50, cantidad: 30 },
            { codigo: 'LAP-101', nombre: 'Lapicero Azul', precio: 0.80, cantidad: 100 }
        ];
        guardarInventario();
    }
    renderizarTablaRegistro();
}

function guardarInventario() {
    localStorage.setItem('inventarioPapeleria', JSON.stringify(inventario));
}

function renderizarTablaRegistro() {
    if (!cuerpoTablaRegistro) return;
    
    if (inventario.length === 0) {
        cuerpoTablaRegistro.innerHTML = `<tr class="fila-vacia"><td colspan="5">No hay productos registrados</td></tr>`;
        return;
    }
    
    let html = '';
    inventario.forEach(prod => {
        const totalProducto = (prod.precio * prod.cantidad).toFixed(2);
        html += `<tr>
            <td>${prod.codigo}</td>
            <td>${prod.nombre}</td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td>${prod.cantidad}</td>
            <td><strong>$${totalProducto}</strong></td>
        </tr>`;
    });
    cuerpoTablaRegistro.innerHTML = html;
}

function agregarProductoRegistro() {
    const codigoInput = document.querySelector('#idregistro #codigo');
    const nombreInput = document.querySelector('#idregistro #nombre');
    const precioInput = document.querySelector('#idregistro #precio');
    const cantidadInput = document.querySelector('#idregistro #cantidad');
    
    const codigo = codigoInput.value.trim();
    const nombre = nombreInput.value.trim();
    const precio = parseFloat(precioInput.value);
    const cantidad = parseInt(cantidadInput.value);
    
    // Validaciones
    if (!codigo || !nombre || isNaN(precio) || isNaN(cantidad) || precio < 0 || cantidad < 0) {
        alert('⚠️ Por favor completa todos los campos correctamente.');
        return;
    }
    
    // Verificar código duplicado
    if (inventario.some(p => p.codigo.toLowerCase() === codigo.toLowerCase())) {
        alert('❌ Ya existe un producto con ese código. Usa otro código.');
        return;
    }
    
    // Agregar
    inventario.push({
        codigo: codigo,
        nombre: nombre,
        precio: precio,
        cantidad: cantidad
    });
    
    guardarInventario();
    renderizarTablaRegistro();
    limpiarFormularioRegistro();
    
    // Feedback visual
    alert(`✅ Producto "${nombre}" agregado al inventario.`);
}

function limpiarFormularioRegistro() {
    document.querySelector('#idregistro #codigo').value = '';
    document.querySelector('#idregistro #nombre').value = '';
    document.querySelector('#idregistro #precio').value = '';
    document.querySelector('#idregistro #cantidad').value = '';
}

// ---------- FORMULARIO DE VENTAS ----------
// IDs corregidos para no chocar con registro (en tu HTML están duplicados, los adaptamos aquí)
const productoInput = document.querySelector('#venta input[placeholder="Ej: Cuaderno"]'); // el input de nombre
const descuentoInput = document.querySelector('#venta input[placeholder="0.00"][step="0.01"]:nth-of-type(1)');
const ivaInput = document.querySelector('#venta input[placeholder="0.00"][step="0.01"]:nth-of-type(2)');

const btnAgregarVenta = document.querySelector('#venta .botones-accion #btnAgregar');
const btnLimpiarVenta = document.querySelector('#venta .botones-accion #btnLimpiar');
const cuerpoTablaVenta = document.querySelector('#venta #cuerpoTabla');

// Lista de ventas temporales (carrito de venta actual)
let carritoVenta = [];

function actualizarDatalistVentas() {
    // Creamos un datalist para sugerir nombres de productos existentes
    let datalistId = 'listaProductosSugeridos';
    let datalist = document.getElementById(datalistId);
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        document.body.appendChild(datalist);
    }
    
    let opciones = '';
    const nombresUnicos = [...new Set(inventario.map(p => p.nombre))];
    nombresUnicos.forEach(nombre => {
        opciones += `<option value="${nombre}">`;
    });
    datalist.innerHTML = opciones;
    
    // Asignar el datalist al input de producto (si existe)
    if (productoInput) {
        productoInput.setAttribute('list', datalistId);
    }
}

function renderizarTablaVentas() {
    if (!cuerpoTablaVenta) return;
    
    if (carritoVenta.length === 0) {
        cuerpoTablaVenta.innerHTML = `<tr class="fila-vacia"><td colspan="4">No hay productos en la venta actual</td></tr>`;
        return;
    }
    
    let html = '';
    carritoVenta.forEach(item => {
        html += `<tr>
            <td>${item.nombre}</td>
            <td>$${item.descuento.toFixed(2)}</td>
            <td>$${item.iva.toFixed(2)}</td>
            <td><strong>$${item.subtotal.toFixed(2)}</strong></td>
        </tr>`;
    });
    cuerpoTablaVenta.innerHTML = html;
}

function agregarItemVenta() {
    if (!productoInput || !descuentoInput || !ivaInput) {
        alert('Error: No se encontraron los campos del formulario de ventas.');
        return;
    }
    
    const nombreProducto = productoInput.value.trim();
    const descuento = parseFloat(descuentoInput.value) || 0;
    const ivaPorcentaje = parseFloat(ivaInput.value) || 0;
    
    if (!nombreProducto) {
        alert('Ingresa el nombre del producto.');
        return;
    }
    
    // Buscar producto en inventario
    const productoEncontrado = inventario.find(p => p.nombre.toLowerCase() === nombreProducto.toLowerCase());
    
    if (!productoEncontrado) {
        alert(`❌ El producto "${nombreProducto}" no está registrado en el inventario.`);
        return;
    }
    
    if (productoEncontrado.cantidad <= 0) {
        alert(`⚠️ No hay existencias de "${nombreProducto}".`);
        return;
    }
    
    const precioUnitario = productoEncontrado.precio;
    
    // Calcular subtotal con descuento e IVA
    const subtotalSinDescuento = precioUnitario;
    const montoDescuento = Math.min(descuento, subtotalSinDescuento); // no descontar más del precio
    const baseImponible = subtotalSinDescuento - montoDescuento;
    const montoIVA = baseImponible * (ivaPorcentaje / 100);
    const subtotalFinal = baseImponible + montoIVA;
    
    // Restar una unidad del inventario (asumimos venta de 1 unidad por simplicidad)
    productoEncontrado.cantidad -= 1;
    guardarInventario();
    renderizarTablaRegistro(); // Actualizar tabla de registro
    
    // Agregar al carrito de venta
    carritoVenta.push({
        nombre: nombreProducto,
        descuento: montoDescuento,
        iva: montoIVA,
        subtotal: subtotalFinal
    });
    
    renderizarTablaVentas();
    limpiarFormularioVenta();
    
    // Actualizar datalist por si cambió inventario
    actualizarDatalistVentas();
}

function limpiarFormularioVenta() {
    if (productoInput) productoInput.value = '';
    if (descuentoInput) descuentoInput.value = '';
    if (ivaInput) ivaInput.value = '';
}

// ---------- INICIALIZACIÓN Y EVENTOS ----------
document.addEventListener('DOMContentLoaded', function() {
    cargarInventario();
    
    // Añadir botón "Volver" a ambos formularios dinámicamente
    const formularios = document.querySelectorAll('.formulario');
    formularios.forEach(form => {
        const btnVolver = document.createElement('button');
        btnVolver.textContent = '↩️ Volver al menú';
        btnVolver.style.marginLeft = 'auto';
        btnVolver.style.background = '#95a5a6';
        btnVolver.style.borderColor = '#7f8c8d';
        btnVolver.style.color = 'white';
        btnVolver.addEventListener('click', volverInicio);
        
        // Insertar en la barra de botones de acción (al final)
        const barraBotones = form.querySelector('.botones-accion');
        if (barraBotones) {
            barraBotones.appendChild(btnVolver);
        }
    });
    
    // Eventos Registro
    if (btnAgregarRegistro) {
        btnAgregarRegistro.addEventListener('click', agregarProductoRegistro);
    }
    if (btnLimpiarRegistro) {
        btnLimpiarRegistro.addEventListener('click', limpiarFormularioRegistro);
    }
    
    // Eventos Ventas
    if (btnAgregarVenta) {
        btnAgregarVenta.addEventListener('click', agregarItemVenta);
    }
    if (btnLimpiarVenta) {
        btnLimpiarVenta.addEventListener('click', limpiarFormularioVenta);
    }
    
    // También permitir Enter en campos de venta? (opcional)
});

// Exponer showForm globalmente para los onclick del HTML
window.showForm = showForm;
