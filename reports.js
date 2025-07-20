// Sistema de Reportes para Parqueadero Protecho Bogotá II

// Generar reporte por rango de fechas
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

// Mostrar reporte en la interfaz
function mostrarReporte(reporte, fechaInicio, fechaFin) {
    // Actualizar estadísticas
    document.getElementById('ingresosTotales').textContent = formatearMoneda(reporte.ingresos);
    document.getElementById('vehiculosAtendidos').textContent = reporte.vehiculosAtendidos;
    document.getElementById('promedioVehiculo').textContent = formatearMoneda(reporte.promedio);
    
    // Cargar tabla de transacciones
    cargarTablaTransacciones(reporte.transacciones);
    
    // Mostrar estadísticas por tipo de vehículo
    mostrarEstadisticasPorTipo(reporte.statsPorTipo);
}

// Cargar tabla de transacciones
function cargarTablaTransacciones(transacciones) {
    const tbody = document.getElementById('transaccionesBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (transacciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No hay transacciones en este período</td></tr>';
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    transacciones.forEach(transaccion => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatearFecha(transaccion.fecha)}</td>
            <td><strong>${transaccion.placa}</strong></td>
            <td><span class="tipo-vehiculo tipo-${transaccion.tipo}">${formatearTipoVehiculo(transaccion.tipo)}</span></td>
            <td>${formatearFechaHora(transaccion.entrada)}</td>
            <td>${formatearFechaHora(transaccion.salida)}</td>
            <td>${formatearTiempo(transaccion.tiempo)}</td>
            <td><strong>${formatearMoneda(transaccion.total)}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Mostrar estadísticas por tipo de vehículo
function mostrarEstadisticasPorTipo(statsPorTipo) {
    // Crear o actualizar sección de estadísticas por tipo
    let statsSection = document.querySelector('.stats-por-tipo');
    if (!statsSection) {
        statsSection = document.createElement('div');
        statsSection.className = 'stats-por-tipo';
        statsSection.innerHTML = '<h3>Estadísticas por Tipo de Vehículo</h3>';
        document.querySelector('.reportes-stats').after(statsSection);
    }
    
    const statsHTML = Object.entries(statsPorTipo).map(([tipo, stats]) => `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-${getIconoTipoVehiculo(tipo)}"></i>
            </div>
            <div class="stat-info">
                <h3>${formatearTipoVehiculo(tipo)}</h3>
                <p>Cantidad: ${stats.cantidad}</p>
                <p>Ingresos: ${formatearMoneda(stats.ingresos)}</p>
            </div>
        </div>
    `).join('');
    
    statsSection.innerHTML = `
        <h3>Estadísticas por Tipo de Vehículo</h3>
        <div class="stats-grid">
            ${statsHTML}
        </div>
    `;
}

// Obtener icono según tipo de vehículo
function getIconoTipoVehiculo(tipo) {
    const iconos = {
        'carro': 'car',
        'moto': 'motorcycle',
        'camion': 'truck'
    };
    return iconos[tipo] || 'car';
}

// Generar reporte PDF
function generarReportePDF(fechaInicio, fechaFin) {
    const reporte = db.getReporteRango(new Date(fechaInicio), new Date(fechaFin));
    
    // Crear contenido del PDF
    const contenido = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #667eea; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat { text-align: center; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { background-color: #f8f9fa; }
                .total { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Protecho Bogotá II</h1>
                <h2>Reporte de Parqueadero</h2>
                <p>Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}</p>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <h3>Ingresos Totales</h3>
                    <p>${formatearMoneda(reporte.ingresos)}</p>
                </div>
                <div class="stat">
                    <h3>Vehículos Atendidos</h3>
                    <p>${reporte.vehiculosAtendidos}</p>
                </div>
                <div class="stat">
                    <h3>Promedio por Vehículo</h3>
                    <p>${formatearMoneda(reporte.promedio)}</p>
                </div>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Placa</th>
                        <th>Tipo</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Tiempo</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${reporte.transacciones.map(t => `
                        <tr>
                            <td>${formatearFecha(t.fecha)}</td>
                            <td>${t.placa}</td>
                            <td>${formatearTipoVehiculo(t.tipo)}</td>
                            <td>${formatearFechaHora(t.entrada)}</td>
                            <td>${formatearFechaHora(t.salida)}</td>
                            <td>${formatearTiempo(t.tiempo)}</td>
                            <td>${formatearMoneda(t.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">
                <p><strong>Total de Ingresos: ${formatearMoneda(reporte.ingresos)}</strong></p>
            </div>
        </body>
        </html>
    `;
    
    // Generar PDF usando la API del navegador
    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.print();
}

// Exportar reporte a Excel (CSV)
function exportarReporteCSV(fechaInicio, fechaFin) {
    const reporte = db.getReporteRango(new Date(fechaInicio), new Date(fechaFin));
    
    // Crear contenido CSV
    const headers = ['Fecha', 'Placa', 'Tipo', 'Entrada', 'Salida', 'Tiempo (min)', 'Total'];
    const rows = reporte.transacciones.map(t => [
        formatearFecha(t.fecha),
        t.placa,
        formatearTipoVehiculo(t.tipo),
        formatearFechaHora(t.entrada),
        formatearFechaHora(t.salida),
        Math.round(t.tiempo / (1000 * 60)),
        t.total
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_parqueadero_${fechaInicio}_${fechaFin}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generar reporte diario
function generarReporteDiario(fecha = new Date()) {
    const estadisticas = db.getEstadisticasDia(fecha);
    const fechaStr = formatearFecha(fecha);
    
    mostrarNotificacion(`Reporte del ${fechaStr} generado`, 'info');
    
    // Actualizar dashboard con datos del día
    document.getElementById('ingresosHoy').textContent = formatearMoneda(estadisticas.ingresos);
    
    return estadisticas;
}

// Generar reporte mensual
function generarReporteMensual(anio, mes) {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0); // Último día del mes
    
    const reporte = db.getReporteRango(fechaInicio, fechaFin);
    
    // Estadísticas adicionales para reporte mensual
    const diasConActividad = new Set(reporte.transacciones.map(t => 
        t.fecha.split('T')[0]
    )).size;
    
    const promedioDiario = diasConActividad > 0 ? reporte.ingresos / diasConActividad : 0;
    
    return {
        ...reporte,
        diasConActividad,
        promedioDiario,
        mes: fechaInicio.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    };
}

// Mostrar gráfico de ocupación (simulado)
function mostrarGraficoOcupacion() {
    const ocupacion = db.getOcupacion();
    const config = db.getConfig();
    
    // Crear gráfico simple con CSS
    const graficoHTML = `
        <div class="grafico-ocupacion">
            <h3>Estado de Ocupación</h3>
            <div class="grafico-barras">
                <div class="barra">
                    <div class="barra-fill" style="width: ${ocupacion.porcentaje}%"></div>
                    <span class="barra-label">Ocupados: ${ocupacion.ocupados}/${ocupacion.total}</span>
                </div>
            </div>
            <div class="detalle-ocupacion">
                <p><strong>Total de espacios:</strong> ${ocupacion.total}</p>
                <p><strong>Ocupados:</strong> ${ocupacion.ocupados}</p>
                <p><strong>Disponibles:</strong> ${ocupacion.disponibles}</p>
                <p><strong>Porcentaje de ocupación:</strong> ${ocupacion.porcentaje}%</p>
            </div>
        </div>
    `;
    
    // Insertar en la página si no existe
    if (!document.querySelector('.grafico-ocupacion')) {
        const container = document.querySelector('.dashboard-overview');
        if (container) {
            const graficoDiv = document.createElement('div');
            graficoDiv.innerHTML = graficoHTML;
            container.appendChild(graficoDiv.firstElementChild);
        }
    }
}

// Generar reporte de eficiencia
function generarReporteEficiencia() {
    const transacciones = JSON.parse(localStorage.getItem('parqueadero_transacciones'));
    const config = db.getConfig();
    
    if (transacciones.length === 0) {
        return {
            eficiencia: 0,
            promedioTiempo: 0,
            rotacion: 0
        };
    }
    
    // Calcular eficiencia basada en tiempo promedio de estacionamiento
    const tiempos = transacciones.map(t => t.tiempo / (1000 * 60 * 60)); // en horas
    const promedioTiempo = tiempos.reduce((sum, t) => sum + t, 0) / tiempos.length;
    
    // Eficiencia: menor tiempo = mayor eficiencia (hasta 4 horas = 100%)
    const eficiencia = Math.max(0, Math.min(100, (4 - promedioTiempo) / 4 * 100));
    
    // Rotación de espacios (vehículos por espacio por día)
    const espacios = config.espacios.total;
    const diasOperacion = Math.max(1, (Date.now() - new Date(transacciones[0].fecha).getTime()) / (1000 * 60 * 60 * 24));
    const rotacion = transacciones.length / espacios / diasOperacion;
    
    return {
        eficiencia: Math.round(eficiencia),
        promedioTiempo: Math.round(promedioTiempo * 100) / 100,
        rotacion: Math.round(rotacion * 100) / 100
    };
}

// Mostrar reporte de eficiencia
function mostrarReporteEficiencia() {
    const eficiencia = generarReporteEficiencia();
    
    const reporteHTML = `
        <div class="reporte-eficiencia">
            <h3>Reporte de Eficiencia</h3>
            <div class="eficiencia-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${eficiencia.eficiencia}%</h3>
                        <p>Eficiencia</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${eficiencia.promedioTiempo}h</h3>
                        <p>Tiempo Promedio</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-sync-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${eficiencia.rotacion}</h3>
                        <p>Rotación/Día</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar en la página
    const container = document.querySelector('.reportes-container');
    if (container && !document.querySelector('.reporte-eficiencia')) {
        const div = document.createElement('div');
        div.innerHTML = reporteHTML;
        container.appendChild(div.firstElementChild);
    }
}

// Inicializar reportes
function inicializarReportes() {
    // Configurar fecha por defecto (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaInicio').value = hoy;
    document.getElementById('fechaFin').value = hoy;
    
    // Generar reporte inicial
    generarReporte();
    
    // Mostrar gráfico de ocupación
    mostrarGraficoOcupacion();
    
    // Mostrar reporte de eficiencia
    mostrarReporteEficiencia();
} 