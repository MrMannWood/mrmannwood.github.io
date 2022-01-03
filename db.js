function openDatabase() {
    return new Promise((resolve, reject) => {
            let openRequest = indexedDB.open('database.db', 4);
            openRequest.onupgradeneeded  = function(event) {
                let db = openRequest.result;
                if (db.objectStoreNames.contains("weapons")) {
                    db.deleteObjectStore("weapons");
                }
                db.createObjectStore("weapons", { keyPath: "name" });
            };
            openRequest.onerror = function() {
                reject("Unable to open database " + openRequest.error)
            };
            openRequest.onsuccess = function() {
                resolve(openRequest.result);
            };
        });
}

function hasWeapons(db) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction("weapons")
        let weaponsTransaction = transaction.objectStore("weapons");
        let request = weaponsTransaction.openCursor();

        var hasData = false;
        request.onsuccess = function() {
            let cursor = request.result;
            if (cursor) {
                console.log("hasWeapons: openedCursor: onsuccess: hasData")
                hasData = true;
                transaction.abort();
            }
        }
        transaction.oncomplete = function() {
            resolve(hasData);
        }
        transaction.onabort = function() {
            resolve(hasData);
        }
    });
}

function writeWeaponsToDatabase(db, weapons) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction("weapons", "readwrite")
        let weaponsTransaction = transaction.objectStore("weapons");
        JSON.parse(weapons).forEach(function(weapon, idx) {
            weaponsTransaction.add(weapon);
        })
        transaction.oncomplete = function() {
            resolve();
        }
        transaction.onabort = function() {
            reject();
        }
    });
}

function readWeapons(db) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction("weapons")
        let weaponsTransaction = transaction.objectStore("weapons");
        let request = weaponsTransaction.openCursor();

        let weapons = [];
        request.onsuccess = function() {
            let cursor = request.result;
            if (cursor) {
                weapons.push(cursor.value.name);
                cursor.continue()
            }
        }
        transaction.oncomplete = function() {
            resolve(weapons);
        }
        transaction.onabort = function() {
            reject();
        }
    });
}

function readWeapon(db, weapon) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction("weapons")
        let weaponsTransaction = transaction.objectStore("weapons");
        let request = weaponsTransaction.get(weapon);

        request.onsuccess = function() {
            let result = request.result;
            if (result) {
                resolve(result)
            } else {
                reject();
            }
        }
        transaction.onabort = function() {
            reject();
        }
    });
}