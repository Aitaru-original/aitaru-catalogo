const WHATSAPP_NUMERO = '51923537783';

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/productos.json')
        .then(res => res.json())
        .then(productos => renderProductos(productos))
        .catch(err => console.error('Error cargando productos:', err));
});

function renderProductos(productos) {
    const catalogo = document.querySelector('.catalogo');
    catalogo.innerHTML = '';

    productos.forEach(producto => {
        const descuento = Math.round((1 - producto.precioExclusivo / producto.precioRetail) * 100);
        const mensaje = encodeURIComponent(`Hola, me interesa la ${producto.nombre} a S/ ${producto.precioExclusivo}. ¿Está disponible?`);
        const tallasHTML = producto.tallas.map(t => `<span>${t}</span>`).join('');

        const card = document.createElement('article');
        card.className = 'producto';
        card.innerHTML = `
            <span class="badge-descuento">-${descuento}%</span>
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <div class="producto-info">
                <h2 class="producto-nombre">${producto.nombre}</h2>
                <div class="producto-tallas">${tallasHTML}</div>
                <p class="precio-retail">S/ ${producto.precioRetail.toFixed(2)}</p>
                <p class="precio-exclusivo"><small>Precio Exclusivo</small>S/ ${producto.precioExclusivo.toFixed(2)}</p>
                <a href="https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}" target="_blank" class="btn-whatsapp">📲 Consultar por WhatsApp</a>
            </div>
        `;
        catalogo.appendChild(card);
    });
}
