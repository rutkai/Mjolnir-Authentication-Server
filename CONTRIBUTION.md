# Contribution guide

## Installing the testing framework

For testing you will need FrisbyJs and Jasmine:

    npm install -g frisby
    npm install -g jasmine-node

## Running the tests

First, start the server in testing mode:

    NODE_ENV=testing node app.js
    
Then the tests:

    NODE_ENV=testing jasmine-node test
    
All tests must pass.
    
## Misc dev notes

Environment variables:

    MJOLNIR_VERBOSE: boolean, set true to verbose mode
    NODE_ENV: environment in which the application should run, the default is development; can be: production, testing