/*
 *
 * Settings reducer
 *
 */

import {
	TOGGLE_SETTINGS_OPTION,
	TOGGLE_SETTINGS_OPTION_AVAILABILITY,
	UPDATE_THEME,
	UPDATE_FONT_TYPE,
	UPDATE_FONT_SIZE,
	TOGGLE_AUTOPLAY,
} from './constants';
import { ACTIVE_TEXT_ID } from '../HomePage/constants';
import { SET_VOLUME, SET_PLAYBACK_RATE } from '../AudioPlayer/constants';

const initialState = structuredClone({
	userSettings: {
		activeTheme: 'red',
		activeFontType: 'sans',
		activeFontSize: 42,
		toggleOptions: {
			readersMode: {
				name: "READER'S MODE",
				active: false,
				available: true,
			},
			crossReferences: {
				name: 'CROSS REFERENCE',
				active: true,
				available: true,
			},
			redLetter: {
				name: 'RED LETTER',
				active: true,
				available: true,
			},
			justifiedText: {
				name: 'JUSTIFIED TEXT',
				active: true,
				available: true,
			},
			oneVersePerLine: {
				name: 'ONE VERSE PER LINE',
				active: false,
				available: true,
			},
			verticalScrolling: {
				name: 'VERTICAL SCROLLING',
				active: false,
				available: false,
			},
		},
		// Audio related
		autoPlayEnabled: true,
		volume: 1,
		playbackRate: 1,
	},
});

function settingsReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
		case SET_VOLUME:
			return {
				...state,

				userSettings: {
					...state.userSettings,
					volume: action.value,
				},
			};
		case SET_PLAYBACK_RATE:
			return {
				...state,

				userSettings: {
					...state.userSettings,
					playbackRate: action.value,
				},
			};
		case ACTIVE_TEXT_ID:
			// May need this if settings should change based on active version
			return state;
		case UPDATE_THEME:
			return {
				...state,

				userSettings: {
					...state.userSettings,
					activeTheme: action.theme,
				},
			};
		case UPDATE_FONT_TYPE:
			return {
				...state,

				userSettings: {
					...state.userSettings,
					activeFontType: action.font,
				},
			};
		case UPDATE_FONT_SIZE:
			return {
				...state,

				userSettings: {
					...state.userSettings,
					activeFontSize: action.size,
				},
			};
		case TOGGLE_AUTOPLAY:
			if (typeof window !== 'undefined') {
				document.cookie = `bible_is_autoplay=${action.state};path=/`;
			}
			return {
				...state,

				userSettings: {
					...state.userSettings,
					autoPlayEnabled: action.state,
				},
			};
		case TOGGLE_SETTINGS_OPTION:
			if (typeof window !== 'undefined') {
				console.log('TOGGLE_SETTINGS_OPTION action:', action);
				console.log('Current state:', state);
				// Exclusive path is the path to the setting that cannot be active at the same time as this one
				// action.exclusivePath is the path of the option that cannot have the same state as the one currently being set
				if (action.exclusivePath) {
					document.cookie = `bible_is_${action.exclusivePath.join(
						'_',
					)}=false;path=/`;
					document.cookie = `bible_is_${action.path.join('_')}=${!state[action.path]};path=/`;

					return {
						...state,
						[action.exclusivePath]: false,
						[action.path]: !state[action.path],
					};
				}

				document.cookie = `bible_is_${action.path.join('_')}=${!state[action.path]};path=/`;

				return {
					...state,
					[action.path]: !state[action.path],
				};
			}
			if (action.exclusivePath) {
				return {
					...state,
					[action.exclusivePath]: false,
					[action.path]: !state[action.path],
				};
			}
			return {
				...state,
				[action.path]: !state[action.path],
			};
		case TOGGLE_SETTINGS_OPTION_AVAILABILITY:
			return {
				...state,
				[action.path]: !state[action.path],
			};
		case 'GET_INITIAL_ROUTE_STATE_SETTINGS':
			return {
				...state,

				userSettings: {
					...state.userSettings,

					toggleOptions: {
						...state.userSettings.toggleOptions,

						redLetter: {
							...state.userSettings.toggleOptions.redLetter,
							available: action.redLetter,
						},

						crossReferences: {
							...state.userSettings.toggleOptions.crossReferences,
							available: action.crossReferences,
						},
					},
				},
			};
		case 'GET_INITIAL_ROUTE_STATE_SETTINGS_FROM_APP':
			return {
				...state,

				userSettings: {
					...state.userSettings,
					activeTheme: action.settings.activeTheme,
					activeFontType: action.settings.activeFontType,
					activeFontSize: action.settings.activeFontSize,

					toggleOptions: {
						...state.userSettings.toggleOptions,

						readersMode: {
							...state.userSettings.toggleOptions.readersMode,
							active: action.settings.readersMode,
						},

						justifiedText: {
							...state.userSettings.toggleOptions.justifiedText,
							active: action.settings.justifiedText,
						},

						redLetter: {
							...state.userSettings.toggleOptions.redLetter,
							active: action.settings.redLetter,
						},

						crossReferences: {
							...state.userSettings.toggleOptions.crossReferences,
							active: action.settings.crossReferences,
						},

						oneVersePerLine: {
							...state.userSettings.toggleOptions.oneVersePerLine,
							active: action.settings.oneVersePerLine,
						},
					},
				},
			};
		case 'persist/REHYDRATE':
			if (action.payload.settings) {
				return {
					...action.payload.settings,

					userSettings: {
						...action.payload.settings.userSettings,

						toggleOptions: {
							...action.payload.settings.userSettings.toggleOptions,

							redLetter: {
								...action.payload.settings.userSettings.toggleOptions.redLetter,
								available:
									state?.['userSettings']?.['toggleOptions']?.['redLetter']?.[
										'available'
									],
							},

							crossReferences: {
								...action.payload.settings.userSettings.toggleOptions
									.crossReferences,
								available:
									state?.['userSettings']?.['toggleOptions']?.[
										'crossReferences'
									]?.['available'],
							},
						},
					},
				};
			}
			return state;
		default:
			return state;
	}
}

export default settingsReducer;
