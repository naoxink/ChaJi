import json
import os
from datetime import date

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STASH_PATH = os.path.join(BASE_DIR, '..', 'data', 'stash.json')
CATAS_PATH = os.path.join(BASE_DIR, '..', 'data', 'catas.json')
SHOPS_PATH = os.path.join(BASE_DIR, '..', 'data', 'shops.json')

TIPOS_TE = [ "Oolong", "Sheng Pu-erh", "Shou Pu-erh", "Té Verde", "Té Blanco", "Té Negro", "Té Amarillo", "Rooibos", "Yerba Mate" ]
RECIPIENTES = ["Gaiwan de Porcelana", "Tetera de Arcilla (Yixing/Jianshui)", "Gaiwan de Cristal", "Tetera de Porcelana", "Tetera Kyusu",
               "Mate de madera", "Mate de cristal", "Mate de acero", "Mate de calabaza"]

def seleccionar_recipiente():
    print("\n--- Selecciona el recipiente de infusión ---")
    for i, r in enumerate(RECIPIENTES):
        print(f"{i+1}. {r}")
    print(f"{len(RECIPIENTES)+1}. Otro")
    sel = input("\nOpción: ")
    if sel.isdigit() and 0 <= int(sel)-1 < len(RECIPIENTES):
        return RECIPIENTES[int(sel)-1]
    return input("Escribe el recipiente: ") or "Gaiwan"

def limpiar_pantalla():
    # Detecta el sistema operativo y limpia la terminal
    os.system('cls' if os.name == 'nt' else 'clear')

def load_json(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            try: return json.load(f)
            except: return []
    return []

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def seleccionar_item(lista, nombre_item):
    if not lista: return None
    print(f"\n--- Selecciona {nombre_item} ---")
    for i, item in enumerate(lista):
        print(f"{i+1}. {item['nombre']}")
    print(f"{len(lista)+1}. [Añadir nueva {nombre_item}]")
    sel = input(f"\nElige una opción: ")
    if sel.isdigit() and 0 <= int(sel)-1 < len(lista):
        return lista[int(sel)-1]
    return None

def seleccionar_tienda():
    tiendas = load_json(SHOPS_PATH)
    tienda = seleccionar_item(tiendas, "tienda")
    if not tienda:
        print("\n--- 🏪 Registrando nueva tienda ---")
        nombre = input("Nombre de la tienda: ")
        nuevo_id = str(len(tiendas) + 1)
        tienda = {"id": nuevo_id, "nombre": nombre}
        tiendas.append(tienda)
        save_json(SHOPS_PATH, tiendas)
    return tienda

def seleccionar_tipo():
    print("\n--- Selecciona el tipo de té ---")
    for i, tipo in enumerate(TIPOS_TE):
        print(f"{i+1}. {tipo}")
    print(f"{len(TIPOS_TE)+1}. Otro")
    sel = input("\nOpción: ")
    if sel.isdigit() and 0 <= int(sel)-1 < len(TIPOS_TE):
        return TIPOS_TE[int(sel)-1]
    return input("Escribe el tipo: ")

def crear_nuevo_te(stash):
    limpiar_pantalla()
    print("\n--- 🆕 Añadiendo té al Stash ---")
    # Generar ID incremental
    ids = [int(t['id']) for t in stash if str(t['id']).isdigit()]
    nuevo_id = str(max(ids + [0]) + 1)

    nombre = input("Nombre del té: ")
    tipo = seleccionar_tipo()
    tienda = seleccionar_tienda()
    añada = input("Añada/Año (opcional): ") or "N/A"
    origen = input("Origen/Región (opcional): ") or "Desconocido"

    print("Tags del té (separados por comas, ej: floral, tostado): ")
    tags = [t.strip().lower() for t in input("> ").split(",") if t.strip()]

    te = {
        "id": nuevo_id,
        "nombre": nombre,
        "tipo": tipo,
        "tienda": tienda['nombre'],
        "origen": origen,
        "añada": añada,
        "en_stock": True,
        "tags": tags
    }
    stash.append(te)
    save_json(STASH_PATH, stash)
    print(f"✅ Té '{nombre}' guardado en el Stash.")
    return te

def buscar_te(stash):
    if not stash:
        print("La despensa está vacía.")
        return None
    query = input("\n🔍 Buscar té por nombre: ").lower()
    coincidencias = [t for t in stash if query in t['nombre'].lower()]

    if not coincidencias:
        print("No se encontraron resultados.")
        return None

    print("\nResultados encontrados:")
    for i, t in enumerate(coincidencias):
        status = "✅" if t.get('en_stock') else "❌"
        print(f"{i+1}. {status} {t['nombre']} ({t['tipo']})")

    sel = input("\nSelecciona el número: ")
    if sel.isdigit() and 0 <= int(sel)-1 < len(coincidencias):
        return coincidencias[int(sel)-1]
    return None

def gestionar_inventario():
    while True:
        limpiar_pantalla()
        stash = load_json(STASH_PATH)
        print("\n--- 📦 GESTIÓN DE INVENTARIO ---")
        print("1. Añadir nuevo té al Stash")
        print("2. Cambiar disponibilidad (En Stock / Agotado)")
        print("3. Volver al menú principal")

        sub_opc = input("\nElige: ")

        if sub_opc == "1":
            crear_nuevo_te(stash)
        elif sub_opc == "2":
            te = buscar_te(stash)
            if te:
                te['en_stock'] = not te.get('en_stock', True)
                save_json(STASH_PATH, stash)
                estado = "EN STOCK" if te['en_stock'] else "AGOTADO"
                print(f"✅ {te['nombre']} marcado como {estado}.")
        elif sub_opc == "3":
            break

def menu_principal():
    limpiar_pantalla()
    print("\n--- 🍵 GESTOR DE GONGFU CHA ---")
    print("1. Registrar nueva cata")
    print("2. Gestionar Stash / Inventario")
    print("3. Salir")

    opc = input("\nElige una opción: ")

    if opc == "1":
        limpiar_pantalla()
        stash = load_json(STASH_PATH)
        catas = load_json(CATAS_PATH)
        te = None

        if stash and input("¿Es un té que ya tienes en el Stash? (s/n): ").lower() == 's':
            te = buscar_te(stash)

        if not te:
            te = crear_nuevo_te(stash)

        limpiar_pantalla()
        print(f"\n📝 Registrando cata para: {te['nombre']}")

        recipiente = seleccionar_recipiente() # <--- Nueva pregunta

        nueva = {
            "fecha": str(date.today()),
            "te_id": te['id'],
            "nombre": te['nombre'],
            "tienda": te.get('tienda', 'N/A'),
            "recipiente": recipiente,
            "puntuacion": float(input("Nota (0-5): ") or 0),
            "parametros": input("Parámetros (ej: 7g/110ml/95C): ") or "Gongfu",
            "comentario": input("Comentario: ") or "Sin notas.",
            "tags": list(set(te.get('tags', []) + [t.strip().lower() for t in input("Tags de la sesión: ").split(",") if t.strip()]))
        }
        catas.append(nueva)
        save_json(CATAS_PATH, catas)
        print("\n✅ ¡Cata guardada con éxito!")

    elif opc == "2":
        gestionar_inventario()

    elif opc == "3":
        limpiar_pantalla()
        print("¡Buen té! Hasta luego.")
        exit()

if __name__ == "__main__":
    while True:
        menu_principal()