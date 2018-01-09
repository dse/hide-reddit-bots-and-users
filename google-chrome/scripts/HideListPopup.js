/*jshint devel: true, esversion: 6 */
/*global chrome, HideList */

function HideListPopup() {
    this.hideList = new HideList();
    var complete = () => {
        this.updateList();
    };
    var success = (authors) => {
        document.addEventListener("click", (event) => {
            if (event.target.classList.contains("clear-hide-list")) {
                if (confirm("Are you sure?")) {
                    this.clearAll();
                }
            }
        });
        complete();
    };
    var error = (lastError) => {
        alert(lastError.message || "unknown error sorry");
        complete();
    };
    this.hideList.initialize(success, error);
}

HideListPopup.prototype.updateList = function () {
    var ul = document.querySelector("ul.hide-list");
    if (!ul) {
        return;
    }
    while (ul.hasChildNodes()) {
        ul.removeChild(ul.firstChild);
    }
    var members = this.hideList.getMembers();
    if (members.length) {
        document.querySelectorAll(".you-have-no-users").forEach((element) => {
            element.style.display = "none";
        });
        document.querySelectorAll(".you-have-users").forEach((element) => {
            element.style.display = "block";
        });
        members.forEach((member) => {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(member));
            ul.appendChild(li);
        });
    } else {
        document.querySelectorAll(".you-have-no-users").forEach((element) => {
            element.style.display = "block";
        });
        document.querySelectorAll(".you-have-users").forEach((element) => {
            element.style.display = "none";
        });
    }
};

HideListPopup.prototype.clearAll = function () {
    this.hideList.clearAll();
    this.updateList();
};

var popup = new HideListPopup();
