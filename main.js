const producto = {
  constructor(nombre, precio, stock, descripcion, tipo, img, id) {
    this.nombre = nombre;
    this.precio = parseFloat(precio) + parseFloat(precio * 0.21);
    this.stock = stock;
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.img = img;
    this.id = id;
  }
};

let productos;
let carro = JSON.parse(localStorage.getItem("carro")) || [];
let costoTotal = 0;

const obtenerProductos = async () => {
  try {
    const response = await fetch('./productos.json');
    const data = await response.json();
    productos = data;
    mostrarProductos();
  } catch (error) {
    console.log('Error al cargar el archivo JSON:', error);
  }
};

const mostrarProducto = ({ nombre, precio, descripcion, stock, img, id }) => {
  const tienda = document.getElementById("tienda");
  const demostracion = document.createElement("div");
  demostracion.className = "demostracion";
  demostracion.innerHTML = `
    <img class="imagentienda" src="./archivos/${img}" alt="${nombre}" />
    <h2>${nombre}</h2>
    <b><p>Descripcion:</b> ${descripcion}</p>
    <b><p>Precio:</b> $${precio.toFixed(2)}</p> 
    <form id="carrocompras${id}">
      <label for="cantidad"><b>Selecciona la cantidad:</b></label>
      <input name="cantidad" type="number" id="cantidad${id}" value="1" min="1" max="${stock}">
      <input type="hidden" value="${id}">    
      <button type="submit" class="agregar-carrito">Agregar item</button>
    </form>
  `;
  tienda.append(demostracion);
};

const calcularCostoTotal = () => {
  costoTotal = carro.reduce((total, item) => {
    const producto = productos.find(p => p.id === item.id);
    const cantidad = parseInt(item.cantidad);
    const precioTotal = producto.precio * cantidad;
    return total + precioTotal;
  }, 0);
};

const agregarAlCarro = (id) => {
  const itemsCarro = document.getElementById(`carrocompras${id}`);
  itemsCarro.addEventListener("submit", (e) => {
    e.preventDefault();
    const cantidad = e.target.children["cantidad"].value;
    const producto = productos.find(p => p.id === id);
    carro.push({ id: id, cantidad: cantidad });
    localStorage.setItem("carro", JSON.stringify(carro));
    calcularCostoTotal();
    actualizarCantidadCarrito();
    Toastify({
      text: `${producto.nombre} agregado al carrito!`,
      duration: 2000,
      stopOnFocus:true,
      onClick: () => {
        mostrarCarrito();
      },
    }).showToast()
  });
};

const mostrarCarrito = () => {
  const tienda2 = document.getElementById("carroversifunciona");
  const tienda = document.getElementById("tienda");
  tienda2.innerHTML = ` 
    <h2 class='titulocarro'>Contenido del carrito:</h2>
    <p>Total a pagar: $${costoTotal.toFixed(2)}</p>
    <button id="boton-pagar" class="pagar-carrito">Pagar</button>
  `;
  tienda.innerHTML = "";

  const carritoPorId = {};

  carro.forEach((item) => {
    const producto = productos.find((p) => p.id === item.id);
    const cantidad = parseInt(item.cantidad);
    const precioTotal = (producto.precio * cantidad).toFixed(2);

    carritoPorId[item.id] ? 
    ((carritoPorId[item.id].cantidad += cantidad),
    (carritoPorId[item.id].precioTotal += parseFloat(precioTotal)))
      : (carritoPorId[item.id] = {
          producto,
          cantidad,
          precioTotal: parseFloat(precioTotal),
        });
  });

  Object.values(carritoPorId).forEach(({ producto, cantidad, precioTotal }) => {
    const demostracion = document.createElement("div");
    demostracion.className = "demostracion";
    demostracion.innerHTML = `
      <img class="imagentienda" src="./archivos/${producto.img}" alt="${producto.nombre}" />
      <h2>${producto.nombre}</h2>
      <b><p>Cantidad Total: ${cantidad}</b></p>
      <b><p>Precio Total: $${precioTotal.toFixed(2)}</b></p>
      <button class="eliminar-item" data-id="${producto.id}">Eliminar</button>
    `;
    tienda.append(demostracion);
  });

  const botonesEliminar = document.getElementsByClassName("eliminar-item");
  Array.from(botonesEliminar).forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = boton.getAttribute("data-id");
      eliminarItemCarrito(id);
    });
  });
/* 
Aca tengo en mente que para pagar necesito agregar una api para que se realize el pago y demas, pero bueno, obviamente no tengo la key
es solo a modo de muestra visual.
*/ 
  const botonPagar = document.getElementById("boton-pagar");
botonPagar.addEventListener("click", () => {
  vaciarCarrito();
  Toastify({
    text: 'Pago realizado con éxito!',
    duration: 2000,
    stopOnFocus: true,
  }).showToast();
  const redirectUrl = 'https://www.mercadopago.com.ar/';
  const newTab = window.open();
  newTab.location.href = redirectUrl;
});
};

const eliminarItemCarrito = (id) => {
  const indice = carro.findIndex((item) => item.id === id);
  if (indice !== -1) {
    const producto = productos.find((p) => p.id === id);
    carro.splice(indice, 1);
    localStorage.setItem('carro', JSON.stringify(carro));
    calcularCostoTotal();
    actualizarCantidadCarrito();
    mostrarCarrito();
    Toastify({
      text: `${producto.nombre} eliminado del carrito`,
      duration: 2000,
      stopOnFocus: true,
    }).showToast();
  }
};

const mostrarProductos = () => {
  productos.forEach((producto) => {
    if (producto.stock != 0) {
      mostrarProducto(producto);
      agregarAlCarro(producto.id);
    }
  });
};

const buscarProductos = () => {
  const tipoInput = document.getElementById("tipo-input");
  const tipoBuscado = tipoInput.value.toLowerCase();

  const productosFiltrados = productos.filter((producto) =>
    producto.tipo.toLowerCase().includes(tipoBuscado)
  );

  const tienda = document.getElementById("tienda");
  tienda.innerHTML = "";

  const busqueda = productosFiltrados.length === 0 ? tienda.innerHTML = "<p>No se encontraron productos de ese tipo.</p>" : productosFiltrados.forEach((producto) => {
    mostrarProducto(producto);
  });
};

const botonBuscar = document.getElementById("boton-buscar");
botonBuscar.onclick = buscarProductos;

const tipoInput = document.getElementById("tipo-input");
tipoInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    buscarProductos();
  }
});

const actualizarCantidadCarrito = () => {
  const cantidadItems = document.getElementById("cantidad-items");
  cantidadItems.textContent = carro.length.toString();
};

const vaciarCarrito = () => {
  carro = [];
  localStorage.removeItem("carro");
  costoTotal = 0;
  actualizarCantidadCarrito();
};

const botonVaciarCarrito = document.getElementById("vaciar-carrito");
botonVaciarCarrito.addEventListener("click", vaciarCarrito);

const imagencarrito = document.getElementById("imagencarrito");
imagencarrito.addEventListener("click", () => {
  carro.length === 0 ? Swal.fire({
        title: 'Oops...',
        text: 'El carrito está vacío!',
        icon: 'error',
        confirmButtonText: 'OK',
      }) 
      :
       mostrarCarrito();
});

obtenerProductos();
actualizarCantidadCarrito();
