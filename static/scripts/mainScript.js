function openAddAnimalForm() {
    document.getElementById('addAnimalFormOverlay').style.display = 'block';
}

function closeAddAnimalForm() {
    document.getElementById('addAnimalFormOverlay').style.display = 'none';
}

function submitAddAnimalForm(event) {
    event.preventDefault();

    const form = document.getElementById('addAnimalForm');
    const formData = new FormData(form);

    fetch('/addAnimal', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Animal added successfully:', data);
        closeAddAnimalForm();
        window.location.reload();
    })
    .catch(error => console.error('Error adding animal:', error));
}
function viewDog(id,isAdmin,login) {
    window.location.href = `/dog/${id}?isAdmin=${isAdmin}&login=${login}`;
}