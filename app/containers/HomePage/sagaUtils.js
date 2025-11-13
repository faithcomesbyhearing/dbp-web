const codes = {
	audio: true,
	audio_drama: true,
	text_plain: true,
	text_json: true,
	text_format: true,
	video_stream: true,
	NT: true,
	OT: true,
	P: true,
	C: true,
	OTPNTP: true,
	NTPOTP: true,
	OTP: true,
	NTP: true,
	OTNTP: true,
	OTPNT: true,
	NTOTP: true, // New Testament, Old Testament Portion
	S: true, // Selection
};

const ntCodes = {
	NT: true,
	NTP: true,
	OTPNTP: true,
	NTPOTP: true,
	NTOTP: true,
	OTNTP: true,
};
const otCodes = {
	OT: true,
	OTP: true,
	OTPNTP: true,
	NTPOTP: true,
	NTOTP: true,
	OTNTP: true,
};

export { ntCodes, otCodes, codes };
