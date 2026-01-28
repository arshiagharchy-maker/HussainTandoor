async function loadProducts() {
    try {
        const response = await fetch('JS/products.json');
        const products = await response.json();
        const gallery = document.querySelector('.gallery');
        const mainMedia = document.querySelector('.product-image-wrapper');
        const productTitle = document.querySelector('.product-title');
        const featuresList = document.querySelector('.features-list');

        const urlParams = new URLSearchParams(window.location.search);
        const productIndex = Math.min(parseInt(urlParams.get('product')) || 0, products.length - 1);

        const currentProduct = products[productIndex];
        productTitle.textContent = currentProduct.name;
        featuresList.innerHTML = currentProduct.Features.map(feature => `<li>${feature}</li>`).join('');
        currentProduct.media.forEach((media, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-item';
            if (index === 0) thumb.classList.add('active');

            if (media.type === 'image') {
                const img = document.createElement('img');
                img.src = media.src;
                img.alt = `${currentProduct.name} ${media.type} ${index + 1}`;
                thumb.appendChild(img);
            } else {
                const videoThumb = document.createElement('div');
                videoThumb.style.position = 'relative';
                videoThumb.style.width = '80px';
                videoThumb.style.height = '80px';
                videoThumb.style.backgroundColor = '#000';
                videoThumb.style.display = 'flex';
                videoThumb.style.alignItems = 'center';
                videoThumb.style.justifyContent = 'center';
                videoThumb.style.borderRadius = '4px';
                videoThumb.style.cursor = 'pointer';
                
                const playIcon = document.createElement('div');
                playIcon.style.fontSize = '32px';
                playIcon.style.color = '#fff';
                playIcon.textContent = '▶';
                videoThumb.appendChild(playIcon);
                thumb.appendChild(videoThumb);
            }

            thumb.addEventListener('click', () => {
                document.querySelectorAll('.gallery-item').forEach(item => item.classList.remove('active'));
                thumb.classList.add('active');

                updateMainMedia(media);
            });

            gallery.appendChild(thumb);
        });

        if (currentProduct.media.length > 0) {
            updateMainMedia(currentProduct.media[0]);
        }

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function updateMainMedia(media) {
    const mainMedia = document.querySelector('.product-image-wrapper');
    mainMedia.innerHTML = '';

    if (media.type === 'video') {
        const video = document.createElement('video');
        video.src = media.src;
        video.controls = true;
        video.className = 'main-product-image';
        video.style.width = '100%';
        video.style.height = 'auto';
        video.style.maxHeight = '500px';
        video.style.objectFit = 'contain';
        video.style.borderRadius = '8px';
        mainMedia.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = 'Product image';
        img.className = 'main-product-image';
        mainMedia.appendChild(img);
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);