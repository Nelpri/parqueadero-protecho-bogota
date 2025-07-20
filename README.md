# 🚗 Sistema de Parqueadero - Protecho Bogotá II

Sistema web completo para la gestión de parqueaderos de un conjunto residencial, desarrollado con HTML, CSS y JavaScript puro.

## 📋 Características Principales

### 🏠 Gestión de Residentes y Visitantes
- **Residentes:** Puestos fijos asignados con pago mensual
- **Visitantes:** Pago por 12 horas con asignación automática de espacios
- **Diferentes tarifas** según tipo de vehículo y usuario

### 🚙 Tipos de Vehículos Soportados
- **Automóviles:** Tarifa residente $150,800/mes, visitante $5,000/12h
- **Camionetas:** Misma tarifa que automóviles
- **Motos:** Tarifa residente $80,000/mes, visitante $3,000/12h

### 🏢 Estructura del Conjunto
- **4 parqueaderos** con diferentes capacidades:
  - Parqueadero 1: 80 puestos
  - Parqueadero 2: 115 puestos  
  - Parqueadero 3: 50 puestos
  - Parqueadero 4: 40 puestos
- **20 puestos especiales** para motos
- **Total:** 305 espacios disponibles

### ⏰ Funcionamiento 24 Horas
- Sin restricciones de horario
- Operación continua día y noche

## 🚀 Funcionalidades

### 📝 Registro de Entrada
- Captura de datos del vehículo y propietario
- Asignación automática de espacios para visitantes
- Validación de puestos fijos para residentes
- Registro de observaciones

### 💰 Cálculo y Cobro de Salida
- Cálculo automático de tarifas
- Soporte para descuentos
- Múltiples métodos de pago (efectivo, tarjeta, transferencia)
- Generación de resumen de cobro

### 📊 Reportes y Estadísticas
- Reportes por rango de fechas
- Estadísticas por tipo de vehículo
- Análisis por método de pago
- Reporte de ocupación actual
- Reportes rápidos (hoy, mes actual)

### ⚙️ Configuración del Sistema
- Importación/exportación de datos
- Importación de usuarios desde Excel
- Reinicialización del sistema
- Limpieza de configuración corrupta

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Almacenamiento:** LocalStorage del navegador
- **Librerías:** 
  - Font Awesome (iconos)
  - SheetJS (importación de Excel)
- **Responsive Design:** Compatible con móviles y tablets

## 📦 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere servidor web ni instalación adicional

### Instalación
1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tuusuario/parqueadero-protecho-bogota.git
   ```

2. **Abre el archivo principal:**
   ```bash
   cd parqueadero-protecho-bogota
   # Abre index.html en tu navegador
   ```

3. **¡Listo!** El sistema está funcionando

### Uso Inmediato
- Abre `index.html` en cualquier navegador
- Los datos se guardan automáticamente en el navegador
- No requiere configuración inicial

## 📁 Estructura del Proyecto

```
parqueadero-protecho-bogota/
├── index.html          # Página principal del sistema
├── styles.css          # Estilos y diseño responsive
├── app.js              # Lógica principal de la aplicación
├── database.js         # Gestión de datos y LocalStorage
├── utils.js            # Funciones utilitarias
├── README.md           # Este archivo
└── .gitignore          # Archivos ignorados por Git
```

## 🔧 Configuración Inicial

El sistema viene preconfigurado con:
- Tarifas del conjunto residencial
- Estructura de 4 parqueaderos
- Horario de 24 horas
- Configuración de espacios

### Personalización
Puedes modificar las tarifas y configuración desde:
- **Pestaña Configuración** → **Reinicializar Sistema**
- O editar directamente en `database.js`

## 📊 Características Técnicas

### Almacenamiento de Datos
- **LocalStorage:** Persistencia de datos en el navegador
- **Estructura JSON:** Datos organizados y exportables
- **Backup automático:** Exportación de datos disponible

### Seguridad
- Validación de formularios
- Verificación de espacios disponibles
- Prevención de duplicados
- Validación de datos de entrada

### Rendimiento
- Carga rápida sin dependencias externas
- Interfaz responsive
- Actualizaciones en tiempo real
- Búsqueda instantánea

## 🎯 Casos de Uso

### Para Administradores
- Gestión completa de entradas y salidas
- Generación de reportes detallados
- Control de ocupación en tiempo real
- Importación masiva de residentes

### Para Operadores
- Interfaz intuitiva y fácil de usar
- Cálculo automático de tarifas
- Registro rápido de vehículos
- Búsqueda instantánea

## 🔄 Actualizaciones y Mantenimiento

### Exportar Datos
- **Configuración** → **Exportar Datos**
- Genera archivo JSON con toda la información

### Importar Datos
- **Configuración** → **Importar Datos**
- Restaura desde archivo JSON de respaldo

### Importar Usuarios desde Excel
- **Configuración** → **Importar Usuarios Excel**
- Formato: Placa, Tipo, Propietario, Casa, Teléfono, Es Residente, Parqueadero, Puesto

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Datos no se guardan:** Verificar que LocalStorage esté habilitado
2. **Cálculos incorrectos:** Usar "Limpiar Configuración Corrupta"
3. **Interfaz no responde:** Recargar la página
4. **Importación falla:** Verificar formato del archivo Excel

### Herramientas de Diagnóstico
- **Reinicializar Sistema:** Limpia todos los datos
- **Limpiar Configuración Corrupta:** Repara configuración dañada
- **Actualizar a 24 Horas:** Corrige problemas de horario

## 📞 Soporte

Para reportar problemas o solicitar mejoras:
1. Crear un **Issue** en GitHub
2. Incluir descripción detallada del problema
3. Adjuntar capturas de pantalla si es necesario

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Contribuciones

Las contribuciones son bienvenidas:
1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

---

**Desarrollado para Protecho Bogotá II** 🏠  
*Sistema de gestión de parqueaderos residenciales* 