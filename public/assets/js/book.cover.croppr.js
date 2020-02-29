var croppr;
croppr = new Croppr('#croppr', {
    aspectRatio: 1.5
});

const profileUrl = document.getElementById('profileUrl');

document.getElementById('save').addEventListener('click', (e) => {
    e.preventDefault();
    let data = croppr.getValue();
    
    var formData = new FormData();
    formData.append('file', getBlob(data));

    axios.post(location.pathname, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(e => {
        location.href = profileUrl.value;
    }).catch(e => {
        console.log(e);
    })
});