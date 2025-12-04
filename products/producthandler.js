const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"), 10);

const tryPaths = ["products/product.json", "../products/product.json", "./products/product.json", "/js/product.json"];

function fetchJsonSequential(paths) {
    return new Promise((resolve, reject) => {
        let i = 0;
        function next() {
            if (i >= paths.length) return reject(new Error("cannot read json :("));
            fetch(paths[i])
                .then(res => {
                    if (!res.ok) {
                        i++;
                        next();
                        return;
                    }
                    return res.json().then(data => resolve(data));
                })
                .catch(() => {
                    i++;
                    next();
                });
        }
        next();
    });
}

fetchJsonSequential(tryPaths)
    .then(data => {
        const products = Array.isArray(data) ? data : (data.PRODUCTS || data.products || []);
        const product = products.find(p => p && p.id === productId);

        if (!product) {
            document.body.innerHTML = '<h2 style="text-align:center;margin-top:40px;">Product not found.</h2>';
            return;
        }

        const nameEl = document.getElementById("name");
        const imageEl = document.getElementById("image");
        const subtitleEl = document.getElementById("subtitle");
        const descEl = document.getElementById("description");
        const featureEl = document.getElementById("feature");
        const categoryEl = document.getElementById("category");

        if (nameEl) nameEl.textContent = product.name || "";

        if (imageEl) {
            const img = product.image || product.imagePath || product.image_url || "";
            if (typeof img === 'number') {
                imageEl.src = `../images/product-${img}.jpg`;
            } else {
                imageEl.src = img;
            }
            imageEl.alt = product.name || "";
        }

        if (subtitleEl) subtitleEl.textContent = product.subtitle || "";
        if (descEl) descEl.textContent = product.description || "";

        if (featureEl) {
            featureEl.innerHTML = '';
            if (Array.isArray(product.features)) {
                product.features.forEach(f => {
                    const li = document.createElement('li');
                    li.textContent = f;
                    featureEl.appendChild(li);
                });
            } else if (typeof product.features === 'string' && product.features.trim()) {
                const parts = product.features.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
                parts.forEach(p => {
                    const li = document.createElement('li');
                    li.textContent = p;
                    featureEl.appendChild(li);
                });
            }
        }

        if (categoryEl) {
            categoryEl.innerHTML = `<span style="font-weight:600; color:#E43636;">Category:</span> <span style="color:#000;">${product.category || ''}</span>`;
        }
    })
    .catch(err => {
        console.error("Error loading product:", err);
    });