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
            var authors = this.updateFromStorageValue(hideList);
            if (successCallback) {
                successCallback(authors);
            }
        }
    });
};

HideList.prototype.updateFromStorageValue = function (value) {
    var authors = (value !== null &&
                   value !== undefined &&
                   value !== "") ? value.split(",") : [];
    authors = authors.filter((author) => {
        return author !== "";
    });
    this.flags = {};
    authors.forEach((author) => {
        this.flags[author] = true;
    });
    return authors;
};

HideList.prototype.getMembers = function () {
    var result = Object.keys(this.flags);
    var sortOptions = {
        "sensitivity": "base",
        "numeric": true
    };

    // schwartzian transform
    result = result.map((member) => {
        return [member, member.toLowerCase()];
    });
    result.sort((a, b) => {
        return a[1].localeCompare(b[1], sortOptions);
    });
    result = result.map((member) => {
        return member[0];
    });

    return result;
};

HideList.prototype.authorIsHidden = function (author) {
    var result = this.flags.hasOwnProperty(author) ? this.flags[author] : false;
    return result;
};

HideList.prototype.updateStorage = function (successCallback, errorCallback) {
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

HideList.prototype.setAuthorIsHiddenFlag = function (author, successCallback, errorCallback) {
    this.flags[author] = true;
    this.updateStorage(successCallback, errorCallback);
};

HideList.prototype.clearAuthorIsHiddenFlag = function (author, successCallback, errorCallback) {
    delete this.flags[author];
    this.updateStorage(successCallback, errorCallback);
};

HideList.prototype.clearAll = function (successCallback, errorCallback) {
    this.flags = {};
    this.updateStorage(successCallback, errorCallback);
};
