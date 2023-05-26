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

    return (
      <Accordion>
        {items.map((item) => {
          const { key, title, className, text, altText, types, clickHandler } = item;

          if (types.audio && types.audio_drama) {
            return (
              <AccordionItem key={key} className="accordion-title-style">
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <h4 title={title} className={className}>
                      {altText ? `${text} (${altText})` : text}
                    </h4>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel className="accordion-body-style">
                  <a
                    key={`${key}_drama`}
                    role="button"
                    tabIndex={0}
                    className="version-item-button"
                    onClick={() => clickHandler('audio_drama')}
                  >
                    Dramatized Version
                  </a>
                  <a
                    key={`${key}_plain`}
                    role="button"
                    tabIndex={0}
                    className="version-item-button"
                    onClick={() => clickHandler('audio')}
                  >
                    Non-Dramatized Version
                  </a>
                </AccordionItemPanel>
              </AccordionItem>
            );
          }

          return (
            <AccordionItem key={key} className="accordion-title-style">
              <AccordionItemHeading aria-level={1}>
                <AccordionItemButton>
                  <a
                    key={key}
                    role="button"
                    tabIndex={0}
                    title={title}
                    className={`${className} top-level-title`}
                    onClick={() => clickHandler('')}
                  >
                    {altText ? `${text} (${altText})` : text}
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
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      className: PropTypes.string,
      text: PropTypes.string.isRequired,
      altText: PropTypes.string,
      types: PropTypes.shape({
        audio: PropTypes.bool,
        audio_drama: PropTypes.bool,
        text_plain: PropTypes.bool,
        text_format: PropTypes.bool,
      }).isRequired,
      clickHandler: PropTypes.func.isRequired,
    })
  ),
};

export default VersionListSection;
