"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndFormatPhoneNumber = void 0;
var libphonenumber_js_1 = __importStar(require("libphonenumber-js"));
function validateAndFormatPhoneNumber(stringToCheck) {
    var _a;
    if (!(0, libphonenumber_js_1.isValidPhoneNumber)(stringToCheck, "BR")) {
        return false;
    }
    var phoneNumber = (_a = (0, libphonenumber_js_1.default)(stringToCheck, "BR")) === null || _a === void 0 ? void 0 : _a.format("E.164").replace('+', '');
    if (phoneNumber.length < 12) {
        return false;
    }
    if (phoneNumber.length === 13 && phoneNumber.substring(4, 5) === "9") {
        phoneNumber = phoneNumber.substring(0, 4) + phoneNumber.substring(5);
    }
    var regexFormatCheck = new RegExp(/^(55)([1-9][0-9])((?:[1-9])\d{3})\-?(\d{4})$/);
    if (!regexFormatCheck.test(phoneNumber)) {
        return false;
    }
    phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : "".concat(phoneNumber, "@c.us");
    return phoneNumber;
}
exports.validateAndFormatPhoneNumber = validateAndFormatPhoneNumber;
