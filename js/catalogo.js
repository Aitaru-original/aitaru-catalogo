const WHATSAPP_NUMERO = '51923537783';

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/productos.json')
        .then(res => res.json())
        .then(productos => {
            renderProductos(productos);
            initModal();
            initScrollTop();
            initScrollAnimations();
        })
        .catch(err => console.error('Error cargando productos:', err));
});

function renderProductos(productos) {
    const catalogo = document.querySelector('.catalogo');
    catalogo.innerHTML = '';

    productos.forEach((producto, index) => {
        const descuento = Math.round((1 - producto.precioExclusivo / producto.precioRetail) * 100);
        const mensaje = encodeURIComponent(`Hola, me interesa la ${producto.nombre} a S/ ${producto.precioExclusivo}. ¿Está disponible?`);
        const tallasHTML = producto.tallas.map(t => {
            if (typeof t === 'object') {
                return t.disponible
                    ? `<span>${t.numero}</span>`
                    : `<span class="talla-agotada">${t.numero}</span>`;
            }
            return `<span>${t}</span>`;
        }).join('');
        const imagenes = producto.imagenes || [producto.imagen];
        const tieneMultiples = imagenes.length > 1;
        const esAgotado = producto.etiqueta === 'agotado';
        const esNuevo = producto.etiqueta === 'nuevo';

        // Etiqueta badge
        let etiquetaHTML = '';
        if (esNuevo) etiquetaHTML = '<span class="badge-etiqueta badge-nuevo">NUEVO</span>';
        if (esAgotado) etiquetaHTML = '<span class="badge-etiqueta badge-agotado">AGOTADO</span>';

        // Slider
        let sliderHTML = '';
        if (tieneMultiples) {
            const dotsHTML = imagenes.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('');
            sliderHTML = `
                <div class="slider" data-id="${index}">
                    <img src="" data-src="${imagenes[0]}" alt="${producto.nombre}" class="producto-img slider-img lazy" data-product="${index}">
                    <span class="zoom-icon" data-product="${index}">&#128269;</span>
                    <button class="slider-btn prev" data-id="${index}">&#10094;</button>
                    <button class="slider-btn next" data-id="${index}">&#10095;</button>
                    <div class="slider-dots">${dotsHTML}</div>
                </div>
            `;
        } else {
            sliderHTML = `
                <div class="slider-single">
                    <img src="" data-src="${imagenes[0]}" alt="${producto.nombre}" class="producto-img lazy" data-product="${index}">
                    <span class="zoom-icon" data-product="${index}">&#128269;</span>
                </div>
            `;
        }

        // Botón WhatsApp
        const btnHTML = esAgotado
            ? `<p class="texto-agotado">Producto agotado</p>`
            : `<a href="https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}" target="_blank" class="btn-whatsapp">📲 Consultar por WhatsApp</a>`;

        const card = document.createElement('article');
        card.className = `producto fade-in${esAgotado ? ' agotado' : ''}`;
        card.innerHTML = `
            <span class="badge-descuento">-${descuento}%</span>
            ${etiquetaHTML}
            ${sliderHTML}
            <div class="producto-info">
                <h2 class="producto-nombre">${producto.nombre}</h2>
                <div class="producto-tallas">${tallasHTML}</div>
                <p class="precio-retail">S/ ${producto.precioRetail.toFixed(2)}</p>
                <p class="precio-exclusivo"><small>Precio Exclusivo</small>S/ ${producto.precioExclusivo.toFixed(2)}</p>
                ${btnHTML}
            </div>
        `;
        catalogo.appendChild(card);
    });

    initSliders(productos);
    initLazyLoad();
}

// Lazy Loading
function initLazyLoad() {
    const lazyImages = document.querySelectorAll('.lazy');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px' });

    lazyImages.forEach(img => observer.observe(img));
}

// Scroll animations (fade-in)
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// Scroll to top button
function initScrollTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '&#9650;';
    btn.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Sliders
function initSliders(productos) {
    const sliders = document.querySelectorAll('.slider');

    sliders.forEach(slider => {
        const id = parseInt(slider.dataset.id);
        const imagenes = productos[id].imagenes;
        const img = slider.querySelector('.slider-img');
        const dots = slider.querySelectorAll('.dot');
        let current = 0;
        let interval;

        function goTo(index) {
            current = (index + imagenes.length) % imagenes.length;
            img.src = imagenes[current];
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        function startAuto() {
            interval = setInterval(() => goTo(current + 1), 3000);
        }

        function stopAuto() {
            clearInterval(interval);
        }

        slider.querySelector('.prev').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            stopAuto();
            goTo(current - 1);
            startAuto();
        });

        slider.querySelector('.next').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            stopAuto();
            goTo(current + 1);
            startAuto();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                stopAuto();
                goTo(parseInt(dot.dataset.index));
                startAuto();
            });
        });

        startAuto();
    });
}

// Modal
function initModal() {
    const modalHTML = `
        <div class="modal-overlay" id="imageModal">
            <button class="modal-close">&times;</button>
            <button class="modal-nav modal-prev">&#10094;</button>
            <button class="modal-nav modal-next">&#10095;</button>
            <div class="modal-img-container">
                <img src="" alt="" class="modal-img" id="modalImg">
            </div>
            <div class="modal-dots" id="modalDots"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalDots = document.getElementById('modalDots');
    let currentImages = [];
    let currentIndex = 0;
    let scale = 1;
    let startX = 0;
    let isSwiping = false;

    document.addEventListener('click', (e) => {
        const imgEl = e.target.closest('.producto-img');
        if (imgEl && !e.target.closest('.slider-btn')) {
            // No abrir modal si el producto está agotado
            const card = imgEl.closest('.producto');
            if (card && card.classList.contains('agotado')) return;
            e.preventDefault();
            const productIndex = parseInt(imgEl.dataset.product);
            openModal(productIndex);
        }
    });

    function openModal(productIndex) {
        fetch('data/productos.json')
            .then(res => res.json())
            .then(productos => {
                const producto = productos[productIndex];
                currentImages = producto.imagenes || [producto.imagen];
                currentIndex = 0;
                showImage();
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
    }

    function showImage() {
        modalImg.src = currentImages[currentIndex];
        scale = 1;
        modalImg.style.transform = `scale(${scale})`;
        renderModalDots();
    }

    function renderModalDots() {
        if (currentImages.length <= 1) { modalDots.innerHTML = ''; return; }
        modalDots.innerHTML = currentImages.map((_, i) =>
            `<span class="modal-dot${i === currentIndex ? ' active' : ''}" data-i="${i}"></span>`
        ).join('');
    }

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        scale = 1;
    }

    modal.querySelector('.modal-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        showImage();
    });

    modal.querySelector('.modal-next').addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentImages.length;
        showImage();
    });

    modalDots.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-dot')) {
            currentIndex = parseInt(e.target.dataset.i);
            showImage();
        }
    });

    modal.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale += e.deltaY > 0 ? -0.2 : 0.2;
        scale = Math.max(1, Math.min(4, scale));
        modalImg.style.transform = `scale(${scale})`;
    });

    let lastTap = 0;
    modalImg.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            scale = scale > 1 ? 1 : 2.5;
            modalImg.style.transform = `scale(${scale})`;
        }
        lastTap = now;
    });

    modal.addEventListener('touchstart', (e) => {
        if (scale > 1) return;
        startX = e.touches[0].clientX;
        isSwiping = true;
    });

    modal.addEventListener('touchend', (e) => {
        if (!isSwiping || scale > 1) return;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) currentIndex = (currentIndex + 1) % currentImages.length;
            else currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            showImage();
        }
        isSwiping = false;
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length; showImage(); }
        if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % currentImages.length; showImage(); }
    });
}
