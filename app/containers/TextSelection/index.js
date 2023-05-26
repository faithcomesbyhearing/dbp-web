/**
 *
 * TextSelection
 *
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import CountryList from '../../components/CountryList';
import LanguageList from '../../components/LanguageList';
import VersionList from '../../components/VersionList';
import SvgWrapper from '../../components/SvgWrapper';
import CloseMenuFunctions from '../../utils/closeMenuFunctions';
import { setActiveTextId, toggleVersionSelection, closeVersionSelection } from '../HomePage/actions';
import {
	setVersionListState,
	setLanguageListState,
	setActiveIsoCode,
	setCountryListState,
	getTexts,
	getCountry,
	getCountries,
	getLanguages,
	setCountryName,
} from './actions';
import makeSelectTextSelection, {
	selectLanguages,
	selectTexts,
	selectCountries,
	selectHomepageData,
} from './selectors';
import messages from './messages';
/* eslint-disable jsx-a11y/no-static-element-interactions */
function TextSelection(props) {
	const [filterText, setFilterText] = useState('');
	const [fromCountry, setFromCountry] = useState(false);
	const [prevTextselection, setPrevTextselection] = useState('');

	const ref = useRef(null);

	const localToggleVersionSelection = () => {
		props.dispatch(toggleVersionSelection());
	};

	const localCloseVersionSelection = () => {
		props.dispatch(closeVersionSelection());
	};

	useEffect(() => {
		const closeMenuControllerRef = new CloseMenuFunctions(
			ref.current,
			localCloseVersionSelection
		);

		let timer;

		if (props.active) {
			timer = setTimeout(() => {
				closeMenuControllerRef.onMenuMount();
			}, 100);
		}

		return () => {
			clearTimeout(timer);
			closeMenuControllerRef.onMenuUnmount();
		};
	}, [props.active]);

	useEffect(() => {
		if (
			props.textselection?.activeIsoCode !== prevTextselection?.activeIsoCode ||
			props.textselection?.activeLanguageCode !== prevTextselection?.activeLanguageCode
		) {
			props.dispatch(
				getTexts({
					languageIso: props.textselection.activeIsoCode,
					languageCode: props.textselection.activeLanguageCode,
				}),
			);
		}

		if (
			props.textselection?.versionListActive !== prevTextselection?.versionListActive ||
			props.textselection?.countryListActive !== prevTextselection?.countryListActive ||
			props.textselection?.languageListActive !== prevTextselection?.languageListActive
		) {
			setFilterText('');
		}
		setPrevTextselection(props.textselection);
	}, [props.textselection]);

	if (!props.active) {
		return;
	}

	const localSetCountryListState = () => props.dispatch(setCountryListState());

	const localSetActiveIsoCode = ({ iso, name, languageCode }) =>
		props.dispatch(setActiveIsoCode({ iso, name, languageCode }));

	const localSetActiveTextId = (args) => props.dispatch(setActiveTextId(args));

	const localSetCountryName = ({ name, languages }) =>
		props.dispatch(setCountryName({ name, languages }));

	const localGetCountry = (args) => props.dispatch(getCountry(args));

	const localGetCountries = () => props.dispatch(getCountries());

	const localGetLanguages = () => props.dispatch(getLanguages());

	const inputPlaceholder = () => {
		if (props.textselection?.countryListActive) {
			return 'countryMessage';
		} else if (props.textselection?.languageListActive) {
			return 'languageMessage';
		}

		return 'versionMessage';
	};

	const stopClickProp = (e) => e.stopPropagation();

	const stopTouchProp = (e) => e.stopPropagation();

	const toggleLanguageList = () => props.dispatch(setLanguageListState());

	const toggleVersionList = () => props.dispatch(setVersionListState());

	const handleSearchInputChange = (e) => setFilterText(e.target.value);

	const {
		countryListActive,
		languageListActive,
		versionListActive,
		activeIsoCode,
		activeLanguageName,
		activeCountryName,
		activeLanguageCode,
		countryLanguages,
		loadingVersions,
		loadingCountries,
		loadingLanguages,
		finishedLoadingCountries,
	} = props.textselection;

	const { bibles, active, languages, countries, homepageData: { activeTextId } } = props;

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<aside
			style={{ display: active ? 'flex' : 'none' }}
			ref={ref}
			onTouchEnd={stopTouchProp}
			onClick={stopClickProp}
			className={'text-selection-dropdown'}
		>
			<div className={'tab-options'}>
				<span
					id={'country-tab'}
					onClick={countryListActive ? () => {} : localSetCountryListState}
					className={countryListActive ? 'tab-option active' : 'tab-option'}
				>
					<FormattedMessage {...messages.country} />
				</span>
				<span
					id={'language-tab'}
					onClick={languageListActive ? () => {} : toggleLanguageList}
					className={languageListActive ? 'tab-option active' : 'tab-option'}
				>
					<FormattedMessage {...messages.language} />
				</span>
				<span
					id={'version-tab'}
					onClick={versionListActive ? () => {} : toggleVersionList}
					className={versionListActive ? 'tab-option active' : 'tab-option'}
				>
					<FormattedMessage {...messages.version} />
				</span>
			</div>
			<div className={'search-input-bar'}>
				<SvgWrapper className={'icon'} svgid={'search'} />
				<input
					id={'version-search'}
					onChange={handleSearchInputChange}
					value={filterText}
					className={'input-class'}
					placeholder={messages[inputPlaceholder()].defaultMessage}
				/>
			</div>
			<CountryList
				countries={countries}
				filterText={filterText}
				active={countryListActive}
				loadingCountries={loadingCountries}
				activeCountryName={activeCountryName}
				finishedLoadingCountries={finishedLoadingCountries}
				setCountryName={localSetCountryName}
				getCountry={localGetCountry}
				getCountries={localGetCountries}
				toggleVersionList={toggleVersionList}
				toggleLanguageList={toggleLanguageList}
				setCountryListState={localSetCountryListState}
				setFromCountry={setFromCountry}
			/>
			<LanguageList
				languages={languages}
				filterText={filterText}
				fromCountry={fromCountry}
				active={languageListActive}
				activeIsoCode={activeIsoCode}
				languageCode={activeLanguageCode}
				countryLanguages={countryLanguages}
				loadingLanguages={loadingLanguages}
				countryListActive={countryListActive}
				activeLanguageName={activeLanguageName}
				getLanguages={localGetLanguages}
				setActiveIsoCode={localSetActiveIsoCode}
				toggleVersionList={toggleVersionList}
				toggleLanguageList={toggleLanguageList}
				setCountryListState={localSetCountryListState}
				setFromCountry={setFromCountry}
				toggleTextSelection={localToggleVersionSelection}
			/>
			<VersionList
				bibles={bibles}
				filterText={filterText}
				active={versionListActive}
				activeTextId={activeTextId}
				loadingVersions={loadingVersions}
				setActiveText={localSetActiveTextId}
				toggleTextSelection={localToggleVersionSelection}
			/>
		</aside>
	);
}

TextSelection.propTypes = {
	dispatch: PropTypes.func.isRequired,
	bibles: PropTypes.object,
	languages: PropTypes.array,
	countries: PropTypes.object,
	textselection: PropTypes.object,
	homepageData: PropTypes.object,
	active: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
	textselection: makeSelectTextSelection(),
	languages: selectLanguages(),
	bibles: selectTexts(),
	countries: selectCountries(),
	homepageData: selectHomepageData(),
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

const withConnect = connect(
	mapStateToProps,
	mapDispatchToProps,
);

export default compose(withConnect)(TextSelection);
