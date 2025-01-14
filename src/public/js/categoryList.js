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

// add category
const saveBtn = document.querySelector('#btn-save-category');

saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const categoryName = document.querySelector('#category-name').value;
    const description = document.querySelector('#description').value;
    const logo = document.querySelector('#logo-preview').src;

    let isValid = true;

    const checkLogo = logo.substring(logo.lastIndexOf('/') + 1);

    if (!categoryName) {
        const categoryNameInput = document.querySelector('#category-name');
        categoryNameInput.classList.add('is-invalid');
        if (!categoryNameInput.nextElementSibling || !categoryNameInput.nextElementSibling.classList.contains('invalid-feedback')) {
            const categoryNameError = document.createElement('div');
            categoryNameError.className = 'invalid-feedback';
            categoryNameError.textContent = 'Please enter a category name.';
            categoryNameInput.parentNode.appendChild(categoryNameError);
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
        const logoInput = document.querySelector('#category-logo');
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
    const addCategoryModal = document.getElementById('add-category-modal');
    const bootstrapModal = bootstrap.Modal.getInstance(addCategoryModal);
    bootstrapModal.hide();

    showLoading();

    const imageUrl = await uploadFile(logo);
    const newCategory = {
        name: categoryName,
        description: description,
        logo: imageUrl
    };

    const response = await fetch('/categories/store', {
        method: 'POST',
        body: JSON.stringify(newCategory),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const result = await response.json();
        hideLoading();
        window.location.reload();
        showAlert('success', 'Success', 'Category saved successfully');
    } else {
        hideLoading();
        showAlert('error', 'Error', 'Failed to save category');
    }
});

const updateUIwithEditCategory = (category) => {
    const categoryCard = document.getElementById(`category-${category.id}`);
    if (!categoryCard) {
        console.error('Category card not found');
        return;
    }

    categoryCard.querySelector('.card-img-top').src = category.logo;
    categoryCard.querySelector('.card-text').textContent = category.name;

    // Update the edit modal fields
    const categoryNameInput = document.querySelector(`#category-name-${category.id}`);
    const descriptionInput = document.querySelector(`#description-edit-${category.id}`);
    const logoPreview = document.querySelector(`#logo-preview-edit-${category.id}`);

    categoryNameInput.value = category.name;
    descriptionInput.value = category.desc;
    logoPreview.src = category.logo;
};

// edit category
document.querySelectorAll('.button-edit-category').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const categoryId = button.getAttribute('data-id');
        const categoryName = document.querySelector(`#category-name-${categoryId}`).value;
        const description = document.querySelector(`#description-edit-${categoryId}`).value;
        const logo = document.querySelector(`#logo-preview-edit-${categoryId}`).src;

        let isValid = true;

        const checkLogo = logo.substring(logo.lastIndexOf('/') + 1);

        if (!categoryName) {
            const categoryNameInput = document.querySelector(`#category-name-${categoryId}`);
            categoryNameInput.classList.add('is-invalid');
            if (!categoryNameInput.nextElementSibling || !categoryNameInput.nextElementSibling.classList.contains('invalid-feedback')) {
                const categoryNameError = document.createElement('div');
                categoryNameError.className = 'invalid-feedback';
                categoryNameError.textContent = 'Please enter a category name.';
                categoryNameInput.parentNode.appendChild(categoryNameError);
            }
            isValid = false;
        }

        if (!description) {
            const descriptionInput = document.querySelector(`#description-edit-${categoryId}`);
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
            const logoInput = document.querySelector(`#category-logo-edit-${categoryId}`);
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
        const editCategoryModal = document.getElementById(`EditModal-${categoryId}`);
        const bootstrapModal = bootstrap.Modal.getInstance(editCategoryModal);
        bootstrapModal.hide();

        showLoading();

        const imageUrl = await uploadFile(logo);

        const data = {
            id: categoryId,
            name: categoryName,
            desc: description,
            logo: imageUrl
        };

        try {
            const response = await fetch(`/categories/update`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                showAlert('success', 'Success', 'Category updated successfully');
                hideLoading();
                const result = await response.json();
                console.log('Result:', result.data);
                updateUIwithEditCategory(result.data);
            } else {
                showAlert('error', 'Error', 'Failed to update category');
                hideLoading();
            }
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
        }
    });
});

// delete category
document.querySelectorAll('.button-delete-modal').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading();
        const categoryId = button.getAttribute('data-id');

        try {
            const response = await fetch(`/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                hideLoading();
                showAlert('success', 'Success', 'Category deleted successfully!');
                const categoryCard = document.getElementById(`category-${categoryId}`);
                categoryCard.remove();
            } else {
                const result = await response.json();
                hideLoading();
                showAlert('error', 'Error', result.message || 'Failed to delete category');
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
        }
    });
});

const inputs = document.querySelectorAll('#category-name, #description, #category-logo');
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

// Reset form when add category modal is hidden
const addCategoryModalElement = document.getElementById('add-category-modal');
addCategoryModalElement.addEventListener('hidden.bs.modal', () => {
    const form = addCategoryModalElement.querySelector('form');
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
        const categoryId = modalElement.id.split('-')[1];
        const originalImage = document.getElementById(`logo-preview-edit-${categoryId}`).src;
        modalElement.setAttribute('data-original-image', originalImage);
    });
});

// Reset form when edit category modal is hidden
document.querySelectorAll('.modal[id^="EditModal-"]').forEach(modalElement => {
    modalElement.addEventListener('hidden.bs.modal', () => {
        const form = modalElement.querySelector('form');
        form.reset();
        const categoryId = modalElement.id.split('-')[1];
        const originalImage = modalElement.getAttribute('data-original-image');
        document.getElementById(`logo-preview-edit-${categoryId}`).src = originalImage;
        form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(element => {
            element.remove();
        });
    });
});