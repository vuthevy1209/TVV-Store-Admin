document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('updateBtn').addEventListener('click',async  function () {
        const orderStatus = document.getElementById('statusSelection').value;
        const orderId = document.getElementById('orderId').value;

        try {
            const response = await fetch(`/orders/update-status/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderStatus })
            });

            const result = await response.json();
            if (!response.ok) {
                showAlert('error', 'Error', result.message);
            }
            const status = document.getElementById('statusName');
            status.innerText= result.statusName;
            showAlert('success', 'Success', result.message);
        }
        catch (err) {
            showAlert('error', 'Error', 'Something went wrong');
        }


    });
});