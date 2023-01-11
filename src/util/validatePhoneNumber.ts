import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js';


function validateAndFormatPhoneNumber(stringToCheck: string) {

    if (!isValidPhoneNumber(stringToCheck, "BR")) {
        return false
    }

    let phoneNumber = parsePhoneNumber(stringToCheck, "BR")?.format("E.164").replace('+', '') as string

    if (phoneNumber.length < 12) {
        return false
    }

    const regex = new RegExp(/^(55)\s?([1-9][0-9])((?:[2-9])\d{3})\-?(\d{4})$/)

    if (!regex.test(phoneNumber)) {
        return false
    }

    phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`

    return phoneNumber;
}

export { validateAndFormatPhoneNumber }