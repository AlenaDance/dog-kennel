    async function deleteDog(dogId, isAdmin, login) {
        try {
            const confirmDelete = confirm('Ты уверен что хочешь удалить собаку?');

            if (confirmDelete) {
                const response = await fetch(`/deleteDog/${dogId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    window.location.href = `/?isAdmin=${isAdmin}&login=${login}`;

                } else {
                    console.error('Failed to delete dog');
                }
            }
        } catch (error) {
            console.error('Error deleting dog:', error);
        }
    }

    function openUpdateForm() {      
        const dogDetails = document.querySelector('.details');        

        const dogName = dogDetails.querySelector('h2').textContent.trim();
        function findListItem(label) {
            var listItems = dogDetails.querySelectorAll("li");
            for (var i = 0; i < listItems.length; i++) {
                var listItem = listItems[i];
                if (listItem.textContent.includes(label)) {
                    return listItem.textContent.replace(label, '').trim();
                }
            }
            return null;
        }
        const dogAge = findListItem("Возраст:");
        const dogBreed = findListItem("Порода:");
        const dogColor = findListItem("Цвет:");
        const dogCoatType = findListItem("Тип шерсти:");
        const dogGender = findListItem("Пол:");
        const dogOwner = findListItem("Владелец:");
    
        document.getElementById('updateDogForm').elements['name'].value = dogName;
        document.getElementById('updateDogForm').elements['age'].value = dogAge;
        document.getElementById('updateDogForm').elements['breed'].value = dogBreed;
        document.getElementById('updateDogForm').elements['color'].value = dogColor;
        document.getElementById('updateDogForm').elements['coat_type'].value = dogCoatType;
        document.getElementById('updateDogForm').elements['gender'].value = dogGender;
        document.getElementById('updateDogForm').elements['owner'].value = dogOwner;

        document.getElementById('overlayUpdateForm').style.display = 'block';
        document.getElementById('updateDogModal').style.display = 'block';
    }



    function closeUpdateForm() {
        document.getElementById('overlayUpdateForm').style.display = 'none';
        document.getElementById('updateDogModal').style.display = 'none';
    }

    function submitUpdateForm(event, dogId) {
        event.preventDefault();

        const form = document.getElementById('updateDogForm');
        const formData = new FormData(form);

        fetch(`/updateDog/${dogId}`, {
            method: 'PUT',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Dog updated successfully:', data);
            window.location.reload();
            closeUpdateForm();
        })
        .catch(error => console.error('Error updating dog:', error));
    }

    async function buyDog(dogId, login) {
        try {
            const confirmBuy = confirm('Ты уверен что хочешь купить собаку?');
    
            if (confirmBuy) {
                const response = await fetch(`/buyDog/${dogId}?login=${login}`, {
                    method: 'POST',
                });
    
                if (response.ok) {
                    window.location.reload();
                } else {
                    console.error('Failed to buy dog');
                }
            }
        } catch (error) {
            console.error('Error buying dog:', error);
        }
    }
    

