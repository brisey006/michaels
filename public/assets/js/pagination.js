const pD = JSON.parse(document.getElementById('paginationData').value);
const paginateUrl = document.getElementById('paginateUrl').value;
const paginate = document.getElementById('paginate');

(() => {
    const li = document.createElement('li');
    li.className = "page-item";
    let furl = paginateUrl.replace('toBeReplaced', pD.prevPage);
    li.innerHTML = `
        <a class="page-link" href="${pD.hasPrevPage? furl : '#'}" aria-label="Previous">
            <span aria-hidden="true">«</span>
            <span class="sr-only">Previous</span>
        </a>
    `;
    paginate.appendChild(li);
})();

//First
const fli = document.createElement('li');
fli.className = "page-item";
let url = paginateUrl.replace('toBeReplaced', 1);
fli.innerHTML = `
    <a class="page-link" href="${url}" aria-label="First">
        <span aria-hidden="true">First</span>
        <span class="sr-only">First</span>
    </a>
`;
paginate.appendChild(fli);

const pages = [];
const page = pD.page;

if (page > 0 && page <= pD.totalPages) {
    for(let i = page - 5; i < page; i++) {
        if (i > 0) {
            pages.push(i);
        }
    }
    for(let i = page; i < page + 5; i++) {
        if (i <= pD.totalPages) {
            pages.push(i);
        }
    }
}

for (let i = 0; i < pages.length; i++) {
    const li = document.createElement('li');
    if (page == pages[i]) {
        li.className = "page-item active";
    } else {
        li.className = "page-item";
    }
    let url = paginateUrl.replace('toBeReplaced', pages[i]);
    li.innerHTML = `<li class="page-item"><a class="page-link" href="${url}">${pages[i]}</a></li>`;
    paginate.appendChild(li);
}

//Last
const lli = document.createElement('li');
lli.className = "page-item";
let lurl = paginateUrl.replace('toBeReplaced', pD.totalPages);
lli.innerHTML = `
    <a class="page-link" href="${lurl}" aria-label="Last">
        <span aria-hidden="true">Last</span>
        <span class="sr-only">Last</span>
    </a>
`;
paginate.appendChild(lli);

(() => {
    const li = document.createElement('li');
    li.className = "page-item";
    let url = paginateUrl.replace('toBeReplaced', pD.nextPage);
    li.innerHTML = `
        <a class="page-link" href="${pD.hasNextPage ? url : '#'}" aria-label="Next">
            <span aria-hidden="true">»</span>
            <span class="sr-only">Next</span>
        </a>
    `;
    paginate.appendChild(li);
})();