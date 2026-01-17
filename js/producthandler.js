(function () {
const tryPaths = [
    "/js/product.json",
    "./js/product.json",
    "js/product.json",
    "../js/product.json"
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

function toMediaArray(product) {
    const media = [];
    if (!product) return media;
    
    if (Array.isArray(product.images) && product.images.length) {
        product.images.forEach(img => media.push({ type: 'image', src: img }));
    }
    if (Array.isArray(product.gallery) && product.gallery.length) {
        product.gallery.forEach(img => media.push({ type: 'image', src: img }));
    }
    if (product.image) media.push({ type: 'image', src: product.image });
    if (product.imagePath) media.push({ type: 'image', src: product.imagePath });
    if (product.image_url) media.push({ type: 'image', src: product.image_url });

    if (Array.isArray(product.videos) && product.videos.length) {
        product.videos.forEach(vid => media.push({ type: 'video', src: vid }));
    }
    if (product.video) media.push({ type: 'video', src: product.video });
    if (product.video_url) media.push({ type: 'video', src: product.video_url });
    
    return media.filter((item, index, arr) => 
        arr.findIndex(i => i.src === item.src) === index
    );
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

    title.textContent = product.name || product.title || 'Product';
    sku.textContent = product.sku ? product.sku : (product.id !== undefined ? String(product.id) : '');
    subtitle.textContent = product.subtitle || '';

    eyebrow.textContent = ''; 
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

    thumbs.innerHTML = '';
    const gallery = toMediaArray(product);
    
    if (gallery.length > 0) {
        const firstItem = gallery[0];
        if (firstItem.type === 'video') {
            mainImage.style.display = 'none';
            let mainVideo = document.getElementById('main-video');
            if (!mainVideo) {
                mainVideo = document.createElement('video');
                mainVideo.id = 'main-video';
                mainVideo.className = 'main-media';
                mainVideo.controls = true;
                mainVideo.preload = 'metadata';
                mainVideo.style.maxWidth = '100%';
                mainVideo.style.maxHeight = '100%';
                mainImage.parentNode.appendChild(mainVideo);
            }
            mainVideo.src = firstItem.src;
            mainVideo.style.display = 'block';
        } else {
            mainImage.src = firstItem.src;
            mainImage.alt = product.name || 'Product image';
            mainImage.style.display = 'block';
            const mainVideo = document.getElementById('main-video');
            if (mainVideo) mainVideo.style.display = 'none';
        }
    }

    gallery.forEach((item, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'thumb' + (i === 0 ? ' selected' : '');
        
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.muted = true;
            video.preload = 'metadata';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            btn.appendChild(video);
            
            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';
            playIcon.innerHTML = '▶';
            playIcon.style.position = 'absolute';
            playIcon.style.top = '50%';
            playIcon.style.left = '50%';
            playIcon.style.transform = 'translate(-50%, -50%)';
            playIcon.style.color = 'white';
            playIcon.style.fontSize = '20px';
            playIcon.style.textShadow = '0 0 5px rgba(0,0,0,0.7)';
            btn.style.position = 'relative';
            btn.appendChild(playIcon);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = product.name ? `${product.name} - view ${i+1}` : `thumb ${i+1}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            btn.appendChild(img);
        }
        
        btn.addEventListener('click', () => {
            if (item.type === 'video') {
                mainImage.style.display = 'none';
                let mainVideo = document.getElementById('main-video');
                if (!mainVideo) {
                    mainVideo = document.createElement('video');
                    mainVideo.id = 'main-video';
                    mainVideo.className = 'main-media';
                    mainVideo.controls = true;
                    mainVideo.preload = 'metadata';
                    mainVideo.style.maxWidth = '100%';
                    mainVideo.style.maxHeight = '100%';
                    mainImage.parentNode.appendChild(mainVideo);
                }
                mainVideo.src = item.src;
                mainVideo.style.display = 'block';
            } else {
                mainImage.src = item.src;
                mainImage.style.display = 'block';
                const mainVideo = document.getElementById('main-video');
                if (mainVideo) mainVideo.style.display = 'none';
            }
            
            thumbs.querySelectorAll('.thumb').forEach(n => n.classList.remove('selected'));
            btn.classList.add('selected');
        });
        thumbs.appendChild(btn);
    });
}

(async function init() {
    try {
    const raw = await fetchSequential(tryPaths);
    const products = normalizeProducts(raw);
    if (!products || products.length === 0) {
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
    const fallback = {
        id: 'demo-01',
        name: 'Demo Product',
        subtitle: 'grrr',
        description: 'Steijejiejtestiungngng',
        features: ['1 banana', '2 banana', '3 banana'],
        image: '../image/product-1-2.png',
        images: ['../image/product-2.png'],
        videos: ['../video/demo-video.mp4']
    };
    render(fallback);
    }
})();

})();