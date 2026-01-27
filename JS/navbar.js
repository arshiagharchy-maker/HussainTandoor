document.addEventListener('DOMContentLoaded', function() {
    const topBar = document.querySelector('.top-bar');
    const heroSection = document.querySelector('.hero-section');
    const contactBtn = document.querySelector('.contact-btn');
    let lastScrollY = window.scrollY;

    function updateNavbar() {
        if (!heroSection) {
            contactBtn.classList.add('shown')
            return ;
        }
        const currentScrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;

        if (currentScrollY > 80) {
            topBar.classList.add('fixed')
            contactBtn.classList.add('shown')
        } else {
            topBar.classList.remove('fixed')
            contactBtn.classList.remove('shown')
        }

        lastScrollY = currentScrollY;
    }

    updateNavbar();
    window.addEventListener('scroll', updateNavbar);
});