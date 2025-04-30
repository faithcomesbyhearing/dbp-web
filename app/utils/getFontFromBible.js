import cachedFetch from './cachedFetch';
import Bugsnag from './bugsnagClient';

export default async (bibleId) => {
    const singleBibleUrlWithFont = `${process.env.BASE_API_ROUTE}/bibles/${bibleId}?key=${
    process.env.DBP_API_KEY
    }&v=4&include_font=true`;

    // Get active bible data
    const singleBibleWithFont = await cachedFetch(singleBibleUrlWithFont).catch((e) => {
        console.error('Error in get initial props single bible with Required Font: ', e.message); // eslint-disable-line no-console
        if (axios.isAxiosError(e)) {
            console.error('Error occurred at URL:', e.config.url); // eslint-disable-line no-console
            Bugsnag.notify(e, (event) => {
                event.addMetadata('request', {
                    url: e.config.url,
                    method: e.config.method,
                    headers: e.config.headers,
                    params: e.config.params,
                    message: e.message,
                });
            });
        }
        return { data: {} };
    });

    const bibleWithFont = singleBibleWithFont.data;
    if (bibleWithFont.primary_font?.type && bibleWithFont.primary_font?.font_name && bibleWithFont.primary_font?.data) {
        return {
            name: bibleWithFont.primary_font.font_name,
            type: bibleWithFont.primary_font.type,
            data: bibleWithFont.primary_font.data,
        };
    }
    return bibleWithFont?.fonts;
};
