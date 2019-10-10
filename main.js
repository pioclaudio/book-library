let myLibrary = {};

function Book() {
    this.title = "";
    this.author = "";
    this.isbn = "";
    this.read = false;
    this.imgURL = "";
}

function Book(title, author, isbn, read, imgURL = "") {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.read = read;
    this.imgURL = imgURL;
}


function addBookToLibrary(book) {
    myLibrary[book.isbn] = book;
    clearForm();
    render();
}

function removeBookFromLibrary(isbn) {
    delete myLibrary[isbn];
    render();
}

function render() {
    let bookContainer = document.querySelector(".card-deck");
    while (bookContainer.firstChild) {
        bookContainer.removeChild(bookContainer.firstChild);
    }

    for (book in myLibrary) {
        createCard(bookContainer, myLibrary[book])
    }
}

function createCard(parent, bookInfo) {
    let card = document.createElement("div");
    card.classList.add("card", "shadow");

    let xdiv = document.createElement("div");
    xdiv.classList.add("float-right");
    let xbutton = document.createElement("button");
    xbutton.setAttribute("type", "button");
    xbutton.setAttribute("data-toggle", "modal");
    xbutton.setAttribute("data-target", "#removeBookModal");
    xbutton.setAttribute("data-isbn", bookInfo.isbn);
    xbutton.classList.add("close");
    xdiv.appendChild(xbutton);
    let xspan = document.createElement("span");
    xspan.innerHTML = "&times;"
    xbutton.appendChild(xspan);
    card.appendChild(xdiv);

    let cardimgdiv = document.createElement("div");
    cardimgdiv.classList.add("card-img-div");
    let cardimg = document.createElement("img");
    cardimg.classList.add("card-img-top");
    cardimg.setAttribute("src", bookInfo.imgURL);
    cardimgdiv.appendChild(cardimg);
    card.appendChild(cardimgdiv);

    let cardbody = document.createElement("div");
    cardbody.classList.add("card-body");

    let cardtitle = document.createElement("h5");
    cardtitle.classList.add("card-title")
    cardtitle.innerHTML = bookInfo.title;
    cardbody.appendChild(cardtitle);

    let cardtext = document.createElement("p");
    cardtext.classList.add("card-text");
    cardtext.innerText = bookInfo.author;
    cardbody.appendChild(cardtext);
    let cardtext2 = document.createElement("p");
    cardtext2.classList.add("card-text");
    cardtext2.innerText = "ISBN: " + bookInfo.isbn;
    cardbody.appendChild(cardtext2);

    card.appendChild(cardbody);
    parent.appendChild(card);
}

function load(data) {
    data.forEach(element => {
        myLibrary[element.isbn] = new Book(element.title, element.author, element.isbn, element.read, "img/" + element.isbn + ".jpg");
    });
    render();
}


$('#removeBookModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var isbn = button.data('isbn');
    var modal = $(this);
    modal.find('.card-img-top').attr("src", myLibrary[isbn].imgURL);
    modal.find('.card-title').text(myLibrary[isbn].title);
    modal.find('.card-text').text(myLibrary[isbn].author);
    modal.find('.card-body').attr("data-isbn", isbn);
})

function clearForm() {
    document.querySelector('#drop-zone').innerHTML = "Drop book image here";
    document.querySelector('#formBookTitle').value = "";
    document.querySelector('#formBookAuthor').value = "";
    document.querySelector('#formBookIsbn').value = "";
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;

    for (let i = 0, f; f = files[i]; i++) {
        if (!f.type.match('image.*')) {
            continue;
        }
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                var span = document.createElement('span');
                span.innerHTML = ['<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'].join('');
                let dropZone = document.getElementById('drop-zone');
                dropZone.innerHTML = "";
                dropZone.insertBefore(span, null);
            };
        })(f);
        reader.readAsDataURL(f);
    }
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

window.onload = (event) => {
    fetch('./bookinfo.json')
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log('Error Status Code: ' + response.status);
                    return;
                }
                response.json().then(function (data) {
                    load(data);
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });


    let removeButton = document.querySelector("#remove-button");
    removeButton.onclick = (e) => {
        let modal = document.querySelector('#removeBookModal');
        let isbn = modal.querySelector('.card-body').getAttribute('data-isbn')
        removeBookFromLibrary(isbn);
        $('#removeBookModal').modal('toggle')
    }

    let dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    let addButton = document.querySelector("#add-button");
    addButton.onclick = (e) => {
        //TODO form validator
        let modal = document.querySelector('#addBookModal');

        let title = modal.querySelector('#formBookTitle').value;
        let author = modal.querySelector('#formBookAuthor').value;
        let isbn = modal.querySelector('#formBookIsbn').value;
        let imgURL = modal.querySelector(".thumb").src;
        let read = false;
        let book = new Book(title, author, isbn, read, imgURL);

        addBookToLibrary(book);
        $('#addBookModal').modal('toggle')
    }
}