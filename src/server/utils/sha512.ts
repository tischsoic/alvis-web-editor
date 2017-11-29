import { createHmac } from 'crypto';

export function sha512(password: string, salt: string) {
    const hashValue = createHmac('sha512', salt)
        .update(password)
        .digest('hex');

    return hashValue;
}