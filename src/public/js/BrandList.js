function previewLogo(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logo-preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function previewLogoEdit(event, id) {
    const file = event.target.files[0];
    const preview = document.getElementById(`logo-preview-edit-${id}`);

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}


const uploadFile = async (image) => {
    try {
        const response = await fetch("/cloudinary/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: image }),
        });

        if (response.ok) {
            const result = await response.json();
            return result.url;
        } else {
            console.error("Upload failed", response.status, await response.text());
            return null;
        }
    } catch (error) {
        console.error("Error uploading file", error);
        return null;
    }
};

// add brand
const saveBtn = document.querySelector('#btn-save-brand');

saveBtn.addEventListener('click', async (e) => {
    showLoading();

    e.preventDefault();
    const brandName = document.querySelector('#brand-name').value;
    const description = document.querySelector('#description').value;
    const logo = document.querySelector('#logo-preview').src;

    if (!brandName || !description || !logo) {
        alert('Please fill all fields');
        return;
    }

    const imageUrl = await uploadFile(logo);

    const newBrand = {
        name: brandName,
        description: description,
        logo: imageUrl
    };

    const response = await fetch('/brands/store', {
        method: 'POST',
        body: JSON.stringify(newBrand),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const result = await response.json();
        hideLoading();
        window.location.reload();
        showAlert('success', 'Success', 'Brand saved successfully');
    } else {
        hideLoading();
        showAlert('error', 'Error', 'Failed to save brand');
    }
});

const updateUIwithEditBrand = (brand) => {
    const brandCard = document.getElementById(`brand-${brand.id}`);
    if (!brandCard) {
        console.error('Brand card not found');
        return;
    }

    brandCard.querySelector('.card-img-top').src = brand.logo;
    brandCard.querySelector('.card-text').textContent = brand.name;
};

// edit brand
document.querySelectorAll('.button-edit-brand').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading();

        const brandId = button.getAttribute('data-id');
        const image = document.querySelector(`#logo-preview-edit-${brandId}`).src;
        const imageUrl = await uploadFile(image);

        const data = {
            id: brandId,
            name: document.querySelector(`#brand-name-${brandId}`).value,
            desc: document.querySelector(`#description-edit-${brandId}`).value,
            logo: imageUrl
        };

        console.log(data);

        try {
            const response = await fetch(`/brands/update`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                showAlert('success', 'Success', 'Brand updated successfully');
                hideLoading();
                const result = await response.json();
                updateUIwithEditBrand(result.data);

            } else {
                showAlert('error', 'Error', 'Failed to update brand');
                hideLoading();
            }
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
        }
    });
});

// delete brand
document.querySelectorAll('.button-delete-modal').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading();
        const brandId = button.getAttribute('data-id');

        try {
            const response = await fetch(`/brands/${brandId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                hideLoading();
                showAlert('success', 'Success', 'Brand deleted successfully!');
                const brandCard = document.getElementById(`brand-${brandId}`);
                brandCard.remove();
            } else {
                const result = await response.json();
                hideLoading();
                showAlert('error', 'Error', result.message || 'Failed to delete product');
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
        }
    });
});