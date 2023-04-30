import { fromJS, Map, List } from 'immutable';

// Custom out function to handle Immutable.js structures
const out = (raw) => {
    const state = {};
    Object.keys(raw).forEach((key) => {
        state[key] = Map.isMap(raw[key]) || List.isList(raw[key]) ? raw[key].toJS() : raw[key];
    });
    return state;
};

// Custom in function to handle Immutable.js structures
const _in = (serialized) => {
    const state = {};
    Object.keys(serialized).forEach((key) => {
        state[key] = fromJS(serialized[key]);
    });
    return state;
};

// Create custom transformer
const createImmutableTransformer = () => ({
    out,
    in: _in,
});

export default createImmutableTransformer;
