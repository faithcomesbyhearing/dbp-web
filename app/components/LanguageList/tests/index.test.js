import React from 'react';
import { render } from '@testing-library/react';
import { languages } from '../../../utils/testUtils/languageData';
import { LanguageList } from '..';

jest.mock('react-virtualized', () => ({
	List: ({ rowRenderer, rowCount }) => {
		const components = [];
		for (let i = 0; i < rowCount; i++) {
			components.push(rowRenderer({ index: i, style: {}, key: `${i}_row` }));
		}
		return <>{components}</>;
	},
	AutoSizer: ({ children }) => children({ width: 150, height: 50 }),
}));

const props = {
	languages,
	setActiveIsoCode: jest.fn(),
	toggleLanguageList: jest.fn(),
	toggleVersionList: jest.fn(),
	getLanguages: jest.fn(),
	filterText: '',
	active: true,
	loadingLanguages: false,
	languageCode: 17045,
};

describe('LanguageList component', () => {
	it('should match snapshot of active list', () => {
		const { asFragment } = render(<LanguageList {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot of active list with an applied filter', () => {
		const { asFragment } = render(
			<LanguageList {...props} filterText={'en'} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
