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
function globalCode() {
    var todos = document.querySelector(".todos");
    var itemCount = 0;
    var items = JSON.parse(localStorage.getItem("items"));
    if (items == null) items = [];
    function addItems() {
        for (var i = 0; i < items.length; i++) {
            var itemDiv = document.createElement("DIV");
            itemDiv.classList.add("item");
            itemDiv.innerHTML =
            '<div class="checkmark"></div>'+
            '<textarea data-id="'+i+'" rows="1" placeholder="oshit where did the text go"></textarea>'+
            '<div class="sort-icon"></div>';
            itemDiv.querySelector("textarea").value = items[i];
            todos.appendChild(itemDiv);
        }
        addNewItem();
    }
    addItems();
    function save() {
        localStorage.setItem("items", JSON.stringify(items));
    }
    (function sync() {
        var svg = document.querySelector(".sync svg");
        var dialog = document.querySelector(".sync-dialog");
        var PersonalAccessTokenInput = dialog.querySelector("input.personal-access-token");
        svg.addEventListener("click", function() {
            dialog.classList.add("visible");
        });
        var saveButton = dialog.querySelector("button.save-personal-access-token");
        saveButton.addEventListener("click", function() {
            console.log("saving access token");
            var gql = new TinyGQL({
                url: "https://api.github.com/graphql"
            });
            setTimeout(function() {
                dialog.classList.remove("visible");
            }, 1000);
        });
    })();
    (function dialogs() {
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("dialog-container")) {
                e.target.classList.remove("visible");
            }
        });
    })();
    function addNewItem() {
        var item = document.createElement("DIV");
        item.classList.add("item", "new-item");
        item.innerHTML =
        '<div class="checkmark-placeholder"></div>'+
        '<textarea rows="1" data-id="'+items.length+'" placeholder="Add a new one"></textarea>'+
        '<div class="sort-icon hidden"></div>';
        todos.appendChild(item);
    }
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
    function resizeTextareas() {
        var textareas = document.querySelectorAll("textarea");
        for (var i = 0; i < textareas.length-1; i++) {
            resizeTextarea(i);
        }
    }
    resizeTextareas();
    window.addEventListener("resize", resizeTextareas);

    var itemsToSave = [];
    document.addEventListener("input", function(e) {
        var textarea = e.target;
        var itemDiv = textarea.parentElement;
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

            var itemDivs = document.querySelectorAll(".todos .item");
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
            var itemDivs = document.querySelectorAll(".todos .item");
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
        var textareas = document.querySelectorAll(".todos .item:not(.new-item) textarea");
        for (var i = 0; i < items.length; i++) {
            textareas[i].setAttribute("data-id", i);
        }
    }
}
