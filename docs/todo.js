websiteCode();
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
function updateItemsObject() {
    if (Array.isArray(items)) {
        return {
            tasks: items,
            repeatingTasks: []
        };
    } else {
        return items;
    }
}
function addLocalItems() {
    window.items = JSON.parse(localStorage.getItem("items"));
    items = updateItemsObject();
    if (items == null) {
        items = {
            tasks: [],
            repeatingTasks: []
        };
    }
    console.log(items);
    var todos = document.querySelector(".todos");
    todos.innerHTML = "";
    addItems();
}
function globalCode() {
    var todos = document.querySelector(".todos");
    var itemCount = 0;
    function removeItem(id) {
        items.tasks.splice(id, 1);
        var textarea = document.querySelector('textarea[data-id="'+id+'"]');
        textarea.removeAttribute("data-id");
        var divItem = textarea.parentElement;
        divItem.classList.add("removed");
        var computedHeight = getComputedStyle(divItem).height;
        divItem.style.height = computedHeight;
        setTimeout(function() {
            divItem.style.height = "0px";
        }, 10);
        var textareas = document.querySelectorAll("textarea");
        for (var i = 0; i < textareas.length; i++) {
            if (textareas[i].dataset.id > id) {
                textareas[i].dataset.id = textareas[i].dataset.id - 1;
            }
        }
        save();
    }
    function resizeTextarea(textarea) {
        var value = textarea.value;
        var newLineCount = (value.match(/\n/g) || []).length;
        textarea.setAttribute("rows", newLineCount+1);
    }
    window.resizeTextareas = function() {
        var itemTextareas = document.querySelectorAll("textarea[data-id]");
        for (var i = 0; i < itemTextareas.length-1; i++) {
            resizeTextarea(itemTextareas[i]);
        }
        var rtTextareas = document.querySelectorAll("textarea[data-rt-id]");
        for (var i = 0; i < rtTextareas.length; i++) {
            resizeTextarea(rtTextareas[i]);
        }
    }
    window.addEventListener("resize", resizeTextareas);

    var itemsToSave = [];
    document.addEventListener("input", function(e) {
        var textarea = e.target;
        var itemDiv = textarea.parentElement;
        var cl = itemDiv.classList;
        if (cl.contains("item")) {
            resizeTextarea(textarea);
            if (itemDiv.classList.contains("new-item")) {
                itemDiv.classList.remove("new-item");
                var checkmark = itemDiv.querySelector(".checkmark-placeholder");
                checkmark.classList.remove("checkmark-placeholder");
                checkmark.classList.add("checkmark");
                itemDiv.querySelector("textarea").setAttribute("data-id", items.tasks.length);
                itemDiv.querySelector(".sort-icon").classList.remove("hidden");
                items.tasks[items.length] = textarea.value;
                addNewItem();
                save();
            } else {
                items.tasks[textarea.dataset.id] = textarea.value;
                save();
            }
        } else if (cl.contains("repeating-task")) {
            resizeTextarea(textarea);
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
            for (var i = 0; i < items.tasks.length; i++) {
                itemDivs[i].style.transform = "translateY(0px)";
                if (itemDivs[i] == currentItem) newPos = i + moveCount;
            }
            var oldPos = newPos - moveCount;
            items.tasks = moveIndex(items.tasks, oldPos, newPos);
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
        for (var i = 0; i < items.tasks.length; i++) {
            textareas[i].setAttribute("data-id", i);
        }
    }
}
function addItems() {
    postRepeatingTasks();
    for (var i = 0; i < items.tasks.length; i++) {
        var itemDiv = document.createElement("DIV");
        itemDiv.classList.add("item");
        itemDiv.innerHTML =
        '<div class="checkmark"></div>'+
        '<textarea data-id="'+i+'" rows="1" placeholder="oshit where did the text go"></textarea>'+
        '<div class="sort-icon"></div>';
        itemDiv.querySelector("textarea").value = items.tasks[i];
        var todos = document.querySelector(".todos");
        todos.appendChild(itemDiv);
    }
    addNewItem();
    for (var i = 0; i < items.repeatingTasks.length; i++) {
        addRepeatingTask(items.repeatingTasks[i], false);
    }
}
function addNewItem() {
    var item = document.createElement("DIV");
    item.classList.add("item", "new-item");
    item.innerHTML =
    '<div class="checkmark-placeholder"></div>'+
    '<textarea rows="1" data-id="'+items.tasks.length+'" placeholder="Add a new one"></textarea>'+
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
function save(saveGist = true, instant = false) {
    if (saveGist) unsyncedChanges = true;
    localStorage.setItem("items", JSON.stringify(items));
    if (saveTimer) clearTimeout(saveTimer);
    if (saveGist && personalAccessToken) {
        function finallySave() {
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
        }
        if (instant) {
            console.log("Updating gist instantly...");
            finallySave();
        } else {
            console.log("Updating gist in 500ms...");
            saveTimer = setTimeout(finallySave, 500);
        }
    }
}

(function dialogClose() {
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("dialog-container")) {
            var dialog = e.target;
            dialog.classList.remove("visible");
            setTimeout(function() {
                dialog.classList.remove("displayed");
            }, 1000);
        }
    });
})();
function addRepeatingTask(o, transition = true) { // options
    var dialog = document.querySelector(".repeating-tasks-dialog");

    var nrt = document.createElement("DIV"); // newRepeatingTask

    var dialogChildren = dialog.children[0].children;
    var bottomBar = dialogChildren[dialogChildren.length-1];
    dialog.children[0].insertBefore(nrt, bottomBar);

    nrt.classList.add("new-repeating-task", "repeating-task");
    var repeatingTasks = dialog.querySelectorAll(".repeating-task:not(.new-repeating-task):not(.deleted)");
    var id = repeatingTasks.length; // weekday Id
    var p = o.interval.period;
    var weeks = (p == "weeks") ? " visible" : "";
    var months = (p == "months") ? " visible" : "";
    var years = (p == "years") ? " visible" : "";
    nrt.innerHTML =
        '<textarea rows="1" data-rt-id="1" placeholder="Add a new one"></textarea>'
        +'<div class="options">'
            +'<p>Repeat every</p>'
                +'<input value="1" class="every">'
                +'<select class="period">'
                    +'<option value="days">day</option>'
                    +'<option value="weeks">week</option>'
                    +'<option value="months">month</option>'
                    +'<option value="years">year</option>'
                +'</select>'
                +'<div class="time">'
                    +'<p>at</p>'
                    +'<input placeholder="15" class="at-hour">'
                    +'<p>:</p>'
                    +'<input placeholder="30" class="at-min">'
                +'</div>'
                +'<div class="weekday'+weeks+'">'
                    +'<p>on</p>'
                    +'<input id="Mon'+id+'" type="checkbox" value="M" class="wd wd1">'
                    +'<label for="Mon'+id+'">M</label>'
                    +'<input id="Tue'+id+'" type="checkbox" value="T" class="wd wd2">'
                    +'<label for="Tue'+id+'">T</label>'
                    +'<input id="Wed'+id+'" type="checkbox" value="W" class="wd wd3">'
                    +'<label for="Wed'+id+'">W</label>'
                    +'<input id="Thu'+id+'" type="checkbox" value="T" class="wd wd4">'
                    +'<label for="Thu'+id+'">T</label>'
                    +'<input id="Fri'+id+'" type="checkbox" value="F" class="wd wd5">'
                    +'<label for="Fri'+id+'">F</label>'
                    +'<input id="Sat'+id+'" type="checkbox" value="S" class="wd wd6">'
                    +'<label for="Sat'+id+'">S</label>'
                    +'<input id="Sun'+id+'" type="checkbox" value="S" class="wd wd0">'
                    +'<label for="Sun'+id+'">S</label>'
                +'</div>'
                +'<div class="day-of-month'+months+'">'
                    +'<p>, the</p>'
                    +'<input class="at-day-of-month">'
                    +'<p class="th">th</p>'
                    +'<p>&nbsp;day of the month</p>'
                +'</div>'
                +'<div class="date'+years+'">'
                    +'<select class="date-month">'
                        +'<option value="0">January</option>'
                        +'<option value="1">February</option>'
                        +'<option value="2">March</option>'
                        +'<option value="3">April</option>'
                        +'<option value="4">May</option>'
                        +'<option value="5">June</option>'
                        +'<option value="6">July</option>'
                        +'<option value="7">August</option>'
                        +'<option value="8">September</option>'
                        +'<option value="9">October</option>'
                        +'<option value="10">November</option>'
                        +'<option value="11">December</option>'
                    +'</select>'
                    +'<input class="at-day-of-month">'
                    +'<p class="th">th</p>'
                +'</div>'
                +'<div class="delete"></div>'
            +'</div>'
        +'</div>';

    nrt.querySelector("textarea").value = o.text;
    nrt.querySelector(".every").value = o.interval.every;
    if (o.interval.hour < 10) o.interval.hour = "0"+o.interval.hour;
    if (o.interval.min  < 10) o.interval.min  = "0"+o.interval.min;
    nrt.querySelector(".at-hour").value = o.interval.hour;
    nrt.querySelector(".at-min").value = o.interval.min;
    nrt.querySelector(".period").value = o.interval.period;
    if (p == "weeks") {
        var wd = o.interval.weekdays;
        for (var i = 0; i < 7; i++) {
            nrt.querySelector(".wd"+i).checked = wd[i];
        }
    } else if (p == "months") {
        nrt.querySelector(".day-of-month .at-day-of-month").value = o.interval.dayOfMonth;
    } else if (p == "years") {
        nrt.querySelector(".date-month").value = o.interval.month;
        nrt.querySelector(".date .at-day-of-month").value = o.interval.dayOfMonth;
    }

    if (transition) {
        var height = getComputedStyle(nrt).height;
        nrt.classList.add("deleted");
        nrt.style.height = "0px";

        nrt.classList.remove("new-repeating-task");
        nrt.classList.add("repeating-task");

        setTimeout(function() {
            nrt.style.height = height;
            nrt.classList.remove("deleted");
            setTimeout(function() {
                nrt.style.height = "";
            }, 150);
        }, 10);
    } else {
        nrt.classList.remove("new-repeating-task");
    }

}
function postRepeatingTasks() {
    var now = new Date();
    var newTasks = false;
    for (var i = 0; i < items.repeatingTasks.length; i++) {
        // post tasks that are due
        var item = items.repeatingTasks[i];
        if (typeof item.nextDate == "string") {
            item.nextDate = new Date(item.nextDate);
        }
        if (now > item.nextDate) {
            newTasks = true;
            items.tasks.unshift(item.text); // add to start of array
            item.nextDate = getNextDate(item);
        }
    }
    if (newTasks) save(true, true);
}
(function dateIncrements() {
    // prototype increment date, month and year
    Date.prototype.incrementDate = function(incrementWith = 1) {
        this.setDate(this.getDate()+incrementWith);
    }
    Date.prototype.incrementMonth = function(incrementWith = 1) {
        this.setMonth(this.getMonth()+incrementWith);
    }
    Date.prototype.incrementYear = function(incrementWith = 1) {
        this.setFullYear(this.getFullYear()+incrementWith);
    }
})();
function getNextDate(item, postDueTasks = true) {

    var now = new Date();
    var nextDate = new Date();
    now.setSeconds(0);
    nextDate.setSeconds(0);

    nextDate.setHours(item.interval.hour);
    nextDate.setMinutes(item.interval.min);
    if (item.interval.period == "days") {
        if (now > nextDate) {
            nextDate.incrementDate();
        }
    } else if (item.interval.period == "weeks") {
        for (var i = 0; i < 7; i++) {
            var wdi = (i + now.getDay()) % 7; // weekDayIndex
            if (item.interval.weekdays[wdi] && now < nextDate) {
                break;
            }
            nextDate.incrementDate();
        }
    } else if (item.interval.period == "months") {
        nextDate.setDate(item.interval.dayOfMonth);
        if (now > nextDate) {
            nextDate.incrementMonth();
        }
    } else if (item.interval.period == "years") {
        nextDate.setDate(item.interval.dayOfMonth);
        nextDate.setMonth(item.interval.month);
        if (now > nextDate) {
            nextDate.incrementYear();
        }
        console.log("------------------------------ NEXXXXXXXX");
        console.log(item);
    }
    return nextDate;
}
(function repeatingTasksDialog() {
    var oldEvery = "";
    var oldHours = "";
    var oldMinutes = "";
    var dayOfMonth = "";
    document.addEventListener("input", function(e) {
        var input = e.target;
        var value = Number(input.value);
        // validate every x
        if (e.inputType == "insertText") {
            if (input.classList.contains("every")) {
                if (isNaN(value) || value <= 0) {
                    input.value = oldEvery;
                } else {
                    oldEvery = input.value;
                }
                // validate hours input
            } else if (input.classList.contains("at-hour")) {
                if (isNaN(value) || value < 0 || value > 24) {
                    input.value = oldHours;
                } else {
                    oldHours = input.value;
                }
                // validate minutes input
            } else if (input.classList.contains("at-min")) {
                if (isNaN(value) || value < 0 || value > 59) {
                    input.value = oldMinutes;
                } else {
                    oldMinutes = input.value;
                }
                // validate day-of-the-month input
            } else if (input.classList.contains("at-day-of-month")) {
                if (isNaN(value) || value < 1 || value > 31) {
                    input.value = dayOfMonth;
                } else {
                    dayOfMonth = input.value;
                }
            }
        }
    });

    var dialog = document.querySelector(".repeating-tasks-dialog");

    // dynamic options
    dialog.addEventListener("change", function(e) {
        if (e.target.classList.contains("period")) {
            var selectPeriod = e.target;
            var weekday = selectPeriod.parentElement.querySelector(".weekday");
            var dayOfMonth = selectPeriod.parentElement.querySelector(".day-of-month");
            var date = selectPeriod.parentElement.querySelector(".date");

            weekday.classList.remove("visible");
            dayOfMonth.classList.remove("visible");
            date.classList.remove("visible");
            if (selectPeriod.value == "weeks") {
                weekday.classList.add("visible");
            } else if (selectPeriod.value == "months") {
                dayOfMonth.classList.add("visible");
            } else if (selectPeriod.value == "years") {
                date.classList.add("visible");
            }
        }
    });

    // delete
    window.dialog = dialog;
    dialog.addEventListener("click", function(e) {
        if (e.target.classList.contains("delete")) {
            var repeatingTask = e.target.parentElement.parentElement;
            repeatingTask.classList.add("deleted");
            var computedHeight = getComputedStyle(repeatingTask).height;
            repeatingTask.style.height = computedHeight;
            setTimeout(function() {
                repeatingTask.style.height = "0px";
            }, 10);
        }
    });
    // new
    var addIcon = dialog.querySelector(".add-repeating-task");
    addIcon.addEventListener("click", function(e) {
        addRepeatingTask({
            text: "",
            interval: {
                every: 1,
                hour: "",
                min: "",
                period: "days"
            },
            nextDate: new Date()
        });
    });
    // open dialog
    var icon = document.querySelector(".repeating-tasks svg");
    icon.addEventListener("click", function() {
        dialog.classList.add("displayed");
        setTimeout(function() {
            dialog.classList.add("visible");
        }, 10);
    });
    // save
    var saveButton = dialog.querySelector("button.save-personal-access-token");
    saveButton.addEventListener("click", function() {
        var repeatingTasks = dialog.querySelectorAll(".repeating-task:not(.new-repeating-task):not(.deleted)");
        items.repeatingTasks = [];
        for (var i = 0; i < repeatingTasks.length; i++) {
            currentTask = repeatingTasks[i];
            var every = Number(currentTask.querySelector(".every").value);
            var period = currentTask.querySelector(".period").value;
            var time = {
                hour: Number(currentTask.querySelector(".at-hour").value),
                min: Number(currentTask.querySelector(".at-min").value)
            }
            if (period == "weeks") {
                var weekdays = [];
                for (var wdi = 0; wdi < 7; wdi++) { // weekDayIndex
                    var wdElement = currentTask.querySelector(".wd"+wdi);
                    weekdays.push(wdElement.checked || false);
                }
            } else if (period == "months") {
                var dayOfMonth = currentTask.querySelector(".day-of-month .at-day-of-month").value;
            } else if (period == "years") {
                var month = currentTask.querySelector(".date-month").value;
                var dayOfMonth = currentTask.querySelector(".date .at-day-of-month").value;
            }

            var currentItem = {
                text: currentTask.querySelector("textarea").value,
                interval: {
                    every: every,
                    period: period,
                    hour: time.hour,
                    min: time.min
                }
            };
            if (period == "weeks") {
                currentItem.interval.weekdays = weekdays;
            } else if (period == "months") {
                currentItem.interval.dayOfMonth = dayOfMonth;
            } else if (period == "years") {
                currentItem.interval.month = month;
                currentItem.interval.dayOfMonth = dayOfMonth;
            }
            currentItem.nextDate = getNextDate(currentItem);

            items.repeatingTasks[i] = currentItem;
        }
        save(true, true);
        dialog.classList.remove("visible");
        setTimeout(function() {
            dialog.classList.remove("displayed");
        }, 1000);
    });
})();
(function syncDialog() {
    var svg = document.querySelector(".sync svg");
    var dialog = document.querySelector(".sync-dialog");
    var personalAccessTokenInput = dialog.querySelector("input.personal-access-token");
    if (personalAccessToken) personalAccessTokenInput.value = personalAccessToken;
    svg.addEventListener("click", function() {
        dialog.classList.add("displayed");
        setTimeout(function() {
            dialog.classList.add("visible");
        }, 10);
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
            setTimeout(function() {
                dialog.classList.remove("displayed");
            }, 10);
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
        items = updateItemsObject(items);
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
    });
}
