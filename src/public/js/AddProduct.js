
document.addEventListener('DOMContentLoaded', function() {
    const mainPreview = document.querySelector('.main-image-preview');
    const thumbnailStrip = document.querySelector('.thumbnail-strip');
    const fileInput = document.querySelector('.hidden-file-input');

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageId = Date.now().toString();
                    addThumbnail(e.target.result, imageId);
                    if (!mainPreview.querySelector('img')) {
                        updateMainPreview(e.target.result);
                    }
                    // Remove error message if it exists
                    const imageErrorMessage = document.querySelector('.image-upload-section .error-message');
                    if (imageErrorMessage) {
                        imageErrorMessage.remove();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Handle thumbnail clicks
    thumbnailStrip.addEventListener('click', function(e) {
        const thumbnail = e.target.closest('.thumbnail-wrapper');
        if (thumbnail) {
            const img = thumbnail.querySelector('img');
            if (img) {
                updateMainPreview(img.src);
                // Update selected state
                document.querySelectorAll('.thumbnail-wrapper').forEach(t => t.classList.remove('selected-main'));
                thumbnail.classList.add('selected-main');
            }
        }
    });

    // Handle image removal
    thumbnailStrip.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-image');
        if (removeBtn) {
            e.stopPropagation();
            const thumbnail = removeBtn.closest('.thumbnail-wrapper');
            const imageId = thumbnail.dataset.imageId;
            thumbnail.remove();

            // Update main preview if needed
            if (thumbnail.classList.contains('selected-main')) {
                const firstThumbnail = document.querySelector('.thumbnail-wrapper img');
                if (firstThumbnail) {
                    updateMainPreview(firstThumbnail.src);
                    firstThumbnail.closest('.thumbnail-wrapper').classList.add('selected-main');
                } else {
                    clearMainPreview();
                }
            }
        }
    });

    function updateMainPreview(src) {
        mainPreview.innerHTML = `<img src="${src}" alt="Main preview" class="main-preview-img">`;
    }

    function clearMainPreview() {
        mainPreview.innerHTML = `
            <div class="upload-placeholder">
                <i class="upload-icon"></i>
            </div>`;
    }

    function addThumbnail(src, imageId) {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail-wrapper';
        thumbnail.dataset.imageId = imageId;
        thumbnail.innerHTML = `
            <img src="${src}" alt="thumbnail" class="thumbnail-img">
            <button type="button" class="remove-image" data-image-id="${imageId}">
                <i class="fas fa-times"></i>
            </button>`;
        thumbnailStrip.insertBefore(thumbnail, thumbnailStrip.lastElementChild);
    }

    const form = document.getElementById("productForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

        const inputs = form.querySelectorAll('.form-control');
        let isValid = true;

        inputs.forEach(input => {
            const name = input.name;
            if (name === 'discount' || name === 'discount_type') return;
            const error = input.nextElementSibling;

            if (input.value.trim() === '') {
                input.classList.add('error');
                isValid = false;

                if (!error || !error.classList.contains('error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.classList.add('error-message');
                    errorMessage.textContent = 'This field is required';
                    input.parentElement.appendChild(errorMessage);
                }
            } else {
                input.classList.remove('error');
                if (error && error.classList.contains('error-message')) {
                    error.remove();
                }
            }
        });

        const imageInputs = document.querySelectorAll('.thumbnail-wrapper img');
        const imageErrorMessage = document.querySelector('.image-upload-section .error-message');

        if (imageInputs.length === 0) {
            if (!imageErrorMessage) {
                const newImageErrorMessage = document.createElement('div');
                newImageErrorMessage.classList.add('error-message');
                newImageErrorMessage.textContent = 'At least one image is required';
                document.querySelector('.image-upload-section').appendChild(newImageErrorMessage);
            }
            isValid = false;
        } else {
            if (imageErrorMessage) {
                imageErrorMessage.remove(); // Xóa thông báo lỗi nếu có ảnh
            }
        }

        if (!isValid) {
            return;
        }

        showLoading();

        const formData = new FormData(form);
        const body = {};

        for (let [key, value] of formData.entries()) {
            if (key !== 'image_urls') {
                if (key === 'business_status') {
                    body[key] = (value === 'true');
                } else {
                    body[key] = value;
                }
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

        const imageList = Array.from(document.querySelectorAll('.thumbnail-wrapper img')).map(img => img.src);

        body.image_urls = [];
        for (let image of imageList) {
            try {
                const url = await uploadFile(image);
                if (url) {
                    body.image_urls.push(url);
                }
            } catch (error) {
                console.error("Error uploading image", error);
            }
        }

        console.log(body);

        try {
            const response = await fetch("/products/store", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const result = await response.json();
                showAlert('success', 'Success', result.message || 'Product added successfully!');
                hideLoading();
                clearMainPreview();
                // Clear only the thumbnails, keep the "+" button
                const thumbnails = document.querySelectorAll('.thumbnail-wrapper');
                thumbnails.forEach(thumbnail => thumbnail.remove());

                form.reset();
                console.log(result);
            } else {
                const error = await response.json();
                showAlert('error', 'Error', result.message || 'An error occurred. Please try again!');
            }
        } catch (err) {
            console.error("Error:", err);
            showAlert('error', 'Error', 'An error occurred. Please try again.');
        }
    });

    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value.trim() !== '') {
                const error = this.nextElementSibling;
                this.classList.remove('error');
                if (error && error.classList.contains('error-message')) {
                    error.remove();
                }
            }
        });
    });
});