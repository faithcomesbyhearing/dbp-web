import React from 'react';
import { render } from '@testing-library/react';

import { countries } from '../../../utils/testUtils/countryData';
import CountryList from '..';

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
	countries: structuredClone(countries),
	setCountryName: jest.fn(),
	toggleLanguageList: jest.fn(),
	setCountryListState: jest.fn(),
	getCountry: jest.fn(),
	getCountries: jest.fn(),
	filterText: '',
	active: true,
	loadingCountries: false,
	activeCountryName: 'ANY',
};

describe('CountryList component', () => {
	it('should match snapshot of active list', () => {
		const { asFragment } = render(<CountryList {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot of active list with an applied filter', () => {
		const { asFragment } = render(
			<CountryList {...props} filterText={'uni'} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
