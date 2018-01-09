/*jshint esversion: 6 */
/*global chrome */

function HideList() {
    this.flags = {};
    this.isUpdatingStorage = 0;
}

HideList.prototype.initialize = function (successCallback, errorCallback) {
    chrome.storage.sync.get("hideList", (items) => {
        if (chrome.runtime.lastError) {
            if (errorCallback) {
                errorCallback(chrome.runtime.lastError);
            }
        } else {
            var hideList = items.hideList;
            var authors = hideList ? hideList.split(",") : [];
            authors = authors.filter((author) => {
                return author !== "";
            });
            authors.forEach((author) => {
                this.flags[author] = true;
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
    this.isUpdatingStorage += 1;
    chrome.storage.sync.set(
        { "hideList": Object.keys(this.flags).join(",") },
        () => {
            try {
                if (chrome.runtime.lastError) {
                    if (errorCallback) {
                        errorCallback(chrome.runtime.lastError);
                    }
                } else {
                    if (successCallback) {
                        successCallback();
                    }
                }
            } finally {
                this.isUpdatingStorage -= 1;
            }
        }
    );
};

HideList.prototype.clearAuthorIsHiddenFlag = function (author, successCallback, errorCallback) {
    delete this.flags[author];
    this.isUpdatingStorage += 1;
    chrome.storage.sync.set(
        { "hideList": Object.keys(this.flags).join(",") },
        () => {
            try {
                if (chrome.runtime.lastError) {
                    if (errorCallback) {
                        errorCallback(chrome.runtime.lastError);
                    }
                } else {
                    if (successCallback) {
                        successCallback();
                    }
                }
            } finally {
                this.isUpdatingStorage -= 1;
            }
        }
    );
};

HideList.prototype.clearAll = function (successCallback, errorCallback) {
    this.flags = {};
    this.isUpdatingStorage += 1;
    chrome.storage.sync.set(
        { "hideList": "" },
        () => {
            try {
                if (chrome.runtime.lastError) {
                    if (errorCallback) {
                        errorCallback(chrome.runtime.lastError);
                    }
                } else {
                    if (successCallback) {
                        successCallback();
                    }
                }
            } finally {
                this.isUpdatingStorage -= 1;
            }
        }
    );
};
