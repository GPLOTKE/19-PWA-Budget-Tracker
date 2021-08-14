// Here we set some locations for the indexedDB depending on browser.
const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;
// Here we create a variable for the db and then we create a request variable that opens the our indexedDB and creates a 'budget' table. Just 1 of them.
let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;

    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], 'readwrite')
    const store = transaction.createObjectStore("pending")

    store.add(record)
}

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    return response.json();
                })
                .then(() => {
                    // delete records if successful
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);