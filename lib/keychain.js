var keys = {};

exports.store = store;
function store(id, key) {
    keys[id] = key;
}

exports.get = get;
function get(id) {
    return keys[id];
}