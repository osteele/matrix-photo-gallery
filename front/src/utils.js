export const slugify = key => String(key).replace(/[^0-9a-z]+/i, '-');

export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}

export const replicateArray = (ar, length) => {
    let result = ar;
    while (result.length < length) {
        result = result.concat(ar.slice(length - result.length));
    }
    return result;
};

const memoTable = {};
export const onceish = fn => {
    let value = memoTable[fn.length];
    if (!value) memoTable[fn.length] = value = fn();
    return value;
};
