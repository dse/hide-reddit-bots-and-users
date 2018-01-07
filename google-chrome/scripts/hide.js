function HideList() {
    this.flags = {};
}
HideList.prototype.initialize = function (successCallback, errorCallback) {
    var that = this;
    chrome.storage.sync.get("hideList", function (items) {
        if (chrome.runtime.lastError) {
            if (errorCallback) {
                errorCallback(chrome.runtime.lastError);
            }
        } else {
            var hideList = items.hideList;
            var authors = hideList ? hideList.split(",") : [];
            authors = authors.filter(function (author) {
                return author !== "";
            });
            authors.forEach(function (author) {
                that.flags[author] = true;
            });
            if (successCallback) {
                successCallback(authors);
            }
        }
    });
};
HideList.prototype.authorIsHidden = function (author) {
    var result = this.flags.hasOwnProperty(author) ? this.flags[author] : false;
    console.log("authorIsHidden", author, "=>", result);
    return result;
};
HideList.prototype.setAuthorIsHiddenFlag = function (author, successCallback, errorCallback) {
    console.log("setAuthorIsHiddenFlag", author);
    this.flags[author] = true;
    chrome.storage.sync.set({ "hideList": Object.keys(this.flags).join(",") },
                            function () {
                                if (chrome.runtime.lastError) {
                                    if (errorCallback) {
                                        errorCallback(chrome.runtime.lastError);
                                    }
                                } else {
                                    if (successCallback) {
                                        successCallback();
                                    }
                                }
                            });
};
HideList.prototype.clearAuthorIsHiddenFlag = function (author, successCallback, errorCallback) {
    console.log("clearAuthorIsHiddenFlag", author);
    delete this.flags[author];
    chrome.storage.sync.set({ "hideList": Object.keys(this.flags).join(",") },
                            function () {
                                if (chrome.runtime.lastError) {
                                    if (errorCallback) {
                                        errorCallback(chrome.runtime.lastError);
                                    }
                                } else {
                                    if (successCallback) {
                                        successCallback();
                                    }
                                }
                            });
};

var hideList = new HideList();

function getAllComments() {
    return Array.from(document.querySelectorAll(".commentarea .nestedlisting .comment"));
}

function getCommentsByAuthor(author) {
    return getAllComments().filter(function (comment) {
        return author === comment.getAttribute("data-author");
    });
}

function hideCommentsByAuthor(author) {
    var success = function () {
        var comments = getCommentsByAuthor(author);
        comments.forEach(function (comment) {
            var text = comment.querySelector(":scope > .entry > .usertext");
            if (text) {
                text.classList.add("hrbau--hidden");
            }
            updateOrCreateHideShowLink(comment);
        });
    };
    var error = function (lastError) {
        alert(lastError.string || "unknown error sorry");
    };
    hideList.setAuthorIsHiddenFlag(author, success, error);
}

function showCommentsByAuthor(author) {
    var success = function () {
        var comments = getCommentsByAuthor(author);
        comments.forEach(function (comment) {
            var text = comment.querySelector(":scope > .entry > .usertext");
            if (text) {
                text.classList.remove("hrbau--hidden");
            }
            updateOrCreateHideShowLink(comment);
        });
    };
    var error = function (lastError) {
        alert(lastError.string || "unknown error sorry");
    };
    hideList.clearAuthorIsHiddenFlag(author, success, error);
}

function updateHideShowLink(link) {
    var author = link.getAttribute("data-author");
    while (link.hasChildNodes()) {
        link.removeChild(link.firstChild);
    }
    console.log("empty");
    if (hideList.authorIsHidden(author)) {
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
            if (hideList.authorIsHidden(author)) {
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

var success = function (authors) {
    updateAllHideShowLinks();
    authors.forEach(function (author) {
        hideCommentsByAuthor(author);
    });
};
var error = function (lastError) {
    alert(lastError.message || "unknown error sorry");
    updateAllHideShowLinks();
};
hideList.initialize(success, error);
