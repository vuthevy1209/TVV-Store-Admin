document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    //showLoading();

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();

        if (response.ok && result.redirectUrl) {
            window.location.href = result.redirectUrl;
        } else {
            //showAlert('error', 'Error', result.message || 'Login failed!');
        }

    } catch (error) {
        console.error('Error:', error);
        //showAlert('error', 'Error', 'An error occurred. Please try again.');
    }
});

document.querySelectorAll('.toggle-password').forEach(item => {
    item.addEventListener('click', function () {
        const password = this.previousElementSibling;
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });
});