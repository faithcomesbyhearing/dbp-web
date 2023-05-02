import axios from 'axios';
import request from './request';

export default async ({
  plainFilesetIds,
  formattedFilesetIds,
  bookId: lowerCaseBookId,
  chapter,
}) => {
  // Gather all initial data
  const bookId = lowerCaseBookId.toUpperCase();
  // start promise for formatted text
  const formattedPromises = formattedFilesetIds.map(async (id) => {
    const url = `${process.env.BASE_API_ROUTE}/bibles/filesets/${id}?asset_id=${
      process.env.DBP_BUCKET_ID
    }&key=${
      process.env.DBP_API_KEY
    }&v=4&book_id=${bookId}&chapter_id=${chapter}&type=text_format`;
    const res = await request(url).catch((e) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Error in request for formatted fileset: ', e.message); // eslint-disable-line no-console
      }
    });
    const path = res && res.data && res.data[0] && res.data[0].path;
    let text = '';
    if (path) {
      text = await axios.get(path)
        .then((textRes) => textRes.data)
        .catch((e) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Error fetching formatted text: ', e.message, ' path: ', path); // eslint-disable-line no-console
          }
        });
    }

    return text || '';
  });

  let plainTextJson = JSON.stringify({});
  // start promise for plain text
  const plainPromises = plainFilesetIds.map(async (id) => {
    const url = `${
      process.env.BASE_API_ROUTE
    }/bibles/filesets/${id}/${bookId}/${chapter}?key=${
      process.env.DBP_API_KEY
    }&v=4`;
    const res = await request(url)
      .then((json) => {
        plainTextJson = JSON.stringify(json.data);
        return json;
      })
      .catch((e) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in request for plain fileset: ', e.message, 'url', url); // eslint-disable-line no-console
        }
        return { data: [] };
      });

    return res ? res.data : [];
  });

  let plainTextFound = false;
  let plainText = [];
  /* eslint-disable */
  for (const promise of plainPromises) {
    if (plainTextFound) break;
    await promise
      .then((res) => {
        plainText = res;
        plainTextFound = true;
      })
      .catch((reason) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Reason race threw: ', reason.message); // eslint-disable-line no-console
        }
      });
  }
  const formattedText = await Promise.all(formattedPromises);

  /* eslint-enable */
  // Return a default object in the case that none of the api calls work
  return {
    plainText,
    plainTextJson,
    formattedText: formattedText[0] || '',
  };
};
