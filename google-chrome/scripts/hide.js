/* jshint devel: true */
/* global alert, chrome, HideList */

function RedditPageHideListExtension() {
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
    this.setupMutationObserver();
    this.setupStorageListener();
}

RedditPageHideListExtension.prototype.getAllComments = function () {
    return Array.from(document.querySelectorAll(".commentarea .nestedlisting .comment"));
};

RedditPageHideListExtension.prototype.getCommentsByAuthor = function (author) {
    return this.getAllComments().filter(function (comment) {
        return author === comment.getAttribute("data-author");
    });
};

RedditPageHideListExtension.prototype.hideCommentsByAuthor = function (author) {
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

RedditPageHideListExtension.prototype.showCommentsByAuthor = function (author) {
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

RedditPageHideListExtension.prototype.updateHideShowLink = function (link) {
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

RedditPageHideListExtension.prototype.updateOrCreateHideShowLink = function (comment) {
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

RedditPageHideListExtension.prototype.updateAllHideShowLinks = function () {
    var that = this;
    var comments = this.getAllComments();
    comments.forEach(function (comment) {
        that.updateOrCreateHideShowLink(comment);
    });
};

RedditPageHideListExtension.prototype.setupMutationObserver = function () {
    var commentArea = document.querySelector(".commentarea");
    var observer;
    var config;
    if (commentArea) {
        observer = new MutationObserver(function (mutationRecords, observer) {
            console.log("MutationObserver event", mutationRecords, observer);
        });
        config = {
            childList: true,
            subtree: true
        };
        observer.observe(commentArea, config);
    }
};

RedditPageHideListExtension.prototype.setupStorageListener = function () {
    chrome.storage.onChanged.addListener(function (changes, areaName) {
        console.log("chrome.storage.onChanged event", changes, areaName);
    });
};

var extension = new RedditPageHideListExtension();
