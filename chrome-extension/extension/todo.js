globalCode();
function websiteCode() {
    if (chrome && chrome.webstore && chrome.webstore.install) {
        var chromeExtensionDiv = document.querySelector(".chrome-extension");
        chromeExtensionDiv.classList.add("visible");
        var svg = chromeExtensionDiv.querySelector(" svg");
        svg.addEventListener("click", function() {
            var extLink = "https://chrome.google.com/webstore/detail/jnibmbpjkpfgaefgbnaneldfbfecpjih";
            chrome.webstore.install(extLink, function(suc) {
                console.log(suc);
            }, function(err) {
                console.log(err);
            });
        });
    }
}
function addLocalItems() {
    window.items = JSON.parse(localStorage.getItem("items"));
    if (items == null) items = [];
    var todos = document.querySelector(".todos");
    todos.innerHTML = "";
    addItems();
}
function globalCode() {
    var todos = document.querySelector(".todos");
    var itemCount = 0;
    (function dialogs() {
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("dialog-container")) {
                e.target.classList.remove("visible");
            }
        });
    })();
    function removeItem(id) {
        items.splice(id, 1);
        var textarea = document.querySelector('textarea[data-id="'+id+'"]');
        textarea.removeAttribute("data-id");
        var divItem = textarea.parentElement;
        divItem.classList.add("removed");
        divItem.style.height = "0px";
        var textareas = document.querySelectorAll("textarea");
        for (var i = 0; i < textareas.length; i++) {
            if (textareas[i].dataset.id > id) {
                textareas[i].dataset.id = textareas[i].dataset.id - 1;
            }
        }
        save();
    }
    function resizeTextarea(id) {
        var textarea = document.querySelector('textarea[data-id="'+id+'"]');
        textarea.style.height = "auto";
        textarea.parentElement.style.height = "auto";
        var newHeight = textarea.scrollHeight;
        var cs = window.getComputedStyle(textarea); // cs == computedStyles
        var padding = Number(cs.paddingTop.slice(0, -2)) + Number(cs.paddingBottom.slice(0, -2));
        textarea.style.height = newHeight - padding+"px";
        textarea.parentElement.style.height = newHeight+"px";
    }
    window.resizeTextareas = function() {
        var textareas = document.querySelectorAll("textarea");
        for (var i = 0; i < textareas.length-1; i++) {
            resizeTextarea(i);
        }
    }
    window.addEventListener("resize", resizeTextareas);

    var itemsToSave = [];
    document.addEventListener("input", function(e) {
        var textarea = e.target;
        var itemDiv = textarea.parentElement;
        if (itemDiv.classList.contains("item")) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight - 16+"px";
            resizeTextarea(textarea.dataset.id);
            if (itemDiv.classList.contains("new-item")) {
                itemDiv.classList.remove("new-item");
                var checkmark = itemDiv.querySelector(".checkmark-placeholder");
                checkmark.classList.remove("checkmark-placeholder");
                checkmark.classList.add("checkmark");
                itemDiv.querySelector("textarea").setAttribute("data-id", items.length);
                itemDiv.querySelector(".sort-icon").classList.remove("hidden");
                items[items.length] = textarea.value;
                addNewItem();
                save();
            } else {
                items[textarea.dataset.id] = textarea.value;
                save();
            }
        }
    });
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("checkmark")) {
            removeItem(e.target.nextElementSibling.dataset.id);
        }
    });

    function moveIndex(array, iFrom, iTo) {
        if (iFrom == iTo) return array;
        var arr = array.slice();
        var fromValue = arr[iFrom];
        arr.splice(iFrom, 1);
        if      (iFrom < iTo) arr.splice(iTo, 0, fromValue);
        else if (iFrom > iTo) arr.splice(iTo, 0, fromValue);
        return arr;
    }
    // sort
    var mouseDown, mousePosY, mousePosStartY, currentItem, moveCount;
    document.addEventListener("mousedown", function(e) {
        moveCount = 0;
        if (e.button == 0 && e.target.classList.contains("checkmark")) {
            e.preventDefault();
        }
        if (e.button == 0 && e.target.classList.contains("sort-icon")) {
            e.preventDefault();
            mouseDown = true;
            mousePosY = e.clientY;
            mousePosStartY = mousePosY;
            currentItem = e.target.parentElement;
            currentItem.classList.add("rearranging");
        }
    });
    document.addEventListener("mousemove", function(e) {
        if (mouseDown) {
            mousePosY = e.clientY;
            var difference = mousePosY - mousePosStartY;

            var itemDivs = document.querySelectorAll(".todos .item:not(.removed)");
            for (var i = 0; i < itemDivs.length; i++) {
                itemDivs[i].style.transform = "translateY(0px)";
            }
            var reverse = difference < 0 ? true : false;
            var remainding = difference;
            moveCount = 0;
            function moveOtherItems(item, reverse, moveEnd = false, end = false) {
                var next = item.nextElementSibling;
                if (reverse) next = item.previousElementSibling;
                if (next == null || next.classList.contains("new-item")) end = true;
                if (!end) {
                    if (moveEnd) next.style.transform = "translateY(0px)";
                    else {
                        if (!reverse && remainding > next.clientHeight/2) {
                            remainding -= next.clientHeight;
                            var height = -currentItem.clientHeight;
                            next.style.transform = "translateY("+height+"px)";
                            moveCount++;
                        } else if (reverse && remainding < -next.clientHeight/2) {
                            remainding += next.clientHeight;
                            var height = currentItem.clientHeight;
                            next.style.transform = "translateY("+height+"px)";
                            moveCount--;
                        } else {
                            moveEnd = true;
                            next.style.transform = "translateY(0px)";
                        }
                    }
                    moveOtherItems(next, reverse, moveEnd, end);
                }
            }
            moveOtherItems(currentItem, reverse);
            var toMoveUp = difference - remainding;
            currentItem.style.transform = "translateY("+toMoveUp+"px)";
        }
    });
    document.addEventListener("mouseup", function(e) {
        if (mouseDown) {
            mouseDown = false;
            currentItem.classList.remove("rearranging");

            var todos = document.querySelector(".todos");
            todos.classList.add("no-transition");
            var itemDivs = document.querySelectorAll(".todos .item:not(.removed)");
            var newPos;
            for (var i = 0; i < items.length; i++) {
                itemDivs[i].style.transform = "translateY(0px)";
                if (itemDivs[i] == currentItem) newPos = i + moveCount;
            }
            var oldPos = newPos - moveCount;
            items = moveIndex(items, oldPos, newPos);
            if (moveCount > 0) todos.insertBefore(currentItem, todos.children[newPos+1]);
            else if (moveCount < 0) todos.insertBefore(currentItem, todos.children[newPos]);
            setTimeout(function() {
                todos.classList.remove("no-transition");
            }, 10);
            if (moveCount != 0) {
                updateColIds();
                save();
            }
        }
    });
    function updateColIds() {
        var textareas = document.querySelectorAll(".todos .item:not(.new-item):not(.removed) textarea");
        for (var i = 0; i < items.length; i++) {
            textareas[i].setAttribute("data-id", i);
        }
    }
}
function addItems() {
    for (var i = 0; i < items.length; i++) {
        var itemDiv = document.createElement("DIV");
        itemDiv.classList.add("item");
        itemDiv.innerHTML =
        '<div class="checkmark"></div>'+
        '<textarea data-id="'+i+'" rows="1" placeholder="oshit where did the text go"></textarea>'+
        '<div class="sort-icon"></div>';
        itemDiv.querySelector("textarea").value = items[i];
        var todos = document.querySelector(".todos");
        todos.appendChild(itemDiv);
    }
    addNewItem();
}
function addNewItem() {
    var item = document.createElement("DIV");
    item.classList.add("item", "new-item");
    item.innerHTML =
    '<div class="checkmark-placeholder"></div>'+
    '<textarea rows="1" data-id="'+items.length+'" placeholder="Add a new one"></textarea>'+
    '<div class="sort-icon hidden"></div>';
    var todos = document.querySelector(".todos");
    todos.appendChild(item);
}

window.xhr = function(req, options) {
    // handle options passed as first argument
    if (options === undefined) {
        options = req;
        if (options.req) req = options.req;
        else if (options.json) req = JSON.stringify(options.json);
    }

    // init xhr
    if (!options.url) return "url required";
    if (!options.type) options.type = "POST";
    if (!options.contentType) options.contentType = "application/x-www-form-urlencoded";

    // initiate & send request
    var xhr = new XMLHttpRequest();
    xhr.open(options.type, options.url, true);
    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    if (options.auth) xhr.setRequestHeader("Authorization", options.auth);
    if (options.headers) {
        for (var i = 0; i < options.headers.length; i++) {
            xhr.setRequestHeader(options.headers[i][0], options.headers[i][1]);
        }
    }
    xhr.send(req);

    // handle response
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (String(this.status).startsWith(2)) {
                if (options.callback) options.callback(this.responseText, false);
                if (options.onSuccess) options.onSuccess(this.responseText, this.status);
            } else {
                if (options.callback) options.callback(this.responseText, this.status);
                if (options.onError) options.onError(this.responseText, this.status);
            }
        }
    };
}

function updateGistId(id) {
    localStorage.setItem("gistId", id);
    gistId = id;
}
function updateGistDate(date) {
    localStorage.setItem("gistDate", String(date));
    gistDate = date;
}
var personalAccessToken = localStorage.getItem("personalAccessToken");
var gistId = localStorage.getItem("gistId");
var gistDate = new Date(localStorage.getItem("gistDate"));
function getFilename(paToken) {
    return "taskler-"+paToken.slice(0,4)+".json";
}

// unsynced changes popup
var unsyncedChanges = false;
window.onbeforeunload = function() {
    if (unsyncedChanges) {
        return "Changes are not yet synced. Do you want to leave without syncing?";
    }
}
var saveTimer;
var syncIcon = document.querySelector(".sync svg");
function save(saveGist = true) {
    unsyncedChanges = true;
    localStorage.setItem("items", JSON.stringify(items));
    if (saveTimer) clearTimeout(saveTimer);
    if (saveGist && personalAccessToken) {
        console.log("Updating gist in 500ms...");
        saveTimer = setTimeout(function() {
            var saveFinished = false;
            var degs = 0;
            function rotate() {
                if (saveFinished) {
                    syncIcon.style.transition = "none";
                    syncIcon.style.transform = "rotate(0deg)";
                    setTimeout(function() {
                        syncIcon.style.transition = "";
                    }, 10);
                    clearInterval(savingAnimation);
                } else {
                    degs -= 180;
                    syncIcon.style.transform = "rotate("+degs+"deg)";
                }
            }
            rotate();
            var savingAnimation = setInterval(rotate, 1000);
            updateGist(personalAccessToken, gistId, function(id, updatedAt) {
                updateGistDate(updatedAt);
                console.log("Updated gist");
                saveFinished = true;
                unsyncedChanges = false;
            });
        }, 500);
    }
}

(function syncDialog() {
    var svg = document.querySelector(".sync svg");
    var dialog = document.querySelector(".sync-dialog");
    var personalAccessTokenInput = dialog.querySelector("input.personal-access-token");
    if (personalAccessToken) personalAccessTokenInput.value = personalAccessToken;
    svg.addEventListener("click", function() {
        dialog.classList.add("visible");
    });
    var saveButton = dialog.querySelector("button.save-personal-access-token");
    saveButton.addEventListener("click", function() {
        console.log("saving access token");
        // save personal access token
        personalAccessToken = personalAccessTokenInput.value;
        localStorage.setItem("personalAccessToken", personalAccessToken);
        gistId = null;
        gistDate = null;
        localStorage.removeItem("gistId");
        localStorage.removeItem("gistDate");
        dialog.classList.add("saving");
        reloadTasks(function() {
            dialog.classList.remove("saving");
            dialog.classList.remove("visible");
        });
    });
})();

reloadTasks();
function reloadTasks(callback) {
    if (personalAccessToken) {
        if (gistId) {
            findGist(personalAccessToken, gistId, function(content, updatedAt) {
                gistFound(content, updatedAt);
                if (callback) callback();
                resizeTextareas();
            });
        } else {
            findGistId(personalAccessToken, function(id) {
                if (id) {
                    gistId = id;
                    localStorage.setItem("gistId", gistId);
                    findGist(personalAccessToken, id, function(content, updatedAt) {
                        gistFound(content, updatedAt);
                        if (callback) callback();
                        resizeTextareas();
                    });
                } else {
                    createGist(personalAccessToken, function(id, updatedAt) {
                        updateGistId(id);
                        updateGistDate(id, updatedAt);
                        if (callback) callback();
                        resizeTextareas();
                    });
                }
            });
        }
        function saveGist() {
            localStorage.setItem("items", JSON.stringify(items));
        }
    } else {
        addLocalItems();
        if (callback) callback();
        resizeTextareas();
    }
}

function gistFound(content, updatedAt) {
    if (updatedAt > gistDate) {
        gistDate = updatedAt;
        var todos = document.querySelector(".todos");
        todos.innerHTML = "";
        items = content;
        addItems();
        save(false);
    } else {
        addLocalItems();
    }
}

function findGist(paToken, gistId, callback) {
    xhr({
        url: "https://api.github.com/gists/"+gistId,
        auth: "token "+paToken,
        type: "GET",
        req: "",
        onSuccess: function(gist) {
            gist = JSON.parse(gist);
            console.log("----------------------------------- findGist suc");
            console.log(gist);
            var file = gist.files[getFilename(paToken)];
            callback(JSON.parse(file.content), new Date(gist.updated_at));
        },
        onError: function(res, code) {
            res = JSON.parse(res);
            console.log("----------------------------------- findGist err");
            console.log(code);
            console.log(res);
        }
    });
}

function createGist(paToken, callback) {
    var req = {
        description: "Gist that enables syncing Taskler tasks",
        files: {}
    };
    req.files[getFilename(paToken)] = {
        content: JSON.stringify(items)
    };
    xhr({
        url: "https://api.github.com/gists",
        auth: "token "+paToken,
        type: "POST",
        json: req,
        onSuccess: function(res) {
            res = JSON.parse(res);
            console.log("----------------------------------- createGist suc");
            console.log(res);
            callback(res.id, new Date(res.updated_at));
        },
        onError: function(res, code) {
            res = JSON.parse(res);
            console.log("----------------------------------- createGist err");
            console.log(code);
            console.log(res);
        }
    });
}

function findGistId(paToken, callback) {
    xhr({
        url: "https://api.github.com/gists",
        auth: "token "+paToken,
        type: "GET",
        req: "",
        onSuccess: function(gists) {
            gists = JSON.parse(gists);
            console.log("----------------------------------- findgistid suc");
            console.log(gists);
            for (var i = 0; i < gists.length; i++) {
                if (gists[i].files[getFilename(paToken)]) {
                    callback(gists[i].id);
                    return;
                }
            }
            callback(false);
        },
        onError: function(res, code) {
            res = JSON.parse(res);
            console.log("----------------------------------- findgistid err");
            console.log(code);
            console.log(res);
        }
    });
}

function updateGist(paToken, gistId, callback) {
    var req = {
        files: {}
    };
    req.files[getFilename(paToken)] = {
        content: JSON.stringify(items)
    };
    xhr({
        url: "https://api.github.com/gists/"+gistId,
        auth: "token "+paToken,
        type: "PATCH",
        json: req,
        onSuccess: function(res) {
            res = JSON.parse(res);
            console.log("----------------------------------- updateGist suc");
            console.log(res);
            callback(res.id, new Date(res.updated_at));
        },
        onError: function(res, code) {
            res = JSON.parse(res);
            console.log("----------------------------------- updateGist err");
            console.log(code);
            console.log(res);
        }
    })
}
