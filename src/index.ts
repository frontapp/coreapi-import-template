import { examples } from './examples/example_messages.json';
import inboxIdMapping from './inbox_mapping.json';
import {
    BaseImportMessageRequest,
    BodyType,
    FrontConnector,
    FrontSender,
    MessageType,
    ImportedMessageMetadata,
    AttachmentData
} from './front_import';
import { handleRateLimiting } from './util';
import { NeedleResponse } from 'needle';

const dataUrlRegex = /^data:(.+);name=(.+);base64,(.*)$/;

async function main() {
    for(const example of examples) {
        let response : NeedleResponse = await importExample(example);

        // Handle rate limiting
        while (response.statusCode === 429) {
            console.log(`Example ${example.external_id} hit a rate limit`);
            await handleRateLimiting(response);
            console.log(`Retrying example ${example.external_id}`)
            response = await importExample(example);
        }

        if (response.statusCode && response.statusCode >= 400) {
            console.log(`HTTP error ${response.statusCode} on example ${example.external_id}`)
        }
    }
}

async function importExample(message : any) {
    const inboxId = getInboxId(message);
    const importMessageRequest = buildRequest(message);
    return await FrontConnector.importInboxMessage(inboxId, importMessageRequest);
}

// if inbound, use the first To handle
// if outbound, use Sender handle
// Customer should customize this method as needed
function getInboxId(message : any) {
    const handle = message.metadata.is_inbound ? message.to[0] : message.sender.handle;
    return inboxIdMapping[handle];
}

// Customize this to map your external message object to a BaseImportMessageRequest
function buildRequest(message : any) {
    let attachments = [] as AttachmentData[];

    // This example load attachments from Data URLs in the project json examples
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs
    if (message.attachments && message.attachments.length > 0) {
        message.attachments.forEach(attachment => {
            const matches = attachment.match(dataUrlRegex);
            attachments.push({
                content_type: matches[1],
                filename: matches[2],
                buffer: Buffer.from(matches[3], 'base64')
            } as AttachmentData);
        })
    }

    // Customize mapping here
    const importMessageRequest : BaseImportMessageRequest = {
        sender : message.sender as FrontSender,
        body_format : message.body_format as BodyType,
        type : message.type as MessageType,
        metadata : message.metadata as ImportedMessageMetadata,
        attachments : attachments,
        ...message
    }
    return importMessageRequest;
}

main();
