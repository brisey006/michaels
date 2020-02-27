const removeLibrarian = (id) => {
    let removeLibUrl = document.getElementById('removeLibUrl').value;
    let url = removeLibUrl.replace('toBeReplaced', id);
    console.log(url);
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: !0,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((t) => {
        axios.get(url).then(response => {
            console.log(response.data);
            if (response.data.deletedCount != 0) {
                document.getElementById('librarian').innerHTML = `
                    <div class="row">
                        <div class="col">
                            <input type="text" class="form-control chat-input" id="librarianSearchBox" placeholder="Search Librarian...">
                            <div class="search-view-container">
                                <ul class="search-view" id="libSearchResults"></ul>
                            </div>
                        </div>
                    </div>
                `;
                initSearch();
                t.value && Swal.fire("Deleted!", "Your file has been deleted.", "success");
            } else {
                t.value && Swal.fire("Failed!", "An error occured. Try again..", "error")
            }
        });
    });
}