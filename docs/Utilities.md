# Server utilities

## Database manager

Using the command line database manager (`db.cli`) you can add, create or remove users.

> Note: you have to put skins in the `images/skin` directory and capes in the `images/cape` directory. Providing the filename is sufficient for entering the skin or cape name upon user creation or update. 

### Show user

You can find a user in the database using the `show` command:

    NODE_ENV=production node db.js show

### Create user

You can create a new user using the `create` command:

    NODE_ENV=production node db.js create

### Update user

You can update/edit an existing user using the `update` command:

    NODE_ENV=production node db.js update

### Delete user

You can remove an existing user using the `delete` command:

    NODE_ENV=production node db.js delete

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
