/* jshint devel: true */
/* global alert, chrome, HideList */

function RedditPageHideListExtension() {
    var that = this;
    this.isUpdatingDocument = 0;

    /*
     * Initially we don't want beginUpdatingDocument and
     * endUpdatingDocument to start mutationObservers just yet.
     */
    this.allowMutationObserver = false;

    this.hideList = new HideList();
    var success = function (authors) {
        that.beginUpdatingDocument();
        try {
            that.updateAllHideShowLinks();
            authors.forEach(function (author) {
                that.hideCommentsByAuthor(author);
            });
        } finally {
            that.endUpdatingDocument();
        }
    };
    var error = function (lastError) {
        alert(lastError.message || "unknown error sorry");
        that.updateAllHideShowLinks();
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

RedditPageHideListExtension.prototype.getCommentsByAuthor = function (author) {
    return this.getAllComments().filter(function (comment) {
        return author === comment.getAttribute("data-author");
    });
};

RedditPageHideListExtension.prototype.hideCommentsByAuthor = function (author) {
    this.beginUpdatingDocument();
    try {
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
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.showCommentsByAuthor = function (author) {
    this.beginUpdatingDocument();
    try {
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
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.updateAllHideShowLinks = function () {
    this.beginUpdatingDocument();
    try {
        var that = this;
        var comments = this.getAllComments();
        comments.forEach(function (comment) {
            that.updateOrCreateHideShowLink(comment);
        });
    } finally {
        this.endUpdatingDocument();
    }
};

RedditPageHideListExtension.prototype.startMutationObserver = function () {
    var that = this;
    var commentArea = document.querySelector(".commentarea");
    var config;
    if (this.allowMutationObserver) {
        if (commentArea) {
            if (!this.mutationObserver) {
                this.mutationObserver = new MutationObserver(function (mutationRecords, observer) {
                    console.log(that.isUpdatingDocument);
                    if (!that.isUpdatingDocument) {
                        console.log("MutationObserver event", mutationRecords, observer);
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
    var that = this;
    chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (!that.hideList.isUpdatingStorage) {
            console.log("chrome.storage.onChanged event", changes, areaName);
        }
    });
};

var extension = new RedditPageHideListExtension();
