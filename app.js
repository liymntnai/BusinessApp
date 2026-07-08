document.addEventListener("DOMContentLoaded", () => {
    let activeRow = null;
    let tempImageDataUrl = null; // Temp holder for uploaded image data

    // Modals
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const detailsModal = document.getElementById("detailsModal");

    // Form inputs & Preview Elements
    const editForm = document.getElementById("editForm");
    const editItemRowId = document.getElementById("editItemRowId");
    const editName = document.getElementById("editName");
    const editCP = document.getElementById("editCP");
    const editRetail = document.getElementById("editRetail");
    const editWholesale1 = document.getElementById("editWholesale1");
    const editWholesale2 = document.getElementById("editWholesale2");
    const editStock = document.getElementById("editStock");
    const itemImageInput = document.getElementById("itemImageInput");
    const editImgPreview = document.getElementById("editImgPreview");

    // Close button handlers
    document.querySelectorAll(".close-modal, .close-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
            tempImageDataUrl = null; // Clear chosen image state
        });
    });

    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.classList.remove("show");
            tempImageDataUrl = null;
        }
        if (!e.target.closest(".dropdown-container")) {
            document.querySelectorAll(".dropdown-menu").forEach(d => d.classList.remove("show"));
        }
    });

    // File input change detection logic
    itemImageInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                tempImageDataUrl = e.target.result;
                // Render preview inside modal
                editImgPreview.style.backgroundImage = `url('${tempImageDataUrl}')`;
                editImgPreview.classList.remove("default-avatar");
                editImgPreview.innerHTML = ""; // Strip inner icon
            }
            reader.readAsDataURL(file);
        }
    });

    const itemsBody = document.getElementById("items-body");

    itemsBody.addEventListener("click", (e) => {
        const target = e.target;
        const row = target.closest("tr");
        if (!row) return;

        activeRow = row;
        const rowId = row.getAttribute("data-id");
        const itemName = row.querySelector(".item-name").innerText;
        const cells = row.querySelectorAll(".numeric-val");
        
        const itemCP = cells[0].innerText;
        const itemW1 = cells[1].innerText;
        const itemW2 = cells[2].innerText;
        const itemRetail = cells[3].innerText;
        const itemStock = cells[4].innerText;

        // Get row image if custom image exists
        const rowAvatar = row.querySelector(".item-avatar");
        const existingAvatarImage = rowAvatar.querySelector("img");
        let currentImg = rowAvatar.style.backgroundImage;

        if (!currentImg && existingAvatarImage) {
            currentImg = `url('${existingAvatarImage.getAttribute("src")}')`;
        }

        // 1. Edit Action
        if (target.closest(".edit-btn")) {
            editItemRowId.value = rowId;
            editName.value = itemName;
            editCP.value = itemCP;
            editWholesale1.value = itemW1;
            editWholesale2.value = itemW2;
            editRetail.value = itemRetail;
            editStock.value = itemStock;
            itemImageInput.value = ""; // Clear file selector input
            
            if (currentImg) {
                editImgPreview.style.backgroundImage = currentImg;
                editImgPreview.classList.remove("default-avatar");
                editImgPreview.innerHTML = "";
                tempImageDataUrl = currentImg.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            } else {
                editImgPreview.style.backgroundImage = "";
                editImgPreview.classList.add("default-avatar");
                editImgPreview.innerHTML = '<i class="fa-solid fa-image"></i>';
                tempImageDataUrl = null;
            }
            
            editModal.classList.add("show");
        }

        // 2. Delete Action
        if (target.closest(".delete-btn")) {
            document.getElementById("deleteItemName").innerText = itemName;
            deleteModal.classList.add("show");
        }

        // 3. Dropdown Menu Trigger
        if (target.closest(".more-btn")) {
            document.querySelectorAll(".dropdown-menu").forEach(d => {
                if(d !== row.querySelector(".dropdown-menu")) d.classList.remove("show");
            });
            row.querySelector(".dropdown-menu").classList.toggle("show");
        }

        // 4. Details Option selection
        if (target.closest(".details-option")) {
            document.getElementById("detName").innerText = itemName;
            document.getElementById("detCode").innerText = `Code: ${rowId}`;
            document.getElementById("detCP").innerText = itemCP;
            document.getElementById("detW1").innerText = itemW1;
            document.getElementById("detW2").innerText = itemW2;
            document.getElementById("detRetail").innerText = itemRetail;
            document.getElementById("detStock").innerText = itemStock;
            
            const detImgWrapper = document.getElementById("detImgWrapper");
            if (currentImg) {
                detImgWrapper.innerHTML = `<div class="large-avatar" style="background-image: ${currentImg}"></div>`;
            } else {
                detImgWrapper.innerHTML = `<div class="large-avatar default-avatar"><i class="fa-solid fa-image"></i></div>`;
            }
            
            detailsModal.classList.add("show");
            target.closest(".dropdown-menu").classList.remove("show");
        }
    });

    // Save Edit changes including Image file
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (activeRow) {
            activeRow.querySelector(".item-name").innerText = editName.value;
            const cells = activeRow.querySelectorAll(".numeric-val");
            cells[0].innerText = editCP.value;
            cells[1].innerText = editWholesale1.value;
            cells[2].innerText = editWholesale2.value;
            cells[3].innerText = editRetail.value;
            cells[4].innerText = editStock.value;

            // Apply new image data value back to targeted row avatar block
            const rowAvatar = activeRow.querySelector(".item-avatar");
            if (tempImageDataUrl) {
                rowAvatar.style.backgroundImage = `url('${tempImageDataUrl}')`;
                rowAvatar.style.backgroundSize = "cover";
                rowAvatar.style.backgroundPosition = "center";
                rowAvatar.style.backgroundRepeat = "no-repeat";
                rowAvatar.classList.remove("default-avatar");
                rowAvatar.innerHTML = "";
            }
        }
        editModal.classList.remove("show");
        tempImageDataUrl = null;
    });

    // Handle deletion workflow
    document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
        if (activeRow) {
            activeRow.remove();
            activeRow = null;
        }
        deleteModal.classList.remove("show");
    });
});