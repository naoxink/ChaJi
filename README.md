# 🍵 Cha Ji (茶记) - Diario Digital de Té

**Cha Ji** es un sistema minimalista y personal para registrar sesiones de **Gongfu Cha**. Este proyecto permite gestionar una enciclopedia personal de tés (Stash), rastrear inventarios de tiendas favoritas y documentar la evolución de cada cata en una interfaz web elegante y zen.

---

## ✨ Características

- **Gestión de Stash:** Registra tés una sola vez y úsalos en múltiples catas.
- **Control de Inventario:** Marca tés como "En Stock" o "Agotado".
- **Parámetros Técnicos:** Registra el recipiente (Gaiwan/Tetera), gramos, temperatura y tiempos.
- **Base de Datos de Tiendas:** Mantén un registro de tus proveedores habituales.
- **Interfaz Web Zen:** Visualiza tu diario y tu despensa mediante una web estática (perfecta para GitHub Pages).

---

## 📂 Estructura del Proyecto

El proyecto está organizado para mantener los datos, la lógica y la interfaz separados:

```text
.
├── index.html          # Interfaz web (Frontend)
├── LICENSE             # Licencia CC BY-NC-SA 4.0
├── README.md           # Esta guía
├── data/               # "Base de datos" en formato JSON
│   ├── catas.json      # Historial de sesiones
│   ├── stash.json      # Enciclopedia de tés
│   └── shops.json      # Directorio de tiendas
└── scripts/
    └── cata.py         # Script de gestión (CLI)


## 🚀 Cómo usarlo

### 1. Registro de sesiones (Terminal)
Para gestionar tus tés y sesiones, abre tu terminal en la carpeta raíz del proyecto y ejecuta:

```bash
python scripts/cata.py
```

## 🛠️ Tecnologías
**Backend**: Python 3 (Gestión de datos persistentes en JSON).

**Frontend**: HTML5, JavaScript (Vanilla) y Tailwind CSS.

**Estilos**: Diseño minimalista inspirado en la estética oriental.

## ⚖️ Licencia
Este proyecto está bajo la licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0).

Esto significa que:

Eres libre de: Compartir y adaptar el código para tu uso personal.

Bajo estas condiciones: Debes dar crédito al autor original, no puedes usarlo con fines comerciales y cualquier obra derivada debe mantener esta misma licencia.

Para más información, consulta el archivo LICENSE en la raíz.