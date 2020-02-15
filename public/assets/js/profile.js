const passwordSubmit = document.getElementById('passwordSubmit');
passwordSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const form = document.forms['passwordForm'];
    const url = form['url'].value;
    const currentPassword = form['currentPassword'].value;
    const newPassword = form['newPassword'].value;
    const confirmPassword = form['confirmPassword'].value;
    const errorContainer = document.getElementById('error-container');
    
    axios.post(url, {
        currentPassword,
        newPassword,
        confirmPassword
    }).then((response) => {
        if (response.data.status == 'err') {
            errorContainer.innerHTML = `<div class="alert alert-danger alert-dismissible bg-danger text-white border-0 fade show" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
                <strong>Error - </strong> ${response.data.message}
            </div>`;
        } else if (response.data.status == 'success') {
            form['currentPassword'].value = '';
            form['newPassword'].value = '';
            form['confirmPassword'].value = '';
            errorContainer.innerHTML = `<div class="alert alert-success alert-dismissible bg-success text-white border-0 fade show" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
                <strong>Success - </strong> ${response.data.message}
            </div>`;
        }
    }).catch(err => {
        console.log(err);
    });
});