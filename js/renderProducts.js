(async function () {
   if (document.readyState === 'loading') {
    await new Promise((res) => document.addEventListener('DOMContentLoaded', res, { once: true }));
  }

  const tryPaths = [
    "js/product.json",
    "./js/product.json",
    "/js/product.json",
    "../js/product.json",
  ];

  async function loadJson() {
    for (const p of tryPaths) {
      try {
        const res = await fetch(p);
        if (!res.ok) continue;
        const data = await res.json();
        return Array.isArray(data) ? data : (data.PRODUCTS || data.products || []);
      } catch (e) {
      }
    }
    throw new Error("Could not load product.json");
  }

  let products = [];
  try {
    products = await loadJson();
  } catch (err) {
    console.error(err);
    const fallback = document.getElementById('product-list');
    if (fallback) fallback.innerHTML = '<p class="product-error">Could not load products.</p>';
    return;
  }

  const container = document.getElementById("product-list");
  if (!container) return;

  function imageSrc(product) {
    if (!product) return "";
    if (Array.isArray(product.images) && product.images.length) return product.images[0];
    if (Array.isArray(product.gallery) && product.gallery.length) return product.gallery[0];
    if (typeof product.image === "string") return product.image;
    if (typeof product.image === "number") return `/images/product-${product.image}.jpeg`;
    return product.imagePath || product.image_url || "";
  }

  container.innerHTML = '';

  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-ad-card';

    if (prod.sku) {
      const sku = document.createElement('div'); sku.className = 'product-sku'; sku.textContent = prod.sku; card.appendChild(sku);
    }

    const frame = document.createElement('div'); frame.className = 'product-image-frame';
    const src = imageSrc(prod);

    if (src) {
      const img = document.createElement('img'); img.alt = prod.name || '';
      img.loading = 'lazy'; img.className = 'product-image'; img.src = src; frame.appendChild(img);
    } else {
      const ph = document.createElement('div'); ph.className = 'product-noimage'; ph.textContent = '[No image]'; frame.appendChild(ph);
    }

    card.appendChild(frame);
    
    const h3 = document.createElement('h3'); h3.className = 'product-title'; h3.textContent = prod.name || '[Product]'; card.appendChild(h3);
    const p = document.createElement("p");
    p.className = "product-desc";
    p.textContent = prod.description || "";
    card.appendChild(p);

    const actions = document.createElement('div'); actions.className = 'product-actions';
    const learn = document.createElement('a'); learn.className = 'btn btn-outline'; learn.href = `/html/product.html?id=${encodeURIComponent(prod.id)}`; learn.textContent = 'Learn More'; actions.appendChild(learn);
    card.appendChild(actions);

    container.appendChild(card);
  });

  function setupScrollControls(container) {
    const prev = document.getElementById('product-scroll-prev');
    const next = document.getElementById('product-scroll-next');
    if (!prev || !next) return;

    const getCardWidth = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--card-width') || '';
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 150;
    };

    const getScrollAmount = () => {
      const cardW = getCardWidth();
      return Math.max(Math.round(cardW * 2), Math.round(container.clientWidth * 0.6));
    };

    const updateButtons = () => {
      const isScrollable = container.scrollWidth > container.clientWidth + 1;
      prev.style.display = isScrollable ? '' : 'none';
      next.style.display = isScrollable ? '' : 'none';
      prev.disabled = container.scrollLeft <= 0;
      next.disabled = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth;
    };

    prev.addEventListener('click', () => {
      container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    container.addEventListener('scroll', () => {
      updateButtons();
    }, { passive: true });

    window.addEventListener('resize', updateButtons);
    setTimeout(updateButtons, 50);
  }

  setupScrollControls(container);
})();