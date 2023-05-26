import React from 'react';
import renderer from 'react-test-renderer';
import { act } from 'react-dom/test-utils';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import AccountSettings from '..';

Enzyme.configure({ adapter: new Adapter() });

/* eslint-disable react/prop-types */
jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));
jest.mock('../../PopupMessage', () => function accountSettingsPopupMessageMock({ message }) {
  return <span id={'popup-message'}>{message}</span>;
});
/* eslint-enable react/prop-types */

const logout = jest.fn(() => 'Logging out');
const changePicture = jest.fn(() => 'Changing Picture');
const completeProps = {
	logout,
	changePicture,
	profile: {
		email: 'jesse@dbs.org',
		nickname: 'J',
		name: 'Jesse',
		avatar: '',
		popupOpen: false,
	},
};
const incompleteProps = {
	logout,
	changePicture,
	profile: {
		email: '',
		nickname: '',
		name: '',
		avatar: '',
		popupOpen: false,
	},
};

describe('Name of the group', () => {
	it('should match the old snapshot with a full profile', () => {
		const tree = renderer
			.create(<AccountSettings {...completeProps} />)
			.toJSON();

		expect(tree).toMatchSnapshot();
	});
	it('should match the old snapshot without a full profile', () => {
		const tree = renderer
			.create(<AccountSettings {...incompleteProps} />)
			.toJSON();

		expect(tree).toMatchSnapshot();
	});
	it('should match the old snapshot with the popup open', () => {
		const tree = renderer
			.create(<AccountSettings {...completeProps} popupOpen />)
			.toJSON();

		expect(tree).toMatchSnapshot();
	});
	it('should use handleEmailChange to handle the changed email', () => {
		const wrapper = Enzyme.mount(<AccountSettings {...completeProps} />);
		const spy = jest.spyOn(wrapper.instance(), 'handleEmailChange');
		const newEmail = 'testemail@change.org';
		wrapper.find('input').simulate('change', { target: { value: newEmail } });
		act(() => {
			wrapper.instance().handleEmailChange({ target: { value: newEmail } });
		});
		expect(spy).toHaveBeenCalled();
		expect(wrapper.state('email')).toEqual(newEmail);
		expect(wrapper.find('input').props().value).toEqual(newEmail);
	});
});
