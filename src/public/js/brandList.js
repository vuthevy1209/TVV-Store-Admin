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
    e.preventDefault();
    const brandName = document.querySelector('#brand-name').value;
    const description = document.querySelector('#description').value;
    const logo = document.querySelector('#logo-preview').src;

    let isValid = true;

    const checkLogo = logo.substring(logo.lastIndexOf('/') + 1);

    if (!brandName) {
        const brandNameInput = document.querySelector('#brand-name');
        brandNameInput.classList.add('is-invalid');
        if (!brandNameInput.nextElementSibling || !brandNameInput.nextElementSibling.classList.contains('invalid-feedback')) {
            const brandNameError = document.createElement('div');
            brandNameError.className = 'invalid-feedback';
            brandNameError.textContent = 'Please enter a brand name.';
            brandNameInput.parentNode.appendChild(brandNameError);
        }
        isValid = false;
    }

    if (!description) {
        const descriptionInput = document.querySelector('#description');
        descriptionInput.classList.add('is-invalid');
        if (!descriptionInput.nextElementSibling || !descriptionInput.nextElementSibling.classList.contains('invalid-feedback')) {
            const descriptionError = document.createElement('div');
            descriptionError.className = 'invalid-feedback';
            descriptionError.textContent = 'Please enter a description.';
            descriptionInput.parentNode.appendChild(descriptionError);
        }
        isValid = false;
    }

    if (checkLogo === 'image_placeholder.jpg') {
        const logoInput = document.querySelector('#brand-logo');
        logoInput.classList.add('is-invalid');
        if (!logoInput.nextElementSibling || !logoInput.nextElementSibling.classList.contains('invalid-feedback')) {
            const logoError = document.createElement('div');
            logoError.className = 'invalid-feedback';
            logoError.textContent = 'Please upload a logo.';
            logoInput.parentNode.appendChild(logoError);
        }
        isValid = false;
    }

    if (!isValid) {
        return; 
    }

    // hide modal
    const addBrandModal = document.getElementById('add-brand-modal');
    const bootstrapModal = bootstrap.Modal.getInstance(addBrandModal);
    bootstrapModal.hide();

    showLoading();

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

// Update the UI with the edited brand
const updateUIwithEditBrand = (brand) => {
    const brandCard = document.getElementById(`brand-${brand.id}`);
    if (!brandCard) {
        console.error('Brand card not found');
        return;
    }

    brandCard.querySelector('.card-img-top').src = brand.logo;
    brandCard.querySelector('.card-text').textContent = brand.name;

    // Update the edit modal fields
    const brandNameInput = document.querySelector(`#brand-name-${brand.id}`);
    const descriptionInput = document.querySelector(`#description-edit-${brand.id}`);
    const logoPreview = document.querySelector(`#logo-preview-edit-${brand.id}`);

    brandNameInput.value = brand.name;
    descriptionInput.value = brand.desc;
    logoPreview.src = brand.logo;
};

// edit brand
document.querySelectorAll('.button-edit-brand').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const brandId = button.getAttribute('data-id');
        const brandName = document.querySelector(`#brand-name-${brandId}`).value;
        const description = document.querySelector(`#description-edit-${brandId}`).value;
        const logo = document.querySelector(`#logo-preview-edit-${brandId}`).src;

        let isValid = true;

        const checkLogo = logo.substring(logo.lastIndexOf('/') + 1);

        if (!brandName) {
            const brandNameInput = document.querySelector(`#brand-name-${brandId}`);
            brandNameInput.classList.add('is-invalid');
            if (!brandNameInput.nextElementSibling || !brandNameInput.nextElementSibling.classList.contains('invalid-feedback')) {
                const brandNameError = document.createElement('div');
                brandNameError.className = 'invalid-feedback';
                brandNameError.textContent = 'Please enter a brand name.';
                brandNameInput.parentNode.appendChild(brandNameError);
            }
            isValid = false;
        }

        if (!description) {
            const descriptionInput = document.querySelector(`#description-edit-${brandId}`);
            descriptionInput.classList.add('is-invalid');
            if (!descriptionInput.nextElementSibling || !descriptionInput.nextElementSibling.classList.contains('invalid-feedback')) {
                const descriptionError = document.createElement('div');
                descriptionError.className = 'invalid-feedback';
                descriptionError.textContent = 'Please enter a description.';
                descriptionInput.parentNode.appendChild(descriptionError);
            }
            isValid = false;
        }

        if (checkLogo === 'image_placeholder.jpg') {
            const logoInput = document.querySelector(`#brand-logo-edit-${brandId}`);
            logoInput.classList.add('is-invalid');
            if (!logoInput.nextElementSibling || !logoInput.nextElementSibling.classList.contains('invalid-feedback')) {
                const logoError = document.createElement('div');
                logoError.className = 'invalid-feedback';
                logoError.textContent = 'Please upload a logo.';
                logoInput.parentNode.appendChild(logoError);
            }
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Hide modal
        const editBrandModal = document.getElementById(`EditModal-${brandId}`);
        const bootstrapModal = bootstrap.Modal.getInstance(editBrandModal);
        bootstrapModal.hide();

        showLoading();

        const imageUrl = await uploadFile(logo);

        const data = {
            id: brandId,
            name: brandName,
            desc: description,
            logo: imageUrl
        };

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
            showAlert('error', 'Error', 'Failed to update brand');
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


const inputs = document.querySelectorAll('#brand-name, #description, #brand-logo');
inputs.forEach(input => {
    input.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            this.classList.remove('is-invalid');
            const error = this.nextElementSibling;
            if (error && error.classList.contains('invalid-feedback')) {
                error.remove();
            }
        }
    });
});


// Reset form when add brand modal is hidden
const addBrandModalElement = document.getElementById('add-brand-modal');
addBrandModalElement.addEventListener('hidden.bs.modal', () => {
    const form = addBrandModalElement.querySelector('form');
    form.reset();
    document.getElementById('logo-preview').src = '/images/image_placeholder.jpg';
    form.querySelectorAll('.is-invalid').forEach(element => {
        element.classList.remove('is-invalid');
    });
    form.querySelectorAll('.invalid-feedback').forEach(element => {
        element.remove();
    });
});

// Store the original image URL when the edit modal is shown
document.querySelectorAll('.modal[id^="EditModal-"]').forEach(modalElement => {
    modalElement.addEventListener('show.bs.modal', () => {
        const brandId = modalElement.id.split('-')[1];
        const originalImage = document.getElementById(`logo-preview-edit-${brandId}`).src;
        modalElement.setAttribute('data-original-image', originalImage);
    });
});

// Reset form when edit brand modal is hidden
document.querySelectorAll('.modal[id^="EditModal-"]').forEach(modalElement => {
    modalElement.addEventListener('hidden.bs.modal', () => {
        const form = modalElement.querySelector('form');
        form.reset();
        const brandId = modalElement.id.split('-')[1];
        const originalImage = modalElement.getAttribute('data-original-image');
        document.getElementById(`logo-preview-edit-${brandId}`).src = originalImage;
        form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(element => {
            element.remove();
        });
    });
});