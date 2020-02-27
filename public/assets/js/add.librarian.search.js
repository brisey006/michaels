const initSearch = () => {
    const librarianSearchBox = document.getElementById('librarianSearchBox');

    if(librarianSearchBox != null) {
        const url = document.getElementById('libSearchUrl').value;
        const libSearchResults = document.getElementById('libSearchResults');

        let addLibUrl = document.getElementById('addLibUrl').value;
        const addLibLink = document.getElementById('addLibLink');

        librarianSearchBox.addEventListener('keyup', async (e) => {
            libSearchResults.innerHTML = "";
            const q = e.target.value;
            if (q != '') {
                const { data } = await axios.get(url, {
                    params: {
                        q
                    }
                });
                
                data.forEach(e => {
                    const li = document.createElement('li');
                    li.innerText = e.fullName;
                    libSearchResults.appendChild(li);
                    
                    li.addEventListener('click', async (s) => {
                        librarianSearchBox.value = e.fullName;
                        addLibUrl = addLibUrl.replace('toBeReplaced', e._id);
                        libSearchResults.innerHTML = "";

                        const response = await axios.get(addLibUrl);
                        const user = response.data;

                        const html = `
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <div class="avatar-lg">
                                        <img src="${user.photoUrl}" class="img-fluid rounded-circle" alt="user-img" />
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 class="mb-1 mt-2">${user.fullName}</h5>
                                    <a href="#" onclick="removeLibrarian('${user._id}')" class="card-link text-custom" style="color: red;">Remove</a>
                                </div>
                            </div>`;
                            document.getElementById('librarian').innerHTML = html;
                    });
                });
            } else {
                libSearchResults.innerHTML = "";
            }
        });
    }
}

initSearch();