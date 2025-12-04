(async function () {
  const tryPaths = [
    "js/product.json",
    "./js/product.json",
    "/js/product.json",
    "products/product.json",
    "./products/product.json",
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
    if (fallback) fallback.innerHTML = '<p style="text-align:center;color:#900">Could not load products.</p>';
    return;
  }

  const container = document.getElementById("product-list");
  if (!container) return;

  function imageSrc(product) {
    if (!product) return "";
    if (typeof product.image === "string") return product.image;
    if (typeof product.image === "number") return `images/product-${product.image}.jpg`;
    return product.imagePath || product.image_url || "";
  }

  products.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-ad-card";
    card.style.cssText = "border:2px solid #000000; border-radius:8px; padding:1rem; background:#F6EFD2;";

    const frame = document.createElement("div");
    frame.className = "product-image-frame";
    frame.style.cssText = "width:100%;height:110px;background:#F6EFD2;border:2px solid #000000;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-bottom:0.7rem;";

    const src = imageSrc(prod);
    if (src) {
      const img = document.createElement("img");
      img.alt = prod.name || "";
      img.loading = "lazy";
      img.style.cssText = "max-width:100%; max-height:100%; object-fit:cover; border-radius:4px;";
      img.src = src;
      frame.appendChild(img);
    } else {
      const placeholder = document.createElement("span");
      placeholder.style.cssText = "color:#000000;font-size:1em;";
      placeholder.textContent = "[No image]";
      frame.appendChild(placeholder);
    }

    card.appendChild(frame);

    const h3 = document.createElement("h3");
    h3.style.cssText = "margin-top:0; color:#000000;";
    h3.textContent = prod.name || "[Product]";
    card.appendChild(h3);

    const p = document.createElement("p");
    p.style.cssText = "margin:0.5rem 0 1rem 0; color:#000000;";
    p.textContent = prod.description || "";
    card.appendChild(p);

    const cat = document.createElement("div");
    cat.style.cssText = "font-size:0.95em; color:#000000;";
    cat.textContent = `Category: ${prod.category || ""}`;
    card.appendChild(cat);

    const a = document.createElement("a");
    a.href = `products/product.html?id=${encodeURIComponent(prod.id)}`;
    a.style.cssText = "display:inline-block; margin-top:0.7rem; color:#E43636; text-decoration:underline; font-weight:600; border:1.5px solid #E43636; border-radius:6px; padding:4px 14px; background:#F6EFD2;";
    a.textContent = "Learn More";
    card.appendChild(a);

    container.appendChild(card);
  });

  try {
    const staticGrid = document.querySelector('.product-advertising-list:not(#product-list)');
    if (staticGrid) staticGrid.remove();
  } catch (e) {
  }
})();
