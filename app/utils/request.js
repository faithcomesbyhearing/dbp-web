// import fetch from 'isomorphic-fetch';
import axios from 'axios';


// const parseJSON = (res) => res.json();
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
			json: () => ({
				error: { message: 'You need to reset your password.', code: 428 },
			}),
		};
	} else if (res.status === 401) {
		return {
			json: () => ({
				error: { message: 'Invalid credentials, please try again', code: 401 },
			}),
		};
	}

	const error = new Error(res.statusText);
	error.response = res;
	throw error;
};

// const request = (url, options = {}) =>
// 	// fetch(url, options)
// 	axios.get(url, options)
// 		.then(checkStatus)
// 		.then(parseJSON);
const request = (url, options = { method: 'GET', body: {}, config: {} }) => {
	// console.log("Request URL ===============>", url);

	let invoke = null;
	switch (options.method) {
		case 'GET':
			invoke = axios.get(url);
			break;
		case 'POST':
			invoke = axios.post(url, options.body);
			break;
		case 'PUT':
			invoke = axios.put(url, options.body);
			break;
		case 'DELETE':
			invoke = axios.delete(url, options.config);
			break;
		default:
			invoke = axios.get(url);
			break;
	}
	return invoke.then(checkStatus).then(parseJSON);
}


export default request;
