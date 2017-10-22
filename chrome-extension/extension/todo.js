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
        '<textarea rows="1" data-id="'+items.length+'" placeholder="Add a new one"></textarea>';
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
    textarea.style.height = newHeight-16+"px";
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
        var checkmark = itemDiv.querySelector("div.checkmark-placeholder");
        checkmark.classList.remove("checkmark-placeholder");
        checkmark.classList.add("checkmark");
        itemDiv.querySelector("textarea").setAttribute("data-id", items.length);
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
