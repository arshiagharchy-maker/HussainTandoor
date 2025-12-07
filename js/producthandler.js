(function () {
const tryPaths = [
    "/js/product.json",
    "./js/product.json"
];

function fetchSequential(paths) {
    return new Promise((resolve, reject) => {
    let i = 0;
    function next() {
        if (i >= paths.length) return reject(new Error("No product JSON found"));
        fetch(paths[i])
        .then(res => {
            if (!res.ok) { i++; next(); return; }
            return res.json().then(data => resolve(data));
        })
        .catch(() => { i++; next(); });
    }
    next();
    });
}

function getQueryId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('sku') || null;
}

function normalizeProducts(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.PRODUCTS)) return raw.PRODUCTS;
    if (Array.isArray(raw.products)) return raw.products;
    return [];
}

function toImageArray(product) {
    const arr = [];
    if (!product) return arr;
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (Array.isArray(product.gallery) && product.gallery.length) return product.gallery;
    if (product.image) arr.push(product.image);
    if (product.imagePath) arr.push(product.imagePath);
    if (product.image_url) arr.push(product.image_url);
    return arr.map(String).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);
}

function render(product) {
    const title = document.getElementById('product-title');
    const sku = document.getElementById('product-sku');
    const subtitle = document.getElementById('product-subtitle');
    const featuresList = document.getElementById('features-list');
    const mainImage = document.getElementById('main-image');
    const thumbs = document.getElementById('thumbs');
    const moreToggle = document.getElementById('more-toggle');
    const descriptionBlock = document.getElementById('product-description');
    const inquiryBtn = document.getElementById('inquiry-btn');
    const eyebrow = document.getElementById('product-eyebrow');
    const categoryEl = document.getElementById('product-category');

    title.textContent = product.name || product.title || 'Product';
    sku.textContent = product.sku ? product.sku : (product.id !== undefined ? String(product.id) : '');
    subtitle.textContent = product.subtitle || '';

    eyebrow.textContent = ''; // no pre-order / price label by requirement

    // Features: support array or string (comma/newline separated). If none, show first 3 lines of description
    featuresList.innerHTML = '';
    let features = [];
    if (Array.isArray(product.features) && product.features.length) features = product.features;
    else if (typeof product.features === 'string' && product.features.trim()) {
    features = product.features.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
    } else if (typeof product.description === 'string') {
    features = product.description.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0,3);
    }

    features.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f;
    featuresList.appendChild(li);
    });

    // Description (full) hidden by default, toggled with More button
    const fullDesc = (typeof product.description === 'string') ? product.description : '';
    if (fullDesc.trim()) {
    descriptionBlock.textContent = fullDesc;
    descriptionBlock.hidden = true;
    moreToggle.style.display = 'inline-block';
    let expanded = false;
    moreToggle.addEventListener('click', () => {
        expanded = !expanded;
        moreToggle.setAttribute('aria-expanded', String(expanded));
        if (expanded) {
        descriptionBlock.hidden = false;
        moreToggle.textContent = 'Less ▴';
        } else {
        descriptionBlock.hidden = true;
        moreToggle.textContent = 'More ▾';
        }
    });
    } else {
    moreToggle.style.display = 'none';
    descriptionBlock.hidden = true;
    }

    // Gallery
    thumbs.innerHTML = '';
    const gallery = toImageArray(product);
    mainImage.src = gallery[0] || '';
    mainImage.alt = product.name || 'Product image';

    gallery.forEach((src, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb' + (i === 0 ? ' selected' : '');
    const img = document.createElement('img');
    img.src = src;
    img.alt = product.name ? `${product.name} - view ${i+1}` : `thumb ${i+1}`;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        mainImage.src = src;
        thumbs.querySelectorAll('.thumb').forEach(n => n.classList.remove('selected'));
        btn.classList.add('selected');
    });
    thumbs.appendChild(btn);
    });

    // Category (optional)
    if (product.category) {
    categoryEl.textContent = `Category: ${product.category}`;
    categoryEl.style.display = 'block';
    } else {
    categoryEl.style.display = 'none';
    }
}

// Run
(async function init() {
    try {
    const raw = await fetchSequential(tryPaths);
    const products = normalizeProducts(raw);
    if (!products || products.length === 0) {
        // fallback minimal sample
        const sample = {
        id: 'demo-01',
        name: 'Demo Product',
        subtitle: 'Short subtitle for demo',
        description: 'Short demo description.\nMore details here.',
        features: ['Feature A', 'Feature B', 'Feature C'],
        image: 'image/product-1.jpg',
        images: ['image/product-1.jpg']
        };
        render(sample);
        return;
    }

    const idOrSku = getQueryId();
    let product = null;
    if (idOrSku) {
        product = products.find(p => String(p.id) === idOrSku || String(p.sku) === idOrSku || String(p.slug) === idOrSku);
    }
    if (!product) product = products[0];
    render(product);
    } catch (err) {
    console.error('Failed to load products:', err);
    // render fallback sample
    const fallback = {
        id: 'demo-01',
        name: 'Demo Product',
        subtitle: 'Short subtitle for demo',
        description: 'Short demo description.\nMore details here.',
        features: ['Feature A', 'Feature B', 'Feature C'],
        image: 'image/product-1.jpg',
        images: ['image/product-1.jpg']
    };
    render(fallback);
    }
})();

})();