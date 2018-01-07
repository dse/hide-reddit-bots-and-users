/* global alert, chrome */

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
    return result;
};

HideList.prototype.setAuthorIsHiddenFlag = function (author, successCallback, errorCallback) {
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

function HideListExtension() {
    var that = this;
    this.hideList = new HideList();
    var success = function (authors) {
        that.updateAllHideShowLinks();
        authors.forEach(function (author) {
            that.hideCommentsByAuthor(author);
        });
    };
    var error = function (lastError) {
        alert(lastError.message || "unknown error sorry");
        that.updateAllHideShowLinks();
    };
    this.hideList.initialize(success, error);
}

HideListExtension.prototype.getAllComments = function () {
    return Array.from(document.querySelectorAll(".commentarea .nestedlisting .comment"));
};

HideListExtension.prototype.getCommentsByAuthor = function (author) {
    return this.getAllComments().filter(function (comment) {
        return author === comment.getAttribute("data-author");
    });
};

HideListExtension.prototype.hideCommentsByAuthor = function (author) {
    var that = this;
    var success = function () {
        var comments = that.getCommentsByAuthor(author);
        comments.forEach(function (comment) {
            var text = comment.querySelector(":scope > .entry > .usertext");
            if (text) {
                text.classList.add("hrbau--hidden");
            }
            that.updateOrCreateHideShowLink(comment);
        });
    };
    var error = function (lastError) {
        alert(lastError.string || "unknown error sorry");
    };
    this.hideList.setAuthorIsHiddenFlag(author, success, error);
};

HideListExtension.prototype.showCommentsByAuthor = function (author) {
    var that = this;
    var success = function () {
        var comments = that.getCommentsByAuthor(author);
        comments.forEach(function (comment) {
            var text = comment.querySelector(":scope > .entry > .usertext");
            if (text) {
                text.classList.remove("hrbau--hidden");
            }
            that.updateOrCreateHideShowLink(comment);
        });
    };
    var error = function (lastError) {
        alert(lastError.string || "unknown error sorry");
    };
    this.hideList.clearAuthorIsHiddenFlag(author, success, error);
};

HideListExtension.prototype.updateHideShowLink = function (link) {
    var author = link.getAttribute("data-author");
    while (link.hasChildNodes()) {
        link.removeChild(link.firstChild);
    }
    if (this.hideList.authorIsHidden(author)) {
        link.appendChild(document.createTextNode("show author"));
    } else {
        link.appendChild(document.createTextNode("hide author"));
    }
};

HideListExtension.prototype.updateOrCreateHideShowLink = function (comment) {
    var that = this;
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
            if (that.hideList.authorIsHidden(author)) {
                that.showCommentsByAuthor(author);
            } else {
                that.hideCommentsByAuthor(author);
            }
        }, false);
        listItem.appendChild(link);
    }
    this.updateHideShowLink(link);
    return link;
};

HideListExtension.prototype.updateAllHideShowLinks = function () {
    var that = this;
    var comments = this.getAllComments();
    comments.forEach(function (comment) {
        that.updateOrCreateHideShowLink(comment);
    });
};

var hideListExtension = new HideListExtension();
