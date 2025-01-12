document.querySelectorAll('.button-delete-modal').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading();
        const userId = button.getAttribute('data-id');

        try {
            const response = await fetch(`/users/block/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                hideLoading();
                showAlert('success', 'Success', 'User blocked successfully');
                window.location.reload();
            } else {
                const result = await response.json();
                hideLoading();
                showAlert('error', 'Error', result.message || 'Failed to block user');
            }
        } catch (error) {
            hideLoading();
            showAlert('error', 'Error', 'Failed to block user');
        }
    });
});