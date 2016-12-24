function getMessageFromCode(code) {
    switch(code) {
        case 1000: return "API version not existent";
        case 1001: return "API version was removed";
        case 1002: return "API type does not exist";
        case 1003: return "API call does not exist";
        case 1004: return "Token is not authorized to perform this action";
        case 1005: return "Invalid login token";

        case 2000: return "Ip was blocked";
        case 2001: return "News error";

        case 3000: return "Missing login data";
        case 3001: return "Invalid login data";
        case 3002:
        case 3004:
        case 3009:
            return "Not logged in";
        case 3003: return "User does not exist";
        case 3005:
        case 3015:
            return "Category does not exist";
        case 3006:
        case 3007:
            return "Invalid ID";
        case 3008: return "Invalid type";
        case 3010: return "Already exists";
        case 3011: return "Reached limit of favorites";
        case 3012: return "Already logged in";
        case 3013: return "Other user is logged in";
        case 3014: return "Not authenticated";
        case 3016: return "Medium does not exist";
        default: return "No error specified";
    }
}

class APIError extends Error {
    constructor(code, rawMessage) {
        super(getMessageFromCode(code));
        this.code = code;
        this.raw = rawMessage;
    }
}

module.exports = APIError;