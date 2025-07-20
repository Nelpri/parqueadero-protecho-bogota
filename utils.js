// Utilidades para el Sistema de Parqueadero Protecho Bogotá II

// Formatear moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

// Formatear fecha y hora
function formatearFechaHora(fecha) {
    return new Date(fecha).toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formatear fecha
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Formatear tiempo
function formatearTiempo(tiempoMs) {
    const segundos = Math.floor(tiempoMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);

    if (meses > 0) {
        return `${meses} mes${meses > 1 ? 'es' : ''} ${dias % 30} día${dias % 30 > 1 ? 's' : ''}`;
    } else if (dias > 0) {
        return `${dias} día${dias > 1 ? 's' : ''} ${horas % 24} hora${horas % 24 > 1 ? 's' : ''}`;
    } else if (horas > 0) {
        return `${horas} hora${horas > 1 ? 's' : ''} ${minutos % 60} minuto${minutos % 60 > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
        return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else {
        return `${segundos} segundo${segundos > 1 ? 's' : ''}`;
    }
}

// Validar placa
function validarPlaca(placa) {
    const placaLimpia = placa.replace(/\s/g, '').toUpperCase();
    // Formato: ABC123 o ABC12A
    const formato1 = /^[A-Z]{3}\d{3}$/;
    const formato2 = /^[A-Z]{3}\d{2}[A-Z]$/;
    return formato1.test(placaLimpia) || formato2.test(placaLimpia);
}

// Normalizar placa
function normalizarPlaca(placa) {
    return placa.replace(/\s/g, '').toUpperCase();
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 5000) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    
    let icono = 'info-circle';
    switch (tipo) {
        case 'success':
            icono = 'check-circle';
            break;
        case 'error':
            icono = 'exclamation-circle';
            break;
        case 'warning':
            icono = 'exclamation-triangle';
            break;
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icono}"></i>
        <span>${mensaje}</span>
    `;
    
    notifications.appendChild(notification);
    
    // Remover después del tiempo especificado
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, duracion);
}

// Limpiar formulario
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

// Actualizar reloj en tiempo real
function actualizarReloj() {
    const relojElement = document.getElementById('currentTime');
    if (relojElement) {
        const ahora = new Date();
        relojElement.textContent = ahora.toLocaleTimeString('es-CO');
    }
}

// Actualizar dashboard
function actualizarDashboard() {
    const vehiculosActivos = db.getVehiculosActivos();
    const ocupacion = db.getOcupacion();
    const estadisticasHoy = db.getEstadisticasDia();
    
    // Actualizar contadores
    document.getElementById('vehiculosActivos').textContent = vehiculosActivos.length;
    document.getElementById('espaciosDisponibles').textContent = ocupacion.disponibles;
    document.getElementById('ingresosHoy').textContent = formatearMoneda(estadisticasHoy.ingresos);
    document.getElementById('ocupacion').textContent = `${ocupacion.porcentaje}%`;
}

// Cargar vehículos activos en la grilla
function cargarVehiculosActivos() {
    const vehiculos = db.getVehiculosActivos();
    const grid = document.getElementById('vehiculosGrid');
    
    if (grid) {
        grid.innerHTML = '';
        
        if (vehiculos.length === 0) {
            grid.innerHTML = '<p class="no-vehiculos">No hay vehículos en el parqueadero</p>';
            return;
        }
        
        vehiculos.forEach(vehiculo => {
            const card = crearTarjetaVehiculo(vehiculo);
            grid.appendChild(card);
        });
    }
}

// Crear tarjeta de vehículo
function crearTarjetaVehiculo(vehiculo) {
    const card = document.createElement('div');
    card.className = 'vehiculo-card';
    
    const tiempoTranscurrido = Date.now() - new Date(vehiculo.entrada).getTime();
    const tiempoFormateado = formatearTiempo(tiempoTranscurrido);
    
    card.innerHTML = `
        <div class="vehiculo-header">
            <div class="placa">${vehiculo.placa}</div>
            <span class="tipo-vehiculo tipo-${vehiculo.tipo}">${formatearTipoVehiculo(vehiculo.tipo)}</span>
        </div>
        <div class="vehiculo-info">
            <div class="info-item">
                <span class="info-label">Propietario:</span>
                <span class="info-value">${vehiculo.propietario}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Casa:</span>
                <span class="info-value">${vehiculo.direccion}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tipo:</span>
                <span class="info-value">${vehiculo.esResidente ? 'Residente' : 'Visitante'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${vehiculo.tipo === 'moto' ? 'Puesto Moto:' : 'Parqueadero:'}</span>
                <span class="info-value">${vehiculo.numeroParqueadero || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Puesto:</span>
                <span class="info-value">${vehiculo.numeroPuesto}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Entrada:</span>
                <span class="info-value">${formatearFechaHora(vehiculo.entrada)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tiempo:</span>
                <span class="info-value">${tiempoFormateado}</span>
            </div>
            ${vehiculo.observaciones ? `
            <div class="info-item">
                <span class="info-label">Observaciones:</span>
                <span class="info-value">${vehiculo.observaciones}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Buscar vehículos en tiempo real
function buscarVehiculos(termino) {
    const vehiculos = db.getVehiculosActivos();
    const grid = document.getElementById('vehiculosGrid');
    
    if (!grid) return;
    
    const vehiculosFiltrados = vehiculos.filter(vehiculo =>
        vehiculo.placa.toLowerCase().includes(termino.toLowerCase()) ||
        vehiculo.propietario.toLowerCase().includes(termino.toLowerCase()) ||
        vehiculo.direccion.toLowerCase().includes(termino.toLowerCase())
    );
    
    grid.innerHTML = '';
    
    if (vehiculosFiltrados.length === 0) {
        grid.innerHTML = '<p class="no-vehiculos">No se encontraron vehículos</p>';
        return;
    }
    
    vehiculosFiltrados.forEach(vehiculo => {
        const card = crearTarjetaVehiculo(vehiculo);
        grid.appendChild(card);
    });
}

// Validar formulario de entrada
function validarFormularioEntrada(formData) {
    const errores = [];
    
    if (!formData.placa) {
        errores.push('La placa es obligatoria');
    } else if (!validarPlaca(formData.placa)) {
        errores.push('Formato de placa inválido');
    }
    
    if (!formData.tipo) {
        errores.push('Debe seleccionar el tipo de vehículo');
    }
    
    if (!formData.propietario) {
        errores.push('El propietario es obligatorio');
    }
    
    if (!formData.direccion) {
        errores.push('La casa es obligatoria');
    }
    
    if (!formData.telefono) {
        errores.push('El teléfono es obligatorio');
    }
    
    // Solo validar parqueadero y puesto para residentes
    if (formData.esResidente === 'true') {
        if (!formData.numeroParqueadero) {
            errores.push('Debe seleccionar el parqueadero para residentes');
        }
        
        if (!formData.numeroPuesto) {
            errores.push('Debe seleccionar el puesto para residentes');
        }
    }
    
    if (!formData.esResidente) {
        errores.push('Debe seleccionar el tipo de usuario (Residente o Visitante)');
    }
    
    return errores;
}

// Validar formulario de salida
function validarFormularioSalida(formData) {
    const errores = [];
    
    if (!formData.placa) {
        errores.push('La placa es obligatoria');
    }
    
    if (!formData.metodoPago) {
        errores.push('Debe seleccionar el método de pago');
    }
    
    return errores;
}

// Confirmar acción con diálogo
function confirmarAccion(mensaje, callback) {
    if (confirm(mensaje)) {
        callback();
    }
}

// Exportar datos
function exportarDatos() {
    try {
        db.exportarDatos();
        mostrarNotificacion('Datos exportados correctamente', 'success');
    } catch (error) {
        mostrarNotificacion('Error al exportar datos: ' + error.message, 'error');
    }
}

// Importar datos
function importarDatos() {
    const input = document.getElementById('importFile');
    if (input) {
        input.click();
    }
}

// Manejar archivo de importación
function manejarImportacionArchivo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            if (db.importarDatos(datos)) {
                mostrarNotificacion('Datos importados correctamente', 'success');
                // Recargar la interfaz
                actualizarDashboard();
                cargarVehiculosActivos();
            } else {
                mostrarNotificacion('Error al importar datos', 'error');
            }
        } catch (error) {
            mostrarNotificacion('Archivo inválido: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Limpiar el input
    event.target.value = '';
}

// Manejar archivo Excel de usuarios
function manejarImportacionExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
                mostrarNotificacion('El archivo Excel debe tener al menos una fila de datos', 'error');
                return;
            }
            
            // Procesar los datos
            const usuarios = procesarDatosExcel(jsonData);
            if (usuarios.length > 0) {
                const resultado = db.importarUsuarios(usuarios);
                mostrarNotificacion(`${resultado.importados} usuarios importados correctamente. ${resultado.errores} errores.`, 'success');
                // Recargar la interfaz
                actualizarDashboard();
                cargarVehiculosActivos();
            } else {
                mostrarNotificacion('No se encontraron datos válidos en el archivo', 'error');
            }
            
        } catch (error) {
            console.error('Error al procesar Excel:', error);
            mostrarNotificacion('Error al procesar archivo Excel: ' + error.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
    
    // Limpiar el input
    event.target.value = '';
}

// Procesar datos del Excel
function procesarDatosExcel(jsonData) {
    const usuarios = [];
    const headers = jsonData[0]; // Primera fila como encabezados
    
    // Validar que los encabezados sean correctos
    const headersEsperados = ['Placa', 'Tipo', 'Propietario', 'Casa', 'Teléfono', 'Es Residente', 'Parqueadero', 'Puesto'];
    const headersEncontrados = headers.map(h => h.toString().trim());
    
    for (let i = 0; i < headersEsperados.length; i++) {
        if (!headersEncontrados[i] || !headersEncontrados[i].toLowerCase().includes(headersEsperados[i].toLowerCase())) {
            mostrarNotificacion(`Columna ${i + 1} debe ser "${headersEsperados[i]}"`, 'error');
            return [];
        }
    }
    
    // Procesar filas de datos
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row.length === 0 || !row[0]) continue; // Fila vacía
        
        try {
            const usuario = {
                placa: (row[0] || '').toString().trim().toUpperCase(),
                tipo: (row[1] || '').toString().trim().toLowerCase(),
                propietario: (row[2] || '').toString().trim(),
                direccion: (row[3] || '').toString().trim(),
                telefono: (row[4] || '').toString().trim(),
                esResidente: normalizarBooleano(row[5]),
                numeroParqueadero: row[6] ? parseInt(row[6]) : null,
                numeroPuesto: row[7] ? parseInt(row[7]) : null
            };
            
            // Validar datos obligatorios
            if (!usuario.placa || !usuario.tipo || !usuario.propietario || !usuario.direccion) {
                console.warn(`Fila ${i + 1}: Datos incompletos`, usuario);
                continue;
            }
            
            // Validar tipo de vehículo
            if (!['automovil', 'camioneta', 'moto'].includes(usuario.tipo)) {
                console.warn(`Fila ${i + 1}: Tipo de vehículo inválido: ${usuario.tipo}`);
                continue;
            }
            
            // Validar parqueadero y puesto para residentes
            if (usuario.esResidente) {
                if (!usuario.numeroParqueadero || usuario.numeroParqueadero < 1 || usuario.numeroParqueadero > 4) {
                    console.warn(`Fila ${i + 1}: Parqueadero inválido para residente: ${usuario.numeroParqueadero}`);
                    continue;
                }
                
                // Validar puesto según el parqueadero
                const config = db.getConfig();
                const puestosEnParqueadero = config.parqueaderos.puestosPorParqueadero[usuario.numeroParqueadero - 1];
                if (!usuario.numeroPuesto || usuario.numeroPuesto < 1 || usuario.numeroPuesto > puestosEnParqueadero) {
                    console.warn(`Fila ${i + 1}: Puesto inválido para residente en parqueadero ${usuario.numeroParqueadero}: ${usuario.numeroPuesto} (máximo ${puestosEnParqueadero})`);
                    continue;
                }
            }
            
            usuarios.push(usuario);
            
        } catch (error) {
            console.error(`Error procesando fila ${i + 1}:`, error);
        }
    }
    
    return usuarios;
}

// Normalizar valores booleanos
function normalizarBooleano(valor) {
    if (typeof valor === 'boolean') return valor;
    if (typeof valor === 'string') {
        const str = valor.toLowerCase().trim();
        return ['true', 'sí', 'si', 'yes', '1', 'verdadero'].includes(str);
    }
    if (typeof valor === 'number') return valor === 1;
    return false;
}

// Formatear tipo de vehículo para mostrar
function formatearTipoVehiculo(tipo) {
    const tipos = {
        'automovil': 'Automóvil',
        'camioneta': 'Camioneta',
        'moto': 'Moto'
    };
    return tipos[tipo] || tipo;
}

// Formatear método de pago
function formatearMetodoPago(metodo) {
    const metodos = {
        'efectivo': 'Efectivo',
        'tarjeta': 'Tarjeta',
        'transferencia': 'Transferencia'
    };
    return metodos[metodo] || metodo;
}

// Cargar puestos por parqueadero
function cargarPuestosPorParqueadero(parqueadero) {
    console.log('🔄 Cargando puestos para parqueadero:', parqueadero);
    
    const selectPuesto = document.getElementById('numeroPuesto');
    if (!selectPuesto) {
        console.error('❌ No se encontró el elemento numeroPuesto');
        return;
    }
    
    selectPuesto.innerHTML = '<option value="">Seleccionar puesto</option>';
    
    if (parqueadero) {
        const config = db.getConfig();
        console.log('📋 Configuración cargada:', config.parqueaderos);
        
        const puestosEnParqueadero = config.parqueaderos.puestosPorParqueadero[parqueadero - 1];
        console.log(`📊 Parqueadero ${parqueadero} tiene ${puestosEnParqueadero} puestos`);
        
        for (let puesto = 1; puesto <= puestosEnParqueadero; puesto++) {
            const option = document.createElement('option');
            option.value = puesto;
            option.textContent = `Puesto ${puesto.toString().padStart(3, '0')}`;
            selectPuesto.appendChild(option);
        }
        console.log(`✅ Puestos cargados para parqueadero ${parqueadero}: ${puestosEnParqueadero} puestos`);
    } else {
        console.log('⚠️ No se seleccionó parqueadero');
    }
}

// Reinicializar sistema
function reinicializarSistema() {
    if (confirm('¿Está seguro de que desea reinicializar el sistema? Esto eliminará todos los datos existentes.')) {
        try {
            db.limpiarDatos();
            db.reinicializarConfiguracion(); // Asegurar configuración correcta
            mostrarNotificacion('Sistema reinicializado correctamente', 'success');
            actualizarDashboard();
            cargarVehiculosActivos();
        } catch (error) {
            mostrarNotificacion('Error al reinicializar sistema: ' + error.message, 'error');
        }
    }
}

// Función de emergencia para limpiar configuración corrupta
function limpiarConfiguracionCorrupta() {
    if (confirm('¿Está seguro de que desea limpiar la configuración corrupta? Esto solo afectará la configuración, no los datos.')) {
        try {
            const config = db.limpiarConfiguracionCorrupta();
            mostrarNotificacion('Configuración corrupta limpiada correctamente', 'success');
            console.log('Configuración limpia aplicada:', config);
        } catch (error) {
            mostrarNotificacion('Error al limpiar configuración: ' + error.message, 'error');
        }
    }
}

// Función para actualizar horario a 24 horas
function actualizarHorario24Horas() {
    if (confirm('¿Desea actualizar el horario del parqueadero a 24 horas?')) {
        try {
            const config = db.getConfig();
            config.horario.apertura = '00:00';
            config.horario.cierre = '23:59';
            db.saveConfig(config);
            mostrarNotificacion('Horario actualizado a 24 horas correctamente', 'success');
            console.log('Horario actualizado:', config.horario);
        } catch (error) {
            mostrarNotificacion('Error al actualizar horario: ' + error.message, 'error');
        }
    }
}

// Inicializar utilidades
function inicializarUtilidades() {
    // Actualizar reloj cada segundo
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
    
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
    
    // Configurar importación de archivos Excel
    const importExcelFile = document.getElementById('importExcelFile');
    if (importExcelFile) {
        importExcelFile.addEventListener('change', manejarImportacionExcel);
    }
    
    // Configurar cambio de parqueadero
    const selectParqueadero = document.getElementById('numeroParqueadero');
    if (selectParqueadero) {
        selectParqueadero.addEventListener('change', (e) => {
            cargarPuestosPorParqueadero(e.target.value);
        });
    }
    
    // Configurar cambio de tipo de usuario
    const selectTipoUsuario = document.getElementById('esResidente');
    if (selectTipoUsuario) {
        console.log('🔧 Configurando evento de cambio de tipo de usuario en utils');
        selectTipoUsuario.addEventListener('change', (e) => {
            console.log('🔄 Cambio de tipo de usuario detectado en utils:', e.target.value);
            toggleCamposParqueadero(e.target.value === 'true');
        });
    } else {
        console.error('❌ No se encontró el elemento esResidente en utils');
    }
    
    // Verificar horario
    verificarHorario();
}

// Verificar si el parqueadero está abierto
function parqueaderoAbierto() {
    const config = db.getConfig();
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
    const apertura = config.horario.apertura.split(':');
    const cierre = config.horario.cierre.split(':');
    const horaApertura = parseInt(apertura[0]) * 60 + parseInt(apertura[1]);
    const horaCierre = parseInt(cierre[0]) * 60 + parseInt(cierre[1]);
    
    return horaActual >= horaApertura && horaActual <= horaCierre;
}

// Mostrar advertencia si el parqueadero está cerrado
function verificarHorario() {
    // El parqueadero funciona 24 horas, no mostrar advertencia
    console.log('🕐 Parqueadero funcionando 24 horas - sin restricciones de horario');
}

// Mostrar/ocultar campos de parqueadero según tipo de usuario
function toggleCamposParqueadero(esResidente) {
    console.log('🔄 Toggle campos parqueadero - esResidente:', esResidente);
    
    const parqueaderoGroup = document.getElementById('parqueaderoGroup');
    const puestoGroup = document.getElementById('puestoGroup');
    const selectParqueadero = document.getElementById('numeroParqueadero');
    const selectPuesto = document.getElementById('numeroPuesto');
    
    console.log('🔍 Elementos encontrados:', {
        parqueaderoGroup: !!parqueaderoGroup,
        puestoGroup: !!puestoGroup,
        selectParqueadero: !!selectParqueadero,
        selectPuesto: !!selectPuesto
    });
    
    if (esResidente) {
        // Mostrar campos para residentes
        if (parqueaderoGroup) parqueaderoGroup.style.display = 'block';
        if (puestoGroup) puestoGroup.style.display = 'block';
        if (selectParqueadero) selectParqueadero.required = true;
        if (selectPuesto) selectPuesto.required = true;
        console.log('✅ Campos de parqueadero mostrados para residente');
    } else {
        // Ocultar campos para visitantes
        if (parqueaderoGroup) parqueaderoGroup.style.display = 'none';
        if (puestoGroup) puestoGroup.style.display = 'none';
        if (selectParqueadero) {
            selectParqueadero.required = false;
            selectParqueadero.value = '';
        }
        if (selectPuesto) {
            selectPuesto.required = false;
            selectPuesto.value = '';
        }
        console.log('✅ Campos de parqueadero ocultos para visitante');
    }
} 