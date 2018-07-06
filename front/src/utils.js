export const slugify = key => String(key).replace(/[^0-9a-z]+/i, '-');

export const truncFloat = n => String(n).replace(/(\.\d{1})\d+/, '$1');
