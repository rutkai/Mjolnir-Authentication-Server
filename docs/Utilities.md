# Server utilities

## Password hash generator

You can generate password hashes using the command line interface. Usage (production mode, linux):

    NODE_ENV=production node cli.js create-hash

Or (production mode, windows):

    set NODE_ENV=production
    node cli.js create-hash
    
Then type in your password using the interactive console.

*Note: You will not see the characters you are typing in!*

## UUID generator

You can generate UUID-s for users with the following command:

    node cli.js generate-uuid
