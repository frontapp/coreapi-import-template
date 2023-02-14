import 'dotenv/config'
import needle from 'needle';

const frontUrl = 'https://api2.frontapp.com';

export type MessageType = 'email' | 'sms' | 'intercom' | 'custom';

export type BodyType = 'html' | 'markdown';

export interface FrontSender {
    author_id?: string; // ignored for inbound messages
    name?: string;
    handle: string; // Should be usable handle for message type if teammates will reply in-app
}

export interface ImportedMessageMetadata {
    thread_ref?: string; // Reference used to thread imported messages, omitting this will thread by sender
    is_inbound: boolean;
    is_archived?: boolean;
    should_skip_rules?: boolean; // true by default
}

export interface AttachmentData {
    buffer: Buffer;
    filename: string;
    content_type: string;
}

export interface BaseImportMessageRequest {
    sender: FrontSender;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body: string;
    body_format?: BodyType; // Only useable with type: 'email'
    external_id: string; // Must be unique or message won't import
    created_at: number;
    type?: MessageType;
    assignee_id?: string;
    tags?: string[];
    metadata: ImportedMessageMetadata;
    attachments?:AttachmentData[];
}

export class FrontConnector {
    static async importInboxMessage(inboxId: string, payload: BaseImportMessageRequest) {
        const endpoint = `${frontUrl}/inboxes/${inboxId}/imported_messages`
        return this.makeImportAPIRequest(endpoint, payload);
    }

    private static async makeImportAPIRequest(path: string, payload: BaseImportMessageRequest) {
        const hasAttachments = (payload.attachments && payload.attachments.length > 0) || false;
        const options = { headers: this.buildHeaders(hasAttachments), multipart: hasAttachments };
        return needle('post', path, payload, options);
    }

    private static buildHeaders(hasAttachments: boolean) {
        return {
            Authorization: `Bearer ${process.env.API_KEY}`,
            'Content-Type': hasAttachments ? 'multipart/form-data' : 'application/json',
        };
    }
}