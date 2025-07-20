# Sistema de Administración de Parqueadero - Protecho Bogotá II

## Descripción
Sistema web completo para la administración del parqueadero de "Protecho Bogotá II". Permite gestionar entradas, salidas, tarifas, espacios de parqueo y reportes.

## Características Principales

### 🚗 Gestión de Vehículos
- Registro de entrada y salida de vehículos
- Control de espacios disponibles
- Historial de movimientos
- Búsqueda de vehículos por placa

### 💰 Gestión de Tarifas
- Configuración de tarifas por hora
- Tarifas especiales por tipo de vehículo
- Cálculo automático de costos
- Descuentos y promociones

### 📊 Reportes y Estadísticas
- Reporte diario de ingresos
- Estadísticas de ocupación
- Historial de transacciones
- Exportación de datos

### 👥 Gestión de Usuarios
- Control de acceso por roles
- Registro de operadores
- Auditoría de acciones

## Tecnologías Utilizadas
- HTML5
- CSS3 (con diseño responsive)
- JavaScript (ES6+)
- LocalStorage para persistencia de datos

## Estructura del Proyecto
```
parqueadero-protecho-bogota/
├── index.html          # Página principal
├── styles.css          # Estilos principales
├── database.js         # Gestión de datos
├── utils.js            # Utilidades
├── reports.js          # Generación de reportes
├── app.js              # Lógica principal
└── README.md           # Documentación
```

## Instalación y Uso
1. Clonar o descargar el proyecto
2. Abrir `index.html` en un navegador web
3. Configurar las tarifas iniciales
4. Comenzar a registrar entradas y salidas

## Configuración Inicial
- Establecer tarifas por hora
- Configurar espacios disponibles
- Definir horarios de operación
- Configurar usuarios administradores

## Funcionalidades por Módulo

### Módulo de Entrada/Salida
- Escaneo de placas
- Asignación de espacios
- Cálculo de tiempo de estacionamiento
- Generación de tickets

### Módulo de Administración
- Gestión de tarifas
- Control de espacios
- Configuración del sistema
- Respaldo de datos

### Módulo de Reportes
- Reportes en tiempo real
- Exportación a PDF/Excel
- Gráficos de ocupación
- Análisis de ingresos

## Contacto
Sistema desarrollado para Protecho Bogotá II
Versión: 1.0.0 