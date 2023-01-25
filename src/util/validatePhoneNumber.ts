import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js';


function validateAndFormatPhoneNumber(stringToCheck: string) {

    if (!isValidPhoneNumber(stringToCheck, "BR")) {
        return false
    }

    let phoneNumber = parsePhoneNumber(stringToCheck, "BR")?.format("E.164").replace('+', '') as string


    if (phoneNumber.length < 12) {
        return false
    }

    if (phoneNumber.length === 13 && phoneNumber.substring(4, 5) === "9") {
        phoneNumber = phoneNumber.substring(0, 4) + phoneNumber.substring(5);
    }

    const regexFormatCheck = new RegExp(/^(55)([1-9][0-9])((?:[1-9])\d{3})\-?(\d{4})$/)

    if (!regexFormatCheck.test(phoneNumber)) {
        return false
    }

    phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`

    return phoneNumber;
}

export { validateAndFormatPhoneNumber }