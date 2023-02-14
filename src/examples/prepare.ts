const fs = require("fs");
import { loremIpsum } from "./loremipsum.json";

const NUM_OF_MESSAGES = 300;
const NUM_OF_CONVERSATIONS = 30;

let exampleMessages: Object[] = [];

const words = loremIpsum.split(' ');

function createContactHandle() {
    return `${words[randomInt(words.length)]}+${randomInt(1000)}@customer.com`;
}

function createBody() {
    return loremIpsum.substring(
        randomInt(Math.round(loremIpsum.length/2)), 
        loremIpsum.length-(randomInt(Math.round(loremIpsum.length/2)))
        );
}

function createSubject() {
    return `${words[randomInt(words.length)]} ${words[randomInt(words.length)]} ${words[randomInt(words.length)]}`;
}

function createTags() {
    let tags: String[] = [];

    for (let i = randomInt(3); i < 3; i++) {
        tags.push(`tag ${words[randomInt(words.length)]}`);
    }

    return tags;
}

function createRecipients(isInbound) {
    const inboxHandle = (randomInt(100) % 2) === 0 ? 'support@example.com' : 'sales@example.com';

    let sender = {};
    let to: String[] = [];
    let cc: String[] = [];
    let bcc: String[] = [];

    if (isInbound) {
        to = [inboxHandle];
        sender = { 
            handle: createContactHandle(),
            name: `Example contact ${randomInt(NUM_OF_MESSAGES)}`
        }
    } else {
        sender = {
            handle: inboxHandle,
            name: `example teammate ${randomInt(NUM_OF_MESSAGES)}`,
            //author_id: `tea_${randomInt(NUM_OF_MESSAGES).toString(36)}`
        }
        to = [createContactHandle()];
        cc = [createContactHandle()];
        bcc = [createContactHandle()];
    }

    return {
        sender,
        to,
        cc,
        bcc
    };
}

function createExampleMessage(isInbound) {
    const recipients = createRecipients(isInbound);

    return {
        sender: recipients.sender,
        to: recipients.to,
        cc: recipients.cc,
        bcc: recipients.bcc,
        body_format: "html",
        type: "email",
        tags: createTags(),
        metadata: {
            should_skip_rules: true,
            thread_ref: `conv_thread_ref_${randomInt(NUM_OF_CONVERSATIONS)}`,
            is_inbound: isInbound,
            is_archived: false
        },
        attachments: [],
        subject: createSubject(),
        body: createBody(),
        external_id: `external_message_id_${Math.random().toString().slice(2,10)}`,
        created_at: (1321038671 + randomInt(1000000)),
        //assignee_id: `tea_${randomInt(100).toString(36)}`
    }
}

function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

for (let i=0; i<NUM_OF_MESSAGES;i++) {
    let isInbound = i % 2 === 0;
    exampleMessages.push(createExampleMessage(isInbound));
}

fs.writeFileSync('./src/examples/example_messages.json', JSON.stringify({examples: exampleMessages}), {encoding: 'utf-8'});