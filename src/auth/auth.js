const key = 'YWxhZGRpbjpvcGVuc2VzYW1l';

export function isAuthenticated(request, reply) {
    console.log(JSON.stringify(request.headers));
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
        return false;
    }
    const split = authHeader.trim().split(' ');
    if (split && split.length === 2) {
        const reqKey = split[1].trim();
        if (reqKey === key) {
            return true;
        }
    }
    return false;
}
