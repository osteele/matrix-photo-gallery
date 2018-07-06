import moment from 'moment';
import tideTable from './tide-table.json';

// Add to Baan Mai (Ko Lon) times, to get Koh Taphao Noi reference point.
const TIDE_DELTA = -100;

export const uninterpolatedTime2tide = datetime => {
    const timestamp = datetime.clone().subtract(TIDE_DELTA, 'minutes');
    const month = tideTable[timestamp.month() + 1];
    const day = month && month[timestamp.date() - 1];
    if (!day) {
        console.info('missing tide level for', timestamp.format('ll'));
    }
    return day && day[timestamp.hour()];
};

export const time2tide = datetime => {
    const s0 = uninterpolatedTime2tide(datetime);
    const s1 = uninterpolatedTime2tide(datetime.clone().add(1, 'hour'));
    return s0 === undefined || s1 === undefined
        ? s0
        : s0 + (datetime.minute() / 60) * (s1 - s0);
};

// for debugging
const showTides = () => {
    for (let h = 6; h < 13; h++) {
        for (let m = 0; m < 60; m += 10) {
            const when = moment();
            when.day(4);
            when.hour(h);
            when.minute(m);
            console.info(when.format('h:mm A, ddd MMM Do'), time2tide(when));
        }
    }
};
