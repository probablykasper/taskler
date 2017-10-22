// $("body").on("input", "section.contact textarea", function() {
//     var offset = this.offsetHeight - this.clientHeight;
//     $(this).css("height", "auto").css("height", this.scrollHeight + offset);
// });

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
            '<textarea data-id="'+i+'" rows="1" placeholder="oshit where did the text go"></textarea>';
        itemDiv.querySelector("textarea").value = items[i];
        todos.appendChild(itemDiv);
    }
    addNewItem();
}
function save() {
    localStorage.setItem("items", JSON.stringify(items));
}
addItems();
function addNewItem() {
    var item = document.createElement("DIV");
    item.classList.add("item", "new-item");
    item.innerHTML =
        '<div class="checkmark-placeholder"></div>'+
        '<textarea rows="1" placeholder="Add a new one"></textarea>';
    todos.appendChild(item);
}

function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

var itemsToSave = [];
document.addEventListener("input", function(e) {
    var textarea = e.target;
    var divItem = textarea.parentElement;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight - 16+"px";
    if (divItem.classList.contains("new-item")) {
        divItem.classList.remove("new-item");
        var checkmark = divItem.querySelector("div.checkmark-placeholder");
        checkmark.classList.remove("checkmark-placeholder");
        checkmark.classList.add("checkmark");
        divItem.querySelector("textarea").setAttribute("data-id", items.length);
        items[items.length] = textarea.value;
        addNewItem();
        save();
    } else {
        items[textarea.dataset.id] = textarea.value;
        save();
    }
});
