
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
fetch('./productos.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    mostrarProductos();
  })
  .catch(error => {
    console.log('Error al cargar el archivo JSON:', error);
  });

const mostrarProducto = ({ nombre, precio, descripcion, stock, img, id }) => {
  const tienda = document.querySelector("#tienda");
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

const agregarAlCarro = (id) => {
  const itemsCarro = document.querySelector(`#carrocompras${id}`);
  itemsCarro.addEventListener("submit", (e) => {
    e.preventDefault();
    const cantidad = e.target.children["cantidad"].value;
    carro.push({ id: id, cantidad: cantidad });
    localStorage.setItem("carro", JSON.stringify(carro));
    actualizarCantidadCarrito();
  });
};
const mostrarCarrito = () => {
  const tienda = document.querySelector("#tienda");
  tienda.innerHTML = "<h2>Contenido del carrito:</h2>";

  if (carro.length === 0) {
    tienda.innerHTML += "<p>El carrito está vacío.</p>";
  } else {
    const carritoPorId = {};

    carro.forEach(item => {
      const producto = productos.find(p => p.id === item.id);
      const cantidad = parseInt(item.cantidad);
      const precioTotal = (producto.precio * cantidad).toFixed(2);

      if (carritoPorId[item.id]) {
        carritoPorId[item.id].cantidad += cantidad;
        carritoPorId[item.id].precioTotal += parseFloat(precioTotal);
      } else {
        
        carritoPorId[item.id] = {
          producto,
          cantidad,
          precioTotal: parseFloat(precioTotal),
        };
      }
    });
    Object.values(carritoPorId).forEach(({ producto, cantidad, precioTotal }) => {
      const demostracion = document.createElement("div");
      demostracion.className = "demostracion";
      demostracion.innerHTML = `
        <img class="imagentienda" src="./archivos/${producto.img}" alt="${producto.nombre}" />
        <h2>${producto.nombre}</h2>
        <b><p>Cantidad Total: ${cantidad}</b></p>
        <b><p>Precio Total: $${precioTotal.toFixed(2)}</b></p> 
      `;
      tienda.append(demostracion);
    });
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

  const busqueda = productosFiltrados.length === 0 ? tienda.innerHTML = `<p>No se encontraron productos de ese tipo.</p>` : productosFiltrados.forEach((producto) => {
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
  actualizarCantidadCarrito();
};

const botonVaciarCarrito = document.getElementById("vaciar-carrito");
botonVaciarCarrito.addEventListener("click", vaciarCarrito);

const imagencarrito = document.getElementById("imagencarrito");
imagencarrito.addEventListener("click", mostrarCarrito);

actualizarCantidadCarrito();