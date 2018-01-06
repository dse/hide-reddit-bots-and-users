var flags = {};
function authorIsHidden(author) {
    var result = flags.hasOwnProperty(author) ? flags[author] : false;
    console.log("authorIsHidden", author, "=>", result);
    return result;
}

function setAuthorIsHiddenFlag(author) {
    console.log("setAuthorIsHiddenFlag", author);
    flags[author] = true;
}

function clearAuthorIsHiddenFlag(author) {
    console.log("clearAuthorIsHiddenFlag", author);
    delete flags[author];
}

function getAllComments() {
    return Array.from(document.querySelectorAll(".commentarea .nestedlisting .comment"));
}

function getCommentsByAuthor(author) {
    return getAllComments().filter(function (comment) {
        return author === comment.getAttribute("data-author");
    });
}

function hideCommentsByAuthor(author) {
    setAuthorIsHiddenFlag(author);
    var comments = getCommentsByAuthor(author);
    comments.forEach(function (comment) {
        var text = comment.querySelector(":scope > .entry > .usertext");
        if (text) {
            text.classList.add("hrbau--hidden");
        }
        updateOrCreateHideShowLink(comment);
    });
}

function showCommentsByAuthor(author) {
    clearAuthorIsHiddenFlag(author);
    var comments = getCommentsByAuthor(author);
    comments.forEach(function (comment) {
        var text = comment.querySelector(":scope > .entry > .usertext");
        if (text) {
            text.classList.remove("hrbau--hidden");
        }
        updateOrCreateHideShowLink(comment);
    });
}

function updateHideShowLink(link) {
    var author = link.getAttribute("data-author");
    while (link.hasChildNodes()) {
        link.removeChild(link.firstChild);
    }
    console.log("empty");
    if (authorIsHidden(author)) {
        console.log("add text show");
        link.appendChild(document.createTextNode("show author"));
    } else {
        console.log("add text hide");
        link.appendChild(document.createTextNode("hide author"));
    }
}

function updateOrCreateHideShowLink(comment) {
    var buttonsList = comment.querySelector(":scope > .entry > ul.buttons");
    if (!buttonsList) { return; }
    var listItem = buttonsList.querySelector(":scope > li.hide-show-button");
    if (!listItem) {
        listItem = document.createElement("li");
        listItem.className = "hide-show-button";
        buttonsList.appendChild(listItem);
    }
    var author = comment.getAttribute("data-author");
    var link = listItem.querySelector(":scope > a.hide-show-link");
    if (!link) {
        link = document.createElement("a");
        link.className = "hide-show-link";
        /* jshint -W107 */
        link.href = "javascript:void(0);";
        /* jshint +W107 */
        link.setAttribute("data-author", author);
        link.addEventListener("click", function (event) {
            if (authorIsHidden(author)) {
                showCommentsByAuthor(author);
            } else {
                hideCommentsByAuthor(author);
            }
        }, false);
        listItem.appendChild(link);
    }
    updateHideShowLink(link);
    return link;
}

function updateAllHideShowLinks() {
    var comments = getAllComments();
    comments.forEach(function (comment) {
        updateOrCreateHideShowLink(comment);
    });
}

updateAllHideShowLinks();
