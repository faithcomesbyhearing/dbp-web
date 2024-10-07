import React from 'react';
import { fromJS } from 'immutable';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';

import { VersionList } from '..';
import { getTexts } from '../../VersionListSection/tests/versionListSectionUtils';

Enzyme.configure({ adapter: new Adapter() });

/* eslint-disable react/prop-types */
jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));
/* eslint-enable react/prop-types */

const props = {
	dispatch: jest.fn(),
	setActiveText: jest.fn(),
	toggleTextSelection: jest.fn(),
	activeTextId: 'ENGESV',
	activeBookId: 'MAT',
	activeChapter: 5,
	filterText: '',
	active: true,
	loadingVersions: false,
};

let bibles = fromJS([]);
describe('<VersionList />', () => {
	beforeEach(async () => {
		const jsBibles = await getTexts({ languageCode: 17045 });
		bibles = fromJS(jsBibles);
	});
	it('Should match previous snapshot', () => {
		const wrapper = Enzyme.mount(<VersionList {...props} bibles={bibles} />);

		expect(wrapper.find('div.accordion-title-style').length).toEqual(bibles.size);
	});
	it('Should contain a list of version names', () => {
		const wrapper = Enzyme.mount(<VersionList {...props} bibles={bibles} />);

		expect(wrapper.find('.version-name-list').length).toEqual(1);
	});
});
