/**
 *
 * VersionListSection
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
	Accordion,
	AccordionItem,
	AccordionItemPanel,
	AccordionItemHeading,
	AccordionItemButton,
} from 'react-accessible-accordion';

class VersionListSection extends React.PureComponent {
	render() {
		const { items } = this.props;
		// Remove links and use programatic routing
		return (
			<Accordion>
				{items.map((item) => {
					if (item.types.audio && item.types.audio_drama) {
						return (
							<AccordionItem className={'accordion-title-style'} key={item.key}>
								<AccordionItemHeading>
									<AccordionItemButton>
										<h4 title={item.title} className={item.className}>
											{item.altText
												? `${item.text} ( ${item.altText} )`
												: item.text}
										</h4>
									</AccordionItemButton>
								</AccordionItemHeading>
								<AccordionItemPanel className={'accordion-body-style'}>
									<a
										key={`${item.key}_drama`}
										role={'button'}
										tabIndex={0}
										className="version-item-button"
										onClick={() => item.clickHandler('audio_drama')}
									>
										Dramatized Version
									</a>
									<a
										key={`${item.key}_plain`}
										role={'button'}
										tabIndex={0}
										className="version-item-button"
										onClick={() => item.clickHandler('audio')}
									>
										Non-Dramatized Version
									</a>
								</AccordionItemPanel>
							</AccordionItem>
						);
					}
					return (
						<AccordionItem className={'accordion-title-style'} key={item.key}>
							<AccordionItemHeading>
								<AccordionItemButton>
									<a
										key={item.key}
										role={'button'}
										tabIndex={0}
										title={item.title}
										className={`${item.className} top-level-title`}
										onClick={() => item.clickHandler('')}
									>
										{item.altText
											? `${item.text} ( ${item.altText} )`
											: item.text}
									</a>
        </AccordionItemButton>
       </AccordionItemHeading>
							<AccordionItemPanel />
						</AccordionItem>
					);
				})}
			</Accordion>
		);
	}
}

VersionListSection.propTypes = {
	items: PropTypes.array,
};

export default VersionListSection;
