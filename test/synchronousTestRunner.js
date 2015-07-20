var tests = [];


exports.registerTest = registerTest;
function registerTest(test) {
    tests.push(test)
}

exports.runNext = runNext;
function runNext() {
    if (!tests.length) {
        return;
    }

    tests.shift().toss();
}
