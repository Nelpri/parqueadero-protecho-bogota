// Variables globales
let vehiculoActual = null;
let cobroActual = null;

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando Sistema de Parqueadero Protecho Bogotá II...');
    
    configurarNavegacion();
    configurarFormularios();
    configurarEventosAdicionales();
    cargarDatosIniciales();
    inicializarUtilidades();
    
    console.log('Sistema inicializado correctamente');
});

// Configurar navegación por pestañas
function configurarNavegacion() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Remover clase active de todas las pestañas y paneles
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            // Agregar clase active a la pestaña y panel seleccionado
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Cargar datos específicos de la pestaña
            cargarDatosTab(targetTab);
        });
    });
}

// Cargar datos específicos de cada pestaña
function cargarDatosTab(tabName) {
    switch (tabName) {
        case 'vehiculos':
            cargarVehiculosActivos();
            break;
        case 'reportes':
            // Los reportes se cargan cuando se generan
            break;
        case 'configuracion':
            // La configuración es estática
            break;
    }
}

// Configurar formularios
function configurarFormularios() {
    // Formulario de entrada
    const entradaForm = document.getElementById('entradaForm');
    if (entradaForm) {
        entradaForm.addEventListener('submit', manejarEntrada);
    }
    
    // Formulario de salida
    const salidaForm = document.getElementById('salidaForm');
    if (salidaForm) {
        salidaForm.addEventListener('submit', manejarSalida);
    }
}

// Configurar eventos adicionales
function configurarEventosAdicionales() {
    // Configurar búsqueda de vehículos
    const buscarInput = document.getElementById('buscarVehiculo');
    if (buscarInput) {
        buscarInput.addEventListener('input', (e) => {
            buscarVehiculos(e.target.value);
        });
    }
    
    // Configurar importación de archivos
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', manejarImportacionArchivo);
    }
    
    // Configurar cambio de parqueadero
    const selectParqueadero = document.getElementById('numeroParqueadero');
    if (selectParqueadero) {
        console.log('🔧 Configurando evento de cambio de parqueadero');
        selectParqueadero.addEventListener('change', (e) => {
            console.log('🔄 Cambio de parqueadero detectado:', e.target.value);
            cargarPuestosPorParqueadero(e.target.value);
        });
    } else {
        console.error('❌ No se encontró el elemento numeroParqueadero');
    }
    
    // Configurar cambio de tipo de usuario
    const selectTipoUsuario = document.getElementById('esResidente');
    if (selectTipoUsuario) {
        console.log('🔧 Configurando evento de cambio de tipo de usuario');
        selectTipoUsuario.addEventListener('change', (e) => {
            console.log('🔄 Cambio de tipo de usuario detectado:', e.target.value);
            toggleCamposParqueadero(e.target.value === 'true');
        });
    } else {
        console.error('❌ No se encontró el elemento esResidente');
    }
}

// Cargar datos iniciales
function cargarDatosIniciales() {
    actualizarDashboard();
    cargarVehiculosActivos();
    
    // Inicializar campos de parqueadero (ocultos por defecto)
    toggleCamposParqueadero(false);
}

// Manejar entrada de vehículo
function manejarEntrada(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const datos = {
            placa: formData.get('placa'),
            tipo: formData.get('tipo'),
            propietario: formData.get('propietario'),
            direccion: formData.get('direccion'),
            telefono: formData.get('telefono'),
            numeroParqueadero: formData.get('numeroParqueadero') || null,
            numeroPuesto: formData.get('numeroPuesto') || null,
            esResidente: formData.get('esResidente'),
            observaciones: formData.get('observaciones')
        };
        
        console.log('Datos del formulario:', datos);
        
        // Validar formulario
        const errores = validarFormularioEntrada(datos);
        if (errores.length > 0) {
            mostrarNotificacion(errores.join(', '), 'error');
            return;
        }
        
        // Registrar entrada
        const vehiculo = db.registrarEntrada(datos);
        
        // Mostrar notificación de éxito
        const tipoUsuario = vehiculo.esResidente ? 'Residente' : 'Visitante';
        const espacio = vehiculo.tipo === 'moto' ? `M${vehiculo.numeroPuesto.toString().padStart(2, '0')}` : `P${vehiculo.numeroParqueadero}-${vehiculo.numeroPuesto.toString().padStart(3, '0')}`;
        
        mostrarNotificacion(
            `Vehículo ${vehiculo.placa} registrado exitosamente. ${tipoUsuario} - Espacio: ${espacio}`,
            'success'
        );
        
        // Limpiar formulario
        limpiarFormulario('entradaForm');
        
        // Actualizar interfaz
        actualizarDashboard();
        cargarVehiculosActivos();
        
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

// Manejar salida de vehículo
function manejarSalida(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const datos = {
            placa: formData.get('placa'),
            metodoPago: formData.get('metodoPago'),
            descuento: parseFloat(formData.get('descuento')) || 0
        };
        
        // Validar formulario
        const errores = validarFormularioSalida(datos);
        if (errores.length > 0) {
            mostrarNotificacion(errores.join(', '), 'error');
            return;
        }
        
        // Calcular cobro
        const cobro = db.calcularCobro(datos.placa);
        vehiculoActual = cobro.vehiculo;
        cobroActual = cobro;
        
        // Mostrar resumen de cobro
        mostrarResumenCobro(cobro, datos.descuento);
        
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

// Mostrar resumen de cobro
function mostrarResumenCobro(cobro, descuento) {
    const tiempoFormateado = formatearTiempo(cobro.tiempoMs);
    const descuentoMonto = (cobro.subtotal * descuento) / 100;
    const total = cobro.subtotal - descuentoMonto;
    
    // Actualizar elementos del resumen
    document.getElementById('tiempoEstacionamiento').textContent = tiempoFormateado;
    
            if (cobro.esResidente) {
            document.getElementById('tarifaHora').textContent = `${formatearMoneda(cobro.tarifaMensual)} por mes (${cobro.mesesCompletos} meses)`;
        } else {
            document.getElementById('tarifaHora').textContent = `${formatearMoneda(cobro.tarifa12Horas)} por 12 horas (${cobro.periodos12Horas} períodos)`;
        }
        
        console.log('Resumen de cobro mostrado:', {
            esResidente: cobro.esResidente,
            tiempoFormateado,
            tarifa: cobro.esResidente ? cobro.tarifaMensual : cobro.tarifa12Horas,
            subtotal: cobro.subtotal,
            descuentoMonto,
            total
        });
    
    document.getElementById('subtotal').textContent = formatearMoneda(cobro.subtotal);
    document.getElementById('descuentoCalculado').textContent = formatearMoneda(descuentoMonto);
    document.getElementById('totalPagar').textContent = formatearMoneda(total);
    
    // Mostrar resultado
    document.getElementById('resultadoSalida').style.display = 'block';
}

// Confirmar salida
function confirmarSalida() {
    try {
        if (!vehiculoActual || !cobroActual) {
            throw new Error('No hay vehículo para procesar');
        }
        
        const metodoPago = document.getElementById('metodoPago').value;
        const descuento = parseFloat(document.getElementById('descuento').value) || 0;
        
        // Registrar salida
        const resultado = db.registrarSalida(vehiculoActual.placa, metodoPago, descuento);
        
        // Mostrar notificación de éxito
        const tipoUsuario = vehiculoActual.esResidente ? 'Residente' : 'Visitante';
        mostrarNotificacion(
            `Vehículo ${vehiculoActual.placa} procesado exitosamente. ${tipoUsuario} - Total: ${formatearMoneda(resultado.transaccion.total)}`,
            'success'
        );
        
        // Ocultar resultado
        document.getElementById('resultadoSalida').style.display = 'none';
        
        // Actualizar interfaz
        actualizarDashboard();
        cargarVehiculosActivos();
        
        // Limpiar variables
        vehiculoActual = null;
        cobroActual = null;
        
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

// Cancelar salida
function cancelarSalida() {
    document.getElementById('resultadoSalida').style.display = 'none';
    vehiculoActual = null;
    cobroActual = null;
    mostrarNotificacion('Operación cancelada', 'info');
}

// Generar reporte
function generarReporte() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('Debe seleccionar un rango de fechas', 'warning');
        return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarNotificacion('La fecha de inicio no puede ser mayor a la fecha fin', 'error');
        return;
    }
    
    const reporte = db.getReporteRango(new Date(fechaInicio), new Date(fechaFin));
    mostrarReporte(reporte, fechaInicio, fechaFin);
}

// Mostrar reporte
function mostrarReporte(reporte, fechaInicio, fechaFin) {
    // Actualizar estadísticas principales
    document.getElementById('ingresosTotales').textContent = formatearMoneda(reporte.ingresos);
    document.getElementById('vehiculosAtendidos').textContent = reporte.vehiculosAtendidos;
    document.getElementById('promedioVehiculo').textContent = formatearMoneda(reporte.promedio);
    
    // Actualizar estadísticas por tipo de usuario
    if (reporte.statsPorUsuario) {
        document.getElementById('residentesAtendidos').textContent = reporte.statsPorUsuario.residente.cantidad;
        document.getElementById('visitantesAtendidos').textContent = reporte.statsPorUsuario.visitante.cantidad;
    }
    
    // Mostrar estadísticas detalladas
    mostrarEstadisticasDetalladas(reporte);
    
    // Actualizar tabla de transacciones
    const tbody = document.getElementById('transaccionesBody');
    tbody.innerHTML = '';
    
    reporte.transacciones.forEach(transaccion => {
        const row = document.createElement('tr');
        const duracion = transaccion.esResidente ? 
            `${transaccion.meses} mes${transaccion.meses > 1 ? 'es' : ''}` : 
            `${transaccion.periodos12Horas} período${transaccion.periodos12Horas > 1 ? 's' : ''} de 12h`;
        
        const tarifa = transaccion.esResidente ? 
            formatearMoneda(transaccion.tarifaMensual) : 
            formatearMoneda(transaccion.tarifa12Horas);
        
        const tipoUsuario = transaccion.esResidente ? 'Residente' : 'Visitante';
        
        row.innerHTML = `
            <td>${formatearFecha(transaccion.fecha)}</td>
            <td>${transaccion.placa}</td>
            <td>${formatearTipoVehiculo(transaccion.tipo)}</td>
            <td>${transaccion.direccion}</td>
            <td>${tipoUsuario}</td>
            <td>${formatearFechaHora(transaccion.entrada)}</td>
            <td>${formatearFechaHora(transaccion.salida)}</td>
            <td>${duracion}</td>
            <td>${tarifa}</td>
            <td>${formatearMoneda(transaccion.total)}</td>
            <td>${formatearMetodoPago(transaccion.metodoPago)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Función global para limpiar formulario
function limpiarFormulario(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Limpiar también el resultado de salida si existe
        const resultadoSalida = document.getElementById('resultadoSalida');
        if (resultadoSalida) {
            resultadoSalida.style.display = 'none';
        }
    }
}

// Función global para cancelar salida
function cancelarSalida() {
    document.getElementById('resultadoSalida').style.display = 'none';
    vehiculoActual = null;
    cobroActual = null;
    mostrarNotificacion('Operación cancelada', 'info');
}

// Función global para generar reporte
function generarReporte() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('Debe seleccionar un rango de fechas', 'warning');
        return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarNotificacion('La fecha de inicio no puede ser mayor a la fecha fin', 'error');
        return;
    }
    
    const reporte = db.getReporteRango(new Date(fechaInicio), new Date(fechaFin));
    mostrarReporte(reporte, fechaInicio, fechaFin);
}

// Generar reporte de hoy
function generarReporteHoy() {
    const reporte = db.getReporteHoy();
    const hoy = new Date().toLocaleDateString('es-ES');
    mostrarReporte(reporte, hoy, hoy);
    mostrarNotificacion('Reporte de hoy generado', 'success');
}

// Generar reporte del mes
function generarReporteMes() {
    const reporte = db.getReporteMesActual();
    const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    mostrarReporte(reporte, `Inicio de ${mesActual}`, `Fin de ${mesActual}`);
    mostrarNotificacion('Reporte del mes generado', 'success');
}

// Generar reporte de ocupación
function generarReporteOcupacion() {
    const reporte = db.getReporteOcupacion();
    mostrarReporteOcupacion(reporte);
    mostrarNotificacion('Reporte de ocupación generado', 'success');
}

// Mostrar estadísticas detalladas
function mostrarEstadisticasDetalladas(reporte) {
    const detalladas = document.getElementById('reportesDetalladas');
    detalladas.style.display = 'block';
    
    // Estadísticas por tipo de vehículo
    const statsPorTipo = document.getElementById('statsPorTipo');
    statsPorTipo.innerHTML = '';
    
    if (reporte.statsPorTipo) {
        Object.entries(reporte.statsPorTipo).forEach(([tipo, stats]) => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <h4>${formatearTipoVehiculo(tipo)}</h4>
                <div class="stat-value">${stats.cantidad}</div>
                <div class="stat-secondary">${formatearMoneda(stats.ingresos)}</div>
            `;
            statsPorTipo.appendChild(statItem);
        });
    }
    
    // Estadísticas por método de pago
    const statsPorPago = document.getElementById('statsPorPago');
    statsPorPago.innerHTML = '';
    
    if (reporte.statsPorPago) {
        Object.entries(reporte.statsPorPago).forEach(([metodo, stats]) => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <h4>${formatearMetodoPago(metodo)}</h4>
                <div class="stat-value">${stats.cantidad}</div>
                <div class="stat-secondary">${formatearMoneda(stats.ingresos)}</div>
            `;
            statsPorPago.appendChild(statItem);
        });
    }
}

// Mostrar reporte de ocupación
function mostrarReporteOcupacion(reporte) {
    // Limpiar estadísticas principales
    document.getElementById('ingresosTotales').textContent = 'N/A';
    document.getElementById('vehiculosAtendidos').textContent = reporte.espaciosOcupados;
    document.getElementById('promedioVehiculo').textContent = `${reporte.porcentajeOcupacion}%`;
    document.getElementById('residentesAtendidos').textContent = 'N/A';
    document.getElementById('visitantesAtendidos').textContent = 'N/A';
    
    // Mostrar estadísticas detalladas
    const detalladas = document.getElementById('reportesDetalladas');
    detalladas.style.display = 'block';
    
    // Ocultar secciones no aplicables
    document.getElementById('statsPorTipo').parentElement.style.display = 'none';
    document.getElementById('statsPorPago').parentElement.style.display = 'none';
    document.getElementById('statsOcupacion').style.display = 'block';
    
    // Estadísticas por parqueadero
    const statsPorParqueadero = document.getElementById('statsPorParqueadero');
    statsPorParqueadero.innerHTML = '';
    
    Object.entries(reporte.statsPorParqueadero).forEach(([parqueadero, stats]) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.innerHTML = `
            <h4>Parqueadero ${parqueadero}</h4>
            <div class="stat-value">${stats.ocupados}/${stats.total}</div>
            <div class="stat-secondary">${stats.porcentaje}% ocupado</div>
        `;
        statsPorParqueadero.appendChild(statItem);
    });
    
    // Limpiar tabla de transacciones
    document.getElementById('transaccionesBody').innerHTML = '';
}

// Función global para exportar datos
function exportarDatos() {
    try {
        db.exportarDatos();
        mostrarNotificacion('Datos exportados correctamente', 'success');
    } catch (error) {
        mostrarNotificacion('Error al exportar datos: ' + error.message, 'error');
    }
}

// Función global para importar datos
function importarDatos() {
    const input = document.getElementById('importFile');
    if (input) {
        input.click();
    }
}

// Función para importar usuarios desde Excel
function importarUsuariosExcel() {
    const input = document.getElementById('importExcelFile');
    if (input) {
        input.click();
    }
}

// Manejar teclas de acceso rápido
document.addEventListener('keydown', function(event) {
    // Ctrl + E para entrada
    if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        document.querySelector('[data-tab="entrada"]').click();
        document.getElementById('placaEntrada').focus();
    }
    
    // Ctrl + S para salida
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        document.querySelector('[data-tab="salida"]').click();
        document.getElementById('placaSalida').focus();
    }
    
    // Ctrl + V para vehículos
    if (event.ctrlKey && event.key === 'v') {
        event.preventDefault();
        document.querySelector('[data-tab="vehiculos"]').click();
    }
    
    // Ctrl + R para reportes
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        document.querySelector('[data-tab="reportes"]').click();
    }
    
    // Ctrl + C para configuración
    if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        document.querySelector('[data-tab="configuracion"]').click();
    }
});

// Manejar eventos de ventana
window.addEventListener('beforeunload', function() {
    console.log('Cerrando sistema de parqueadero');
});

// Manejar errores no capturados
window.addEventListener('error', function(event) {
    console.error('Error no capturado:', event.error);
    mostrarNotificacion('Ha ocurrido un error inesperado', 'error');
});

console.log('Sistema de Parqueadero Protecho Bogotá II - Listo para usar');
console.log('Comandos de acceso rápido:');
console.log('Ctrl + E: Entrada');
console.log('Ctrl + S: Salida');
console.log('Ctrl + V: Vehículos');
console.log('Ctrl + R: Reportes');
console.log('Ctrl + C: Configuración'); 