async function openDatabase() {
    return await new Promise((resolve, reject) => {
            let openRequest = indexedDB.open('database.db', 10);
            let upgradeNeeded = false
            openRequest.onupgradeneeded  = function(event) {
                upgradeNeeded = true
                let db = openRequest.result;
                if (db.objectStoreNames.contains("weapons")) {
                    db.deleteObjectStore("weapons");
                }
                if (db.objectStoreNames.contains("armor")) {
                    db.deleteObjectStore("armor");
                }
                if (db.objectStoreNames.contains("classes")) {
                    db.deleteObjectStore("classes");
                }
                db.createObjectStore("weapons", { keyPath: "name" });
                db.createObjectStore("armor", { keyPath: "name" });
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

async function _writeJsonListToDatabase(db, name, json) {
    return await Promise.resolve(
        new Promise((resolve, reject) => {
            let transaction = db.transaction(name, "readwrite")
            let listTransaction = transaction.objectStore(name);
            JSON.parse(json).forEach(function(weapon, idx) {
                listTransaction.add(weapon);
            })
            transaction.commit()
            transaction.oncomplete = function() { resolve(); }
            transaction.onabort = function() { reject(); }
        })
    );
}

async function _readJsonObjectFromDatabase(db, name, id) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(name)
        let itemTransaction = transaction.objectStore(name);
        let request = itemTransaction.get(id);

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

async function writeWeaponsToDatabase(db, weapons) {
    return _writeJsonListToDatabase(db, "weapons", weapons);
}

async function writeArmorToDatabase(db, classes) {
    return _writeJsonListToDatabase(db, "armor", classes);
}

async function writeClassesToDatabase(db, classes) {
    return _writeJsonListToDatabase(db, "classes", classes);
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
    return _readJsonObjectFromDatabase(db, "weapons", weapon)
}

function readArmor(db, armor) {
    return _readJsonObjectFromDatabase(db, "armor", armor)
}

function readClass(db, pfClass) {
    return _readJsonObjectFromDatabase(db, "classes", pfClass)
}