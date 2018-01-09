/* jshint devel: true, esversion: 6 */
/* global alert, chrome, HideList */

function RedditPageHideListExtension() {
    this.isUpdatingDocument = 0;

    /*
     * Initially we don't want beginUpdatingDocument and
     * endUpdatingDocument to start mutationObservers just yet.
     */
    this.allowMutationObserver = false;

    this.hideList = new HideList();
    var success = (authors) => {
        this.beginUpdatingDocument();
        try {
            this.updateAllHideShowLinks();
            authors.forEach((author) => {
                this.hideCommentsByAuthor(author);
            });
        } finally {
            this.endUpdatingDocument();
        }
    };
    var error = (lastError) => {
        alert(lastError.message || "unknown error sorry");
        this.updateAllHideShowLinks();
    };
    this.hideList.initialize(success, error);

    this.allowMutationObserver = true;
    this.startMutationObserver();
    this.setupStorageListener();
}

RedditPageHideListExtension.prototype.beginUpdatingDocument = function () {
    this.isUpdatingDocument += 1;
    if (this.isUpdatingDocument >= 1) {
        this.stopMutationObserver();
    }
};

RedditPageHideListExtension.prototype.endUpdatingDocument = function () {
    if (this.isUpdatingDocument >= 1) {
        this.isUpdatingDocument -= 1;
    }
    if (this.isUpdatingDocument < 1) {
        this.startMutationObserver();
    }
};

RedditPageHideListExtension.prototype.getAllComments = function () {
    return Array.from(document.querySelectorAll(".commentarea .nestedlisting .comment"));
};

RedditPageHideListExtension.prototype.getAllCommentIDs = function () {
    return this.getAllComments().map((comment) => {
        return comment.getAttribute("data-fullname");
    }).filter((fullname) => {
        return fullname !== null && fullname !== undefined && fullname !== "";
    });
};

RedditPageHideListExtension.prototype.getCommentsByAuthor = function (author) {
    return this.getAllComments().filter((comment) => {
        return author === comment.getAttribute("data-author");
    });
};

RedditPageHideListExtension.prototype.hideCommentsByAuthor = function (author) {
    this.beginUpdatingDocument();
    try {
        var success = () => {
            var comments = this.getCommentsByAuthor(author);
            comments.forEach((comment) => {
                var text = comment.querySelector(":scope > .entry > .usertext");
                if (text) {
                    text.classList.add("hrbau--hidden");
                }
                this.updateOrCreateHideShowLink(comment);
            });
        };
        var error = (lastError) => {
            alert(lastError.string || "unknown error sorry");
        };
        this.hideList.setAuthorIsHiddenFlag(author, success, error);
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.showCommentsByAuthor = function (author) {
    this.beginUpdatingDocument();
    try {
        var success = () => {
            var comments = this.getCommentsByAuthor(author);
            comments.forEach((comment) => {
                var text = comment.querySelector(":scope > .entry > .usertext");
                if (text) {
                    text.classList.remove("hrbau--hidden");
                }
                this.updateOrCreateHideShowLink(comment);
            });
        };
        var error = (lastError) => {
            alert(lastError.string || "unknown error sorry");
        };
        this.hideList.clearAuthorIsHiddenFlag(author, success, error);
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.updateHideShowLink = function (link) {
    this.beginUpdatingDocument();
    try {
        var author = link.getAttribute("data-author");
        while (link.hasChildNodes()) {
            link.removeChild(link.firstChild);
        }
        if (this.hideList.authorIsHidden(author)) {
            link.appendChild(document.createTextNode("show author"));
        } else {
            link.appendChild(document.createTextNode("hide author"));
        }
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.updateOrCreateHideShowLink = function (comment) {
    this.beginUpdatingDocument();
    try {
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
            link.addEventListener("click", (event) => {
                if (this.hideList.authorIsHidden(author)) {
                    this.showCommentsByAuthor(author);
                } else {
                    this.hideCommentsByAuthor(author);
                }
            }, false);
            listItem.appendChild(link);
        }
        this.updateHideShowLink(link);
        return link;
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.updateAllHideShowLinks = function () {
    this.beginUpdatingDocument();
    try {
        var comments = this.getAllComments();
        comments.forEach((comment) => {
            this.updateOrCreateHideShowLink(comment);
        });
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.onMutation = function (mutationRecords, observer) {
    var commentIDs = this.getAllCommentIDs().join(",");
    this.updateAllHideShowLinks();
    if (!this.cachedCommentIDs || this.commentIDs !== this.cachedCommentIDs) {
        console.log(commentIDs);
        this.updateAllHideShowLinks();
    }
    this.cachedCommentIDs = commentIDs;
};

RedditPageHideListExtension.prototype.startMutationObserver = function () {
    var commentArea = document.querySelector(".commentarea");
    var config;
    if (this.allowMutationObserver) {
        if (commentArea) {
            if (!this.mutationObserver) {
                this.mutationObserver = new MutationObserver((mutationRecords, observer) => {
                    console.log(this.isUpdatingDocument);
                    if (!this.isUpdatingDocument) {
                        this.onMutation(mutationRecords, observer);
                    }
                });
                config = {
                    childList: true,
                    subtree: true
                };
                this.mutationObserver.observe(commentArea, config);
            }
        }
    } else {
        this.stopMutationObserver();
    }
};

RedditPageHideListExtension.prototype.stopMutationObserver = function () {
    if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        delete this.mutationObserver;
    }
};

RedditPageHideListExtension.prototype.setupStorageListener = function () {
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (!this.hideList.isUpdatingStorage) {
            console.log("chrome.storage.onChanged event", changes, areaName);
        }
    });
};

var extension = new RedditPageHideListExtension();
