// Sistema de Base de Datos para Parqueadero Protecho Bogotá II
class ParqueaderoDatabase {
    constructor() {
        this.initializeDatabase();
    }

    // Inicializar base de datos
    initializeDatabase() {
        // Configuración por defecto del conjunto residencial
        const defaultConfig = {
            tarifas: {
                residente: {
                    automovil: 150800,
                    moto: 80000
                },
                visitante: {
                    automovil: 5000,
                    moto: 3000
                }
            },
            parqueaderos: {
                total: 4,
                puestosPorParqueadero: [80, 115, 50, 40] // Puestos por cada parqueadero
            },
            puestosMotos: {
                total: 20
            },
            horario: {
                apertura: '00:00',
                cierre: '23:59'
            }
        };

        // Inicializar configuración si no existe
        if (!localStorage.getItem('parqueadero_config')) {
            localStorage.setItem('parqueadero_config', JSON.stringify(defaultConfig));
        }

        // Inicializar arrays de datos si no existen
        if (!localStorage.getItem('parqueadero_vehiculos')) {
            localStorage.setItem('parqueadero_vehiculos', JSON.stringify([]));
        }

        if (!localStorage.getItem('parqueadero_transacciones')) {
            localStorage.setItem('parqueadero_transacciones', JSON.stringify([]));
        }

        if (!localStorage.getItem('parqueadero_espacios')) {
            this.initializeEspacios();
        }
    }

    // Inicializar espacios de parqueo
    initializeEspacios() {
        const config = this.getConfig();
        const espacios = [];
        
        // Crear 4 parqueaderos con diferentes números de puestos para automóviles y camionetas
        for (let parqueadero = 1; parqueadero <= config.parqueaderos.total; parqueadero++) {
            const puestosEnParqueadero = config.parqueaderos.puestosPorParqueadero[parqueadero - 1];
            for (let puesto = 1; puesto <= puestosEnParqueadero; puesto++) {
                espacios.push({
                    id: `P${parqueadero}-${puesto.toString().padStart(3, '0')}`,
                    parqueadero: parqueadero,
                    puesto: puesto,
                    tipo: 'automovil', // Los espacios son iguales para automóvil y camioneta
                    ocupado: false,
                    vehiculo: null,
                    esResidente: false
                });
            }
        }
        
        // Crear puestos de motos
        for (let puesto = 1; puesto <= config.puestosMotos.total; puesto++) {
            espacios.push({
                id: `M${puesto.toString().padStart(2, '0')}`,
                parqueadero: 0, // Los puestos de motos no están en parqueaderos específicos
                puesto: puesto,
                tipo: 'moto',
                ocupado: false,
                vehiculo: null,
                esResidente: false
            });
        }

        localStorage.setItem('parqueadero_espacios', JSON.stringify(espacios));
    }

    // Obtener configuración
    getConfig() {
        return JSON.parse(localStorage.getItem('parqueadero_config'));
    }

    // Guardar configuración
    saveConfig(config) {
        localStorage.setItem('parqueadero_config', JSON.stringify(config));
    }

    // Obtener vehículos activos
    getVehiculosActivos() {
        const vehiculos = JSON.parse(localStorage.getItem('parqueadero_vehiculos'));
        return vehiculos.filter(v => v.activo);
    }

    // Obtener todos los vehículos
    getAllVehiculos() {
        return JSON.parse(localStorage.getItem('parqueadero_vehiculos'));
    }

    // Buscar vehículo por placa
    buscarVehiculo(placa) {
        const vehiculos = this.getAllVehiculos();
        return vehiculos.find(v => v.placa.toUpperCase() === placa.toUpperCase());
    }

    // Registrar entrada de vehículo
    registrarEntrada(vehiculoData) {
        const vehiculos = this.getAllVehiculos();
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        
        // Verificar si el vehículo ya está en el parqueadero
        const vehiculoExistente = this.buscarVehiculo(vehiculoData.placa);
        if (vehiculoExistente && vehiculoExistente.activo) {
            throw new Error('El vehículo ya está registrado en el parqueadero');
        }

        // Determinar si es residente o visitante
        const esResidente = vehiculoData.esResidente === 'true' || vehiculoData.esResidente === true;
        
        let espacio;
        let espacioId;
        
        if (vehiculoData.tipo === 'moto') {
            // Para motos, buscar puesto de moto disponible
            espacio = espacios.find(e => e.tipo === 'moto' && !e.ocupado);
            if (!espacio) {
                throw new Error('No hay puestos de moto disponibles');
            }
            espacioId = espacio.id;
        } else {
            // Para automóviles y camionetas
            if (esResidente) {
                // Residentes: usar puesto específico asignado
                espacioId = `P${vehiculoData.numeroParqueadero}-${vehiculoData.numeroPuesto.toString().padStart(3, '0')}`;
                espacio = espacios.find(e => e.id === espacioId);
                
                if (!espacio) {
                    throw new Error(`El espacio ${espacioId} no existe`);
                }
                
                if (espacio.ocupado) {
                    throw new Error(`El espacio ${espacioId} ya está ocupado`);
                }
            } else {
                // Visitantes: asignar automáticamente el primer espacio disponible
                espacio = espacios.find(e => e.tipo === 'automovil' && !e.ocupado);
                if (!espacio) {
                    throw new Error('No hay espacios disponibles para visitantes');
                }
                espacioId = espacio.id;
                console.log('Espacio asignado automáticamente para visitante:', espacioId);
            }
        }

        // Crear registro de vehículo
        const vehiculo = {
            id: Date.now().toString(),
            placa: vehiculoData.placa.toUpperCase(),
            tipo: vehiculoData.tipo,
            propietario: vehiculoData.propietario,
            direccion: vehiculoData.direccion,
            telefono: vehiculoData.telefono,
            numeroParqueadero: espacio.parqueadero,
            numeroPuesto: espacio.puesto,
            espacio: espacioId,
            esResidente: esResidente,
            entrada: new Date().toISOString(),
            observaciones: vehiculoData.observaciones || '',
            activo: true,
            salida: null,
            tiempo: null,
            total: null,
            metodoPago: null,
            descuento: null
        };

        console.log('Vehículo registrado:', {
            placa: vehiculo.placa,
            tipo: vehiculo.tipo,
            esResidente: vehiculo.esResidente,
            parqueadero: vehiculo.numeroParqueadero,
            puesto: vehiculo.numeroPuesto,
            espacio: vehiculo.espacio
        });

        // Actualizar espacio
        espacio.ocupado = true;
        espacio.vehiculo = vehiculo.id;
        espacio.esResidente = esResidente;

        // Guardar datos
        vehiculos.push(vehiculo);
        localStorage.setItem('parqueadero_vehiculos', JSON.stringify(vehiculos));
        localStorage.setItem('parqueadero_espacios', JSON.stringify(espacios));

        return vehiculo;
    }

    // Calcular cobro para salida
    calcularCobro(placa) {
        const vehiculo = this.buscarVehiculo(placa);
        if (!vehiculo || !vehiculo.activo) {
            throw new Error('Vehículo no encontrado o ya no está en el parqueadero');
        }

        const config = this.getConfig();
        const entrada = new Date(vehiculo.entrada);
        const salida = new Date();
        const tiempoMs = salida - entrada;
        
        // Si es residente, calcular meses completos
        if (vehiculo.esResidente) {
            const mesesCompletos = this.calcularMesesCompletos(entrada, salida);
            
            // Para camionetas usar la tarifa de automóvil
            const tipoTarifa = vehiculo.tipo === 'camioneta' ? 'automovil' : vehiculo.tipo;
            const tarifaMensual = config.tarifas.residente[tipoTarifa];
            const subtotal = mesesCompletos * tarifaMensual;
            
            console.log('Cálculo para residente:', {
                placa: vehiculo.placa,
                tipo: vehiculo.tipo,
                tipoTarifa,
                mesesCompletos,
                tarifaMensual,
                subtotal
            });
            
            return {
                vehiculo,
                tiempoMs,
                mesesCompletos,
                tarifaMensual,
                subtotal,
                entrada,
                salida,
                esResidente: true,
                esVisitante: false
            };
        } else {
            // Si es visitante, calcular por períodos de 12 horas
            const horas = tiempoMs / (1000 * 60 * 60);
            const periodos12Horas = Math.ceil(horas / 12);
            
            // Para camionetas usar la tarifa de automóvil
            const tipoTarifa = vehiculo.tipo === 'camioneta' ? 'automovil' : vehiculo.tipo;
            const tarifa12Horas = config.tarifas.visitante[tipoTarifa];
            const subtotal = periodos12Horas * tarifa12Horas;
            
            console.log('Debug cálculo visitante:', {
                tipoOriginal: vehiculo.tipo,
                tipoTarifa,
                tarifasDisponibles: Object.keys(config.tarifas.visitante),
                tarifaEncontrada: config.tarifas.visitante[tipoTarifa],
                configCompleta: config.tarifas.visitante
            });
            
            console.log('Cálculo para visitante:', {
                placa: vehiculo.placa,
                tipo: vehiculo.tipo,
                tipoTarifa,
                tiempoMs,
                horas,
                periodos12Horas,
                tarifa12Horas,
                subtotal,
                configTarifas: config.tarifas.visitante
            });
            
            return {
                vehiculo,
                tiempoMs,
                horas,
                periodos12Horas,
                tarifa12Horas,
                subtotal,
                entrada,
                salida,
                esResidente: false,
                esVisitante: true
            };
        }
    }

    // Calcular meses completos entre dos fechas
    calcularMesesCompletos(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        const añoInicio = inicio.getFullYear();
        const mesInicio = inicio.getMonth();
        const díaInicio = inicio.getDate();
        
        const añoFin = fin.getFullYear();
        const mesFin = fin.getMonth();
        const díaFin = fin.getDate();
        
        let meses = (añoFin - añoInicio) * 12 + (mesFin - mesInicio);
        
        // Si el día de salida es menor al día de entrada, no cuenta como mes completo
        if (díaFin < díaInicio) {
            meses--;
        }
        
        return Math.max(0, meses);
    }

    // Registrar salida de vehículo
    registrarSalida(placa, metodoPago, descuento = 0) {
        const vehiculos = this.getAllVehiculos();
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        const transacciones = JSON.parse(localStorage.getItem('parqueadero_transacciones'));

        const vehiculo = this.buscarVehiculo(placa);
        if (!vehiculo || !vehiculo.activo) {
            throw new Error('Vehículo no encontrado o ya no está en el parqueadero');
        }

        // Calcular cobro
        const cobro = this.calcularCobro(placa);
        const descuentoMonto = (cobro.subtotal * descuento) / 100;
        const total = cobro.subtotal - descuentoMonto;

        // Actualizar vehículo
        vehiculo.activo = false;
        vehiculo.salida = cobro.salida.toISOString();
        vehiculo.tiempo = cobro.tiempoMs;
        vehiculo.total = total;
        vehiculo.metodoPago = metodoPago;
        vehiculo.descuento = descuento;

        // Liberar espacio
        const espacio = espacios.find(e => e.id === vehiculo.espacio);
        if (espacio) {
            espacio.ocupado = false;
            espacio.vehiculo = null;
        }

        // Crear transacción
        const transaccion = {
            id: Date.now().toString(),
            vehiculoId: vehiculo.id,
            placa: vehiculo.placa,
            tipo: vehiculo.tipo,
            propietario: vehiculo.propietario,
            direccion: vehiculo.direccion,
            entrada: vehiculo.entrada,
            salida: vehiculo.salida,
            tiempo: vehiculo.tiempo,
            meses: cobro.mesesCompletos || 0,
            horas: cobro.horas || 0,
            periodos12Horas: cobro.periodos12Horas || 0,
            tarifaMensual: cobro.tarifaMensual || 0,
            tarifa12Horas: cobro.tarifa12Horas || 0,
            subtotal: cobro.subtotal,
            descuento: descuento,
            total: total,
            metodoPago: metodoPago,
            esResidente: cobro.esResidente,
            esVisitante: cobro.esVisitante,
            fecha: new Date().toISOString()
        };

        // Guardar datos
        localStorage.setItem('parqueadero_vehiculos', JSON.stringify(vehiculos));
        localStorage.setItem('parqueadero_espacios', JSON.stringify(espacios));
        transacciones.push(transaccion);
        localStorage.setItem('parqueadero_transacciones', JSON.stringify(transacciones));

        return {
            vehiculo,
            transaccion,
            cobro
        };
    }

    // Obtener espacios disponibles
    getEspaciosDisponibles() {
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        return espacios.filter(e => !e.ocupado);
    }

    // Obtener espacios por tipo
    getEspaciosPorTipo(tipo) {
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        return espacios.filter(e => e.tipo === tipo && !e.ocupado);
    }

    // Obtener espacios por parqueadero
    getEspaciosPorParqueadero(parqueadero) {
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        return espacios.filter(e => e.parqueadero == parqueadero && !e.ocupado);
    }

    // Obtener estadísticas del día
    getEstadisticasDia(fecha = new Date()) {
        const transacciones = JSON.parse(localStorage.getItem('parqueadero_transacciones'));
        const fechaStr = fecha.toISOString().split('T')[0];
        
        const transaccionesDia = transacciones.filter(t => 
            t.fecha.startsWith(fechaStr)
        );

        const ingresos = transaccionesDia.reduce((sum, t) => sum + t.total, 0);
        const vehiculosAtendidos = transaccionesDia.length;
        const promedio = vehiculosAtendidos > 0 ? ingresos / vehiculosAtendidos : 0;

        return {
            ingresos,
            vehiculosAtendidos,
            promedio,
            transacciones: transaccionesDia
        };
    }

    // Obtener reporte por rango de fechas
    getReporteRango(fechaInicio, fechaFin) {
        const transacciones = JSON.parse(localStorage.getItem('parqueadero_transacciones'));
        
        const transaccionesRango = transacciones.filter(t => {
            const fechaTransaccion = new Date(t.fecha);
            return fechaTransaccion >= fechaInicio && fechaTransaccion <= fechaFin;
        });

        const ingresos = transaccionesRango.reduce((sum, t) => sum + t.total, 0);
        const vehiculosAtendidos = transaccionesRango.length;
        const promedio = vehiculosAtendidos > 0 ? ingresos / vehiculosAtendidos : 0;

        // Estadísticas por tipo de vehículo
        const statsPorTipo = {};
        transaccionesRango.forEach(t => {
            if (!statsPorTipo[t.tipo]) {
                statsPorTipo[t.tipo] = { cantidad: 0, ingresos: 0 };
            }
            statsPorTipo[t.tipo].cantidad++;
            statsPorTipo[t.tipo].ingresos += t.total;
        });

        // Estadísticas por tipo de usuario (residente/visitante)
        const statsPorUsuario = {
            residente: { cantidad: 0, ingresos: 0 },
            visitante: { cantidad: 0, ingresos: 0 }
        };
        
        transaccionesRango.forEach(t => {
            if (t.esResidente) {
                statsPorUsuario.residente.cantidad++;
                statsPorUsuario.residente.ingresos += t.total;
            } else {
                statsPorUsuario.visitante.cantidad++;
                statsPorUsuario.visitante.ingresos += t.total;
            }
        });

        // Estadísticas por método de pago
        const statsPorPago = {};
        transaccionesRango.forEach(t => {
            if (!statsPorPago[t.metodoPago]) {
                statsPorPago[t.metodoPago] = { cantidad: 0, ingresos: 0 };
            }
            statsPorPago[t.metodoPago].cantidad++;
            statsPorPago[t.metodoPago].ingresos += t.total;
        });

        return {
            ingresos,
            vehiculosAtendidos,
            promedio,
            statsPorTipo,
            statsPorUsuario,
            statsPorPago,
            transacciones: transaccionesRango,
            fechaInicio,
            fechaFin
        };
    }

    // Obtener reporte del día actual
    getReporteHoy() {
        const hoy = new Date();
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
        return this.getReporteRango(inicio, fin);
    }

    // Obtener reporte del mes actual
    getReporteMesActual() {
        const hoy = new Date();
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
        return this.getReporteRango(inicio, fin);
    }

    // Obtener reporte de ocupación actual
    getReporteOcupacion() {
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        const vehiculos = this.getVehiculosActivos();
        
        // Estadísticas por parqueadero
        const statsPorParqueadero = {};
        for (let i = 1; i <= 4; i++) {
            const espaciosParqueadero = espacios.filter(e => e.parqueadero === i);
            const ocupados = espaciosParqueadero.filter(e => e.ocupado).length;
            const total = espaciosParqueadero.length;
            
            statsPorParqueadero[i] = {
                total,
                ocupados,
                disponibles: total - ocupados,
                porcentaje: total > 0 ? Math.round((ocupados / total) * 100) : 0
            };
        }

        // Estadísticas por tipo de vehículo activo
        const statsPorTipoActivo = {};
        vehiculos.forEach(v => {
            if (!statsPorTipoActivo[v.tipo]) {
                statsPorTipoActivo[v.tipo] = { cantidad: 0, residentes: 0, visitantes: 0 };
            }
            statsPorTipoActivo[v.tipo].cantidad++;
            if (v.esResidente) {
                statsPorTipoActivo[v.tipo].residentes++;
            } else {
                statsPorTipoActivo[v.tipo].visitantes++;
            }
        });

        return {
            totalEspacios: espacios.length,
            espaciosOcupados: espacios.filter(e => e.ocupado).length,
            espaciosDisponibles: espacios.filter(e => !e.ocupado).length,
            porcentajeOcupacion: espacios.length > 0 ? Math.round((espacios.filter(e => e.ocupado).length / espacios.length) * 100) : 0,
            statsPorParqueadero,
            statsPorTipoActivo,
            vehiculosActivos: vehiculos
        };
    }

    // Exportar datos
    exportarDatos() {
        const datos = {
            config: this.getConfig(),
            vehiculos: this.getAllVehiculos(),
            transacciones: JSON.parse(localStorage.getItem('parqueadero_transacciones')),
            espacios: JSON.parse(localStorage.getItem('parqueadero_espacios')),
            fechaExportacion: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parqueadero_protecho_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Importar datos
    importarDatos(datos) {
        try {
            if (datos.config) {
                localStorage.setItem('parqueadero_config', JSON.stringify(datos.config));
            }
            if (datos.vehiculos) {
                localStorage.setItem('parqueadero_vehiculos', JSON.stringify(datos.vehiculos));
            }
            if (datos.transacciones) {
                localStorage.setItem('parqueadero_transacciones', JSON.stringify(datos.transacciones));
            }
            if (datos.espacios) {
                localStorage.setItem('parqueadero_espacios', JSON.stringify(datos.espacios));
            }
            return true;
        } catch (error) {
            console.error('Error al importar datos:', error);
            return false;
        }
    }

    // Limpiar todos los datos
    limpiarDatos() {
        localStorage.removeItem('parqueadero_config');
        localStorage.removeItem('parqueadero_vehiculos');
        localStorage.removeItem('parqueadero_transacciones');
        localStorage.removeItem('parqueadero_espacios');
        this.initializeDatabase();
    }

    // Forzar reinicialización de configuración
    reinicializarConfiguracion() {
        console.log('Reinicializando configuración...');
        localStorage.removeItem('parqueadero_config');
        this.initializeDatabase();
        
        const config = this.getConfig();
        console.log('Nueva configuración:', config);
        console.log('Tarifas visitante:', config.tarifas.visitante);
        console.log('Tarifas residente:', config.tarifas.residente);
        
        return config;
    }

    // Obtener ocupación actual
    getOcupacion() {
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        const total = espacios.length;
        const ocupados = espacios.filter(e => e.ocupado).length;
        const porcentaje = total > 0 ? Math.round((ocupados / total) * 100) : 0;

        return {
            total,
            ocupados,
            disponibles: total - ocupados,
            porcentaje
        };
    }

    // Obtener tarifa según tipo de vehículo
    getTarifa(tipoVehiculo, esResidente) {
        const config = this.getConfig();
        const tipoTarifa = tipoVehiculo === 'camioneta' ? 'automovil' : tipoVehiculo;
        const categoria = esResidente ? 'residente' : 'visitante';
        return config.tarifas[categoria][tipoTarifa];
    }

    // Función de emergencia para limpiar configuración corrupta
    limpiarConfiguracionCorrupta() {
        console.log('🔧 Limpiando configuración corrupta...');
        
        // Eliminar toda la configuración
        localStorage.removeItem('parqueadero_config');
        
        // Crear configuración limpia manualmente
        const configLimpia = {
            tarifas: {
                residente: {
                    automovil: 150800,
                    moto: 80000
                },
                visitante: {
                    automovil: 5000,
                    moto: 3000
                }
            },
            parqueaderos: {
                total: 4,
                puestosPorParqueadero: [80, 115, 50, 40]
            },
            puestosMotos: {
                total: 20
            },
            horario: {
                apertura: '00:00',
                cierre: '23:59'
            }
        };
        
        // Guardar configuración limpia
        localStorage.setItem('parqueadero_config', JSON.stringify(configLimpia));
        
        console.log('✅ Configuración limpia guardada:', configLimpia);
        console.log('🔍 Verificando tarifas visitante:', configLimpia.tarifas.visitante);
        console.log('🔍 Verificando tarifas residente:', configLimpia.tarifas.residente);
        
        return configLimpia;
    }

    // Importar usuarios desde Excel
    importarUsuarios(usuarios) {
        console.log('📥 Importando usuarios:', usuarios.length);
        
        const vehiculos = this.getAllVehiculos();
        const espacios = JSON.parse(localStorage.getItem('parqueadero_espacios'));
        let importados = 0;
        let errores = 0;
        
        usuarios.forEach((usuario, index) => {
            try {
                // Verificar si el vehículo ya existe
                const vehiculoExistente = this.buscarVehiculo(usuario.placa);
                if (vehiculoExistente) {
                    console.warn(`Usuario ${index + 1}: Vehículo ${usuario.placa} ya existe`);
                    errores++;
                    return;
                }
                
                // Verificar espacio para residentes
                if (usuario.esResidente) {
                    const espacioId = `P${usuario.numeroParqueadero}-${usuario.numeroPuesto.toString().padStart(3, '0')}`;
                    const espacio = espacios.find(e => e.id === espacioId);
                    
                    if (!espacio) {
                        console.warn(`Usuario ${index + 1}: Espacio ${espacioId} no existe`);
                        errores++;
                        return;
                    }
                    
                    if (espacio.ocupado) {
                        console.warn(`Usuario ${index + 1}: Espacio ${espacioId} ya está ocupado`);
                        errores++;
                        return;
                    }
                }
                
                // Crear registro de vehículo (sin entrada activa)
                const vehiculo = {
                    id: Date.now().toString() + index,
                    placa: usuario.placa,
                    tipo: usuario.tipo,
                    propietario: usuario.propietario,
                    direccion: usuario.direccion,
                    telefono: usuario.telefono,
                    numeroParqueadero: usuario.numeroParqueadero,
                    numeroPuesto: usuario.numeroPuesto,
                    espacio: usuario.esResidente ? `P${usuario.numeroParqueadero}-${usuario.numeroPuesto.toString().padStart(3, '0')}` : null,
                    esResidente: usuario.esResidente,
                    entrada: null,
                    observaciones: 'Importado desde Excel',
                    activo: false,
                    salida: null,
                    tiempo: null,
                    total: null,
                    metodoPago: null,
                    descuento: null
                };
                
                // Agregar a la lista de vehículos
                vehiculos.push(vehiculo);
                importados++;
                
                console.log(`✅ Usuario ${index + 1}: ${usuario.placa} importado correctamente`);
                
            } catch (error) {
                console.error(`❌ Error importando usuario ${index + 1}:`, error);
                errores++;
            }
        });
        
        // Guardar datos
        localStorage.setItem('parqueadero_vehiculos', JSON.stringify(vehiculos));
        
        console.log(`📊 Resumen: ${importados} importados, ${errores} errores`);
        return { importados, errores };
    }
}

// Instancia global de la base de datos
const db = new ParqueaderoDatabase(); 