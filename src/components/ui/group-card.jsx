import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';

const GroupCard = ({ d, groupSubItems, isOpen, onToggle }) => {
  const innerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen && innerRef.current) {
      setHeight(innerRef.current.scrollHeight + 32); // padding 보정
    } else {
      setHeight(0);
    }
  }, [isOpen, groupSubItems]);

  const isOverTwoHours = mdatetime => {
    const mdatetimeMoment = moment(mdatetime);
    const diff = moment().diff(mdatetimeMoment, 'hours');
    return diff >= 2;
  };

  return (
    <>
      <article
        id="gr-group"
        className={`gr-card gr-card--mat gr-card--clickable ${
          isOpen ? 'gr-open' : ''
        }`}
        onClick={() => onToggle(d.groupNm)}
        aria-controls={`${d.groupNm}-expand`}
        aria-expanded={isOpen}
      >
        <div className="gr-card__head">
          <span className="gr-card__title">{d.itemNm}</span>
          <div className="gr-card__group">
            <span>{d.groupNm}</span>
            <span className="gr-card__arrow">{isOpen ? '▲' : '▽'}</span>
          </div>
        </div>
        <div
          className="gr-card__date"
          style={{
            color: isOverTwoHours(d.mdatetime) ? 'red' : 'inherit',
          }}
        >
          {d.mdatetime}
        </div>
        <div className="gr-card__value">
          {d.conc} <span className="gr-card__unit">{d.itemUnit}</span>
        </div>
      </article>

      <div
        className={`gr-expand ${isOpen ? 'gr-open' : ''}`}
        id={`${d.groupNm}-expand`}
        style={{
          maxHeight: isOpen ? `${height}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
        }}
      >
        <div className="gr-expand__inner" ref={innerRef}>
          {groupSubItems.map((sd, idx) => (
            <article key={sd.itemNm} className="sgr-card">
              <div className="sgr-card__head">
                <span>{sd.itemNm}</span>
              </div>
              <div
                className="sgr-card__date"
                style={{
                  color: isOverTwoHours(sd.mdatetime) ? 'red' : 'inherit',
                }}
              >
                {sd.mdatetime}
              </div>
              <div className="sgr-card__value">
                {sd.conc} <span className="sgr-card__unit">{sd.itemUnit}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export default GroupCard;
