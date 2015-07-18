module.exports = (function () {
    var tests = [],
        testPointer = 0,

        registerTest = function (test) {
            tests.push(test)
        },
        runNext = function () {
            if (testPointer >= tests.length) {
                return;
            }

            tests[testPointer++].toss();
        };

    return {
        registerTest: registerTest,
        runNext: runNext
    };
}());
