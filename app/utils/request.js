import axios from 'axios';
import isEmpty from 'lodash/isEmpty';

const parseJSON = (res) => res.data;

const checkStatus = (res) => {
	if (res.status >= 200 && res.status < 300) {
		return res;
	}
	if (res.status >= 300 && res.status < 400) {
		return res;
	}
	if (res.status === 428) {
		return {
			data: {
				error: { message: 'You need to reset your password.', code: 428 },
			},
		};
	} else if (res.status === 401) {
		return {
			data: {
				error: { message: 'Invalid credentials, please try again', code: 401 },
			},
		};
	}

	const error = new Error(res.statusText);
	error.response = res;
	throw error;
};

const request = async (
	url,
	options = { method: 'GET', body: {}, config: {}, header: {} },
) => {
	let invoke = null;
	switch (options.method) {
		case 'POST':
			invoke = axios.post(url, options.body);
			break;
		case 'PUT':
			invoke = axios.put(url, options.body);
			break;
		case 'DELETE':
			invoke = axios.delete(url, options.config);
			break;
		case 'GET':
		default:
			invoke = isEmpty(options.header)
				? axios.get(url)
				: axios.get(url, { headers: options.header });
			break;
	}
	const res = await invoke;
	const resStatus = await checkStatus(res);
	return parseJSON(resStatus);
};

export default request;
