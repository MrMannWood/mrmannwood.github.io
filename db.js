async function openDatabase() {
    return await new Promise((resolve, reject) => {
            let openRequest = indexedDB.open('database.db', 8);
            let upgradeNeeded = false
            openRequest.onupgradeneeded  = function(event) {
                upgradeNeeded = true
                let db = openRequest.result;
                if (db.objectStoreNames.contains("weapons")) {
                    db.deleteObjectStore("weapons");
                }
                if (db.objectStoreNames.contains("classes")) {
                    db.deleteObjectStore("classes");
                }
                db.createObjectStore("weapons", { keyPath: "name" });
                db.createObjectStore("classes", { keyPath: "name" });
            };
            openRequest.onerror = function() {
                reject("Unable to open database " + openRequest.error)
            };
            openRequest.onsuccess = function() {
                resolve([openRequest.result, upgradeNeeded]);
            };
        });
}

async function writeWeaponsToDatabase(db, weapons) {
    return await Promise.resolve(
        new Promise((resolve, reject) => {
            let transaction = db.transaction("weapons", "readwrite")
            let weaponsTransaction = transaction.objectStore("weapons");
            JSON.parse(weapons).forEach(function(weapon, idx) {
                weaponsTransaction.add(weapon);
            })
            transaction.commit()
            transaction.oncomplete = function() {
                resolve();
            }
            transaction.onabort = function() {
                reject();
            }
        })
    );
}

async function writeClassesToDatabase(db, classes) {
    return await Promise.resolve(
        new Promise((resolve, reject) => {
            let transaction = db.transaction("classes", "readwrite")
            let classesTransaction = transaction.objectStore("classes");
            JSON.parse(classes).forEach(function(pfClass, idx) {
                classesTransaction.add(pfClass);
            })
            transaction.commit()
            transaction.oncomplete = function() {
                resolve();
            }
            transaction.onabort = function() {
                reject();
            }
        })
    );
}

async function readWeapons(db) {
    return await Promise.resolve(
        new Promise((resolve, reject) => {
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
        })
    );
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

function readClass(db, pfClass) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction("classes")
        let classTransaction = transaction.objectStore("classes");
        let request = classTransaction.get(pfClass);

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