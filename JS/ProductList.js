async function loadProducts() {
    try {
        const response = await fetch('../JS/products.json');
        const products = await response.json();
        const container = document.querySelector('.product-grid');

        products.forEach((product, index) => {
            const card = document.createElement('article');
            card.className = 'product-card';

            card.innerHTML = `
                <div class="product-header">
                    <h3 class="product-title">${product.name}</h3>
                </div>
                
                <div class="product-image-wrapper">
                    <img src="${product.media && product.media.length > 0 ? product.media[0].src : 'https://placehold.co/300x300/e0e0e0/333333?text=No+Image'}" alt="${product.name}" class="product-image">
                </div>
                
                <div class="product-footer">
                    <a class="learn-more-btn" href="ProductPage.html?product=${index}">Learn More</a>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadProducts);