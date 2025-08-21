/* ============================================================
                          Entregable 2
              Simulador: Carrito con Persistencia
        Interacción en Consola + prompt/confirm/alert
============================================================ */

// 1) Datos del simulador

const PRODUCTOS = [
  { id: 1, nombre: "Bacha cerámica", precio: 45000 },
  { id: 2, nombre: "Inodoro corto", precio: 95000 },
  { id: 3, nombre: "Bidet estándar", precio: 70000 },
  { id: 4, nombre: "Grifería monocomando", precio: 82000 },
  { id: 5, nombre: "Kit instalación", precio: 25000 },
];

const CODIGOS_DESCUENTO = {
  HOLA10: 0.1,
  BANO15: 0.15,
  FREESHIP: 0.95,
};

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// 2) Funciones utilitarias

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

const buscarProductoPorId = (id) => PRODUCTOS.find((p) => p.id === id);

const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;

const formatMoney = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    n
  );

// 3) Entrada de datos

function mostrarCatalogo() {
  console.clear();
  console.log("Catálogo disponible:");
  let tabla = [];
  for (let i = 0; i < PRODUCTOS.length; i++) {
    const p = PRODUCTOS[i];
    tabla.push({
      ID: p.id,
      Producto: p.nombre,
      Precio: formatMoney(p.precio),
    });
  }
  console.table(tabla);
}

function solicitarItem() {
  let mensaje =
    "Ingrese el ID del producto que desea agregar (Cancelar para salir):\n";
  for (let i = 0; i < PRODUCTOS.length; i++) {
    mensaje += `${PRODUCTOS[i].id}) ${PRODUCTOS[i].nombre} - ${formatMoney(
      PRODUCTOS[i].precio
    )}\n`;
  }

  const idStr = prompt(mensaje);
  if (idStr === null) return null;

  const id = Number(idStr);
  const producto = buscarProductoPorId(id);

  if (!producto) {
    alert("ID inválido. Intente nuevamente.");
    return solicitarItem();
  }

  const qtyStr = prompt(`Cantidad para "${producto.nombre}":`);
  if (qtyStr === null) return null;

  const cantidad = Number(qtyStr);
  if (!esEnteroPositivo(cantidad)) {
    alert("La cantidad debe ser un número entero positivo.");
    return solicitarItem();
  }

  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad,
  };
}

function cargarCarrito() {
  mostrarCatalogo();

  do {
    const item = solicitarItem();
    if (!item) break;

    let encontrado = false;
    for (let i = 0; i < carrito.length; i++) {
      if (carrito[i].id === item.id) {
        carrito[i].cantidad += item.cantidad;
        encontrado = true;
      }
    }
    if (!encontrado) carrito.push(item);

    guardarCarrito();
  } while (confirm("¿Desea agregar otro producto al carrito?"));

  if (
    carrito.length > 0 &&
    confirm("¿Desea eliminar el último producto agregado?")
  ) {
    let eliminado = carrito.pop();
    guardarCarrito();
    alert(`Se eliminó: ${eliminado.nombre}`);
  }
}

// 4) Procesamiento

function calcularSubtotal(carrito) {
  let total = 0;
  for (let i = 0; i < carrito.length; i++) {
    total += carrito[i].precio * carrito[i].cantidad;
  }
  return total;
}

function aplicarDescuento(total, codigo) {
  const codigoAplicado = codigo ?? "";
  const porcentaje = CODIGOS_DESCUENTO[codigoAplicado.toUpperCase().trim()];

  if (codigoAplicado && porcentaje === undefined) {
    alert("Código de descuento inválido. No se aplicará descuento.");
    return { totalConDescuento: total, porcentaje: 0 };
  }

  return {
    totalConDescuento: total - total * (porcentaje ?? 0),
    porcentaje: porcentaje ?? 0,
  };
}

// 5) Salida de resultados

function mostrarResumen(carrito, codigoAplicado) {
  console.log("Resumen de compra:");
  if (carrito.length === 0) {
    alert("Carrito vacío. No hay productos para mostrar.");
    return;
  }

  let tabla = [];
  for (let i = 0; i < carrito.length; i++) {
    const item = carrito[i];
    tabla.push({
      ID: item.id,
      Producto: item.nombre,
      Cantidad: item.cantidad,
      "Precio Unitario": formatMoney(item.precio),
      "Subtotal Línea": formatMoney(item.precio * item.cantidad),
    });
  }
  console.table(tabla);

  const subtotal = calcularSubtotal(carrito);
  const { totalConDescuento, porcentaje } = aplicarDescuento(
    subtotal,
    codigoAplicado
  );

  if (porcentaje > 0) {
    console.log(
      `Descuento aplicado (${Math.round(porcentaje * 100)}%): -${formatMoney(
        subtotal - totalConDescuento
      )}`
    );
  } else if (codigoAplicado) {
    console.log("No se aplicó descuento.");
  } else {
    console.log("Sin descuento.");
  }

  let totalItems = 0;
  for (let i = 0; i < carrito.length; i++) {
    totalItems += carrito[i].cantidad;
  }

  alert(
    `Compra simulada\n` +
      `Ítems: ${totalItems}\n` +
      `Subtotal: ${formatMoney(subtotal)}\n` +
      (porcentaje > 0 ? `Descuento: ${Math.round(porcentaje * 100)}%\n` : "") +
      `TOTAL: ${formatMoney(totalConDescuento)}`
  );
}

// 6) Función principal

function simuladorCarrito() {
  alert(
    "Bienvenido al Simulador de Carrito.\nAbra la consola para ver detalles."
  );

  if (carrito.length > 0) {
    if (confirm("Tiene un carrito guardado. ¿Desea continuar con él?")) {
      console.log("Carrito recuperado desde localStorage.");
    } else {
      carrito = [];
      guardarCarrito();
      console.log("Se vació el carrito.");
    }
  }

  cargarCarrito();

  const deseaCodigo =
    carrito.length > 0 && confirm("¿Tiene un código de descuento?");
  const codigo = deseaCodigo
    ? prompt("Ingrese su código (ej: HOLA10, BANO15, FREESHIP):") ?? ""
    : "";

  mostrarResumen(carrito, codigo);

  if (confirm("¿Desea simular otra compra?")) {
    simuladorCarrito();
  } else {
    console.log("Fin de la simulación. Su carrito queda guardado.");
  }
}

// 7) Arranque
simuladorCarrito();
