import { NeedleResponse } from "needle";

export function parseHeaderInt(res : NeedleResponse, key : string) {
    const value = res.headers[key] as string;
    return parseInt(value);
}

// Please see https://dev.frontapp.com/docs/rate-limiting for additional rate-limiting details
export async function handleRateLimiting(res : NeedleResponse) {
    const requestsRemaining = parseHeaderInt(res, 'x-ratelimit-remaining');
    const retryAfterMillis = 1000 * parseHeaderInt(res, 'retry-after');

    // If there are requests remaining, but we saw a 429 status, then we hit a burst limit:
    // https://dev.frontapp.com/docs/rate-limiting#additional-burst-rate-limiting
    if (requestsRemaining > 0) {
        const burstLimitTier = parseHeaderInt(res, 'x-front-tier');
        console.log(`Tier ${burstLimitTier} resource burst limit reached`);
    }
    // Otherwise, if remaining is 0, we simply ran out of global requests.
   else {
        const globalLimit = parseHeaderInt(res, 'x-ratelimit-limit');
        console.log(`Global rate limit of ${globalLimit} reached`);
    }
    return new Promise(resolve => {
        setTimeout(resolve, retryAfterMillis);
    });
}