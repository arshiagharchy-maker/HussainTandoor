document.querySelectorAll('.send-message-btn').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.team-card');
        const phoneNumber = card.querySelector('.team-number').innerText;

        const cleanNumber = phoneNumber.replace(/\D/g, '');

        const message = encodeURIComponent("Hello, I want to inquire about a product.");

    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${message}`;
    window.open(url, "_blank");
    });
});