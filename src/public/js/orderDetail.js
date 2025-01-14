
document.addEventListener('DOMContentLoaded', function () {

    const updateStatusDialog = document.getElementById('updateStatusModal');

    document.getElementById('updateBtn').addEventListener('click',async  function () {
        updateStatusDialog.style.display = 'block';
    });

    document.getElementById('closeUpdateModalBtn').addEventListener('click', function () {
        updateStatusDialog.style.display = 'none';
    });

    document.getElementById('updateModalBtn').addEventListener('click', async function () {
        updateStatusDialog.style.display = 'none';
        showLoading();
        const orderStatusSelect = document.getElementById('order-status-select');
        const orderStatus = orderStatusSelect.value;
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
                hideLoading();
                showAlert('error', 'Error', result.message);
                return;
            }
            if(result.resultStatus.orderStatus){
                const status = document.getElementById('statusName');
                status.innerText= result.resultStatus.orderStatus;
            }
            if(result.resultStatus.paymentStatus){
                const paymentStatus = document.getElementById('paymentStatus');
                paymentStatus.innerText= result.resultStatus.paymentStatus;
            }
            const newSupportStatus = result.newSupportStatus;
            const newStatusSelect = document.getElementById('order-status-select');
            newStatusSelect.innerHTML = '';
            newSupportStatus.forEach((status) => {
                const option = document.createElement('option');
                option.value = status.value;
                option.innerText = status.name;
                newStatusSelect.appendChild(option);
            });
            hideLoading();
            showAlert('success', 'Success', result.message);
        }
        catch (err) {
            hideLoading();
            showAlert('error', 'Error', err.message||'Some thing went wrong');
        }
    });
});