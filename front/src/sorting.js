export const sortFunction = sortOrder => {
    switch (sortOrder) {
        case 'date-asc':
        case 'hour':
            return ({ timestamp }) => timestamp.valueOf();
        case 'date-desc':
            return ({ timestamp }) => -timestamp.valueOf();
        case 'sender':
            return ({ sender }) => sender;
    }
};

export const imageGroups = (images, sortOrder) => {
    switch (sortOrder) {
        case 'hour': {
            const hours = { morning: 6, afternoon: 12, evening: 18, night: 24 };
            return Object.keys(hours).map(title => ({
                title,
                images: images.filter(
                    image =>
                        Math.floor(image.timestamp.hour() / 6) * 6 ===
                        hours[title]
                )
            }));
            return [{ images }];
        }
        case 'sender': {
            const senders = [...new Set(_.map(images, 'sender'))].sort();
            return senders.map(sender => ({
                title: sender,
                images: images.filter(image => image.sender === sender)
            }));
        }
        default:
            return [{ images }];
    }
};
