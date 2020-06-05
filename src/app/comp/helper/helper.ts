export const checkLatAndLag = (lat) => {
    if (lat) {
        return true;
    } else {
        return false;
    }
};

export const checkSecondsForTimeStamp = (seconds) => {
    if (seconds) {
        return true;
    } else {
        return false;
    }
};

export const setDate = (seconds) => {
    return new Date(seconds * 1000);
};

export const typeOf = (value) => {
    return typeof value;
};

export const typeOfArray = (isArray) => {
    return Array.isArray(isArray);
};

export const getObjectKeys = (obj) => {
    return Object.keys(obj);
}


export const filtreArrayWithNestedObject = (arrayList, searchValue, rc) => {
    if (arrayList.length && searchValue) {
        const lowercasedValue = searchValue.toLowerCase().trim();
        const found = [];
        const findObjInItem = (obj, value) => {
            return Object.values(obj).some(
                v =>
                    typeof v === 'object' && v !== null && v !== obj['ref'] ? findObjInItem(v, value) :
                        typeof v === 'string' ? (v).toString().toLocaleLowerCase().indexOf(value) >= 0 :
                            typeof v === 'number' ? v === value || isNaN(v) && isNaN(value) :
                                v === value
            );
        };

        arrayList.forEach((obj) => {
            setTimeout(() => {
                if (findObjInItem(obj, lowercasedValue)) {
                    found.push(obj);
                }
            }, 100);
        });

        return found;
    } else {
        return arrayList;
    }
}
