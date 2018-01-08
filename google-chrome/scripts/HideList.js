/*global chrome */

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
    chrome.storage.sync.set(
        { "hideList": Object.keys(this.flags).join(",") },
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
        }
    );
};

HideList.prototype.clearAuthorIsHiddenFlag = function (author, successCallback, errorCallback) {
    delete this.flags[author];
    chrome.storage.sync.set(
        { "hideList": Object.keys(this.flags).join(",") },
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
        }
    );
};
