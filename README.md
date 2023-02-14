# Front Sample Application - CoreAPI Import
This project provides an example application that Front customers can use as a starting point for bulk importing messages. To learn more about using this sample application, visit our [Developer Portal](https://dev.frontapp.com/docs/sample-application).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the import.

### `yarn prepare`

Creates new example messages based on `src/examples/prepare.ts`

## Configuration

### `.env`

Put your `API_KEY` here.

### `inbox_mapping.json`

Associates an internal channel address with an inbox id.  If that channel address shows up in the recipients of the message, that's the inbox the message import targets.

### `prepare.ts`

`NUM_OF_MESSAGES` and `NUM_OF_CONVERSATIONS` are used when generating a new `example_messages.json`