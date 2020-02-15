const deleteUser = (url, id) => {
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
            if (response.data.deletedCount != 0) {
                document.getElementById('tr_'+id).remove();
                t.value && Swal.fire("Deleted!", "Your file has been deleted.", "success");
            } else {
                t.value && Swal.fire("Failed!", "An error occured. Try again..", "error")
            }
        });
    });
}
