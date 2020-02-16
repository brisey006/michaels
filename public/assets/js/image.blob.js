const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

const getBlob = (data) => {
    const canvas = document.getElementById('myCanvas'),
            context = canvas.getContext('2d');
        const image = new Image();

        canvas.width = data.width;
        canvas.height = data.height;
        const loadedImg = document.getElementById('imgr');
        image.src = loadedImg.src;

        context.drawImage(image, data.x, data.y, data.width, data.height, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');

        var base64ImageContent = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
        return b64toBlob(base64ImageContent, 'image/jpeg');
}