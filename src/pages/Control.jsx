import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { RefreshCw } from 'lucide-react';

import usePostRequest from '@/hooks/usePostRequest';
import Timer from '@/worker/Timer';
import GroupCard from '@/components/ui/group-card';

/**
 * 대기물질 관제 페이지
 * @returns {React.ReactNode} 대기물질 관제 페이지
 */
function Control() {
  const postMutation = usePostRequest();

  // url 관련
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const sitecdParam = queryParams.get('sitecd');

  const [siteList, setSiteList] = useState([]);
  const [selectedSite, setSelectedSite] = useState({});

  const [data, setData] = useState({});
  const [subData, setSubData] = useState([]);
  const [type, setType] = useState('1');

  const [defaultSeconds, setDefaultSeconds] = useState(300);
  const [clickedTime, setClickedTime] = useState(moment());

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedHeights, setExpandedHeights] = useState({});

  const scrollPosition = useRef(0);

  const worker = new Worker(
    new URL('../worker/timerWorker.js', import.meta.url),
    { type: 'module' }
  );

  useEffect(() => {
    getSiteList();
  }, []);

  useEffect(() => {
    if (siteList.length > 0) {
      const targetSite =
        siteList.find(site => site.sitecd === Number(sitecdParam)) ||
        siteList[0];

      setSelectedSite(targetSite);
      getControlData(targetSite.sitecd);

      if (!sitecdParam) {
        navigate(`?sitecd=${targetSite.sitecd}`, { replace: true });
      }
    }

    worker.postMessage(300000);
  }, [siteList]);

  const handleClickSiteBtn = site => {
    setSelectedSite(site);
    getControlData(site.sitecd);

    navigate(`?sitecd=${site.sitecd}`, { replace: false });
  };

  useEffect(() => {
    if (selectedSite.sitecd) {
      getControlData(selectedSite.sitecd);
    }
    worker.postMessage(300000);

    return () => worker.terminate();
  }, [defaultSeconds, clickedTime]);

  worker.onmessage = () => {
    setDefaultSeconds(300);
    setClickedTime(moment());
  };

  const getSiteList = async () => {
    const siteData = await postMutation.mutateAsync({
      url: '/ais/srch/datas.do',
      data: { page: 'intensive/site' },
    });

    setSiteList(siteData.rstList);
  };

  const getControlData = async sitecd => {
    scrollPosition.current = window.scrollY;

    const data1Res = await postMutation.mutateAsync({
      url: '/ais/srch/datas.do',
      data: { page: 'iabnrm/selectlastdata1', sitecd: sitecd },
    });
    const data2Res = await postMutation.mutateAsync({
      url: '/ais/srch/datas.do',
      data: { page: 'iabnrm/selectlastdata2', sitecd: sitecd },
    });

    setData({
      1: data1Res.rstList,
      2: data2Res.rstList,
    });
    setSubData(data1Res.rstList2);

    // console.log(data1Res);
    // console.log(data2Res);
  };

  // 스크롤 위치 복원
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPosition.current,
        behavior: 'auto',
      });
    });
  }, [data]);

  const handleClickRefresh = () => {
    // window.location.reload();
    setDefaultSeconds(300);
    setClickedTime(moment());
  };

  const handleChangeType = e => {
    setType(e.target.value);
  };

  const toggleGroup = (groupNm, innerRef) => {
    setSelectedGroup(prev => {
      if (prev === groupNm) {
        return null;
      } else {
        if (innerRef?.current) {
          const h = innerRef.current.srcollHeight + 32;
          setExpandedHeights({ [groupNm]: h });
        }
        return groupNm;
      }
    });
  };

  const isOverTwoHours = mdatetime => {
    const mdatetimeMoment = moment(mdatetime);
    const diff = moment().diff(mdatetimeMoment, 'hours');
    return diff >= 2;
  };

  return (
    <>
      <div className="site-btns-container">
        {siteList?.map(site => (
          <button
            key={site.sitecd}
            value={site.sitecd}
            className={`site-btn ${
              selectedSite?.sitecd === site.sitecd ? 'active' : ''
            }`}
            onClick={() => handleClickSiteBtn(site)}
          >
            {site.site.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* 헤더 */}
      <header className="aq-header">
        <div className="aq-title">
          {selectedSite.site
            ? `${selectedSite.site.slice(0, 3)} 대기환경연구소 관제`
            : '대기물질 관제'}
        </div>
        <div className="aq-time">
          update{'  '}
          <span id="aq-time">
            <Timer defaultSeconds={defaultSeconds} clickedTime={clickedTime} />
          </span>
          {'  '}
          <RefreshCw
            width={16}
            height={16}
            style={{ cursor: 'pointer' }}
            onClick={handleClickRefresh}
          />
        </div>
        <div className="aq-options">
          <label className="aq-radio">
            <input
              type="radio"
              name="type"
              value="1"
              onChange={handleChangeType}
              defaultChecked
            />
            {'  '}입경제외
          </label>
          <label className="aq-radio">
            <input
              type="radio"
              name="type"
              value="2"
              onChange={handleChangeType}
            />
            {'  '}입경만
          </label>
        </div>
      </header>

      <main className="aq-grid" id="grid">
        {data[type]?.map((d, idx) => {
          if (type === '1') {
            const groupSubItems = subData.filter(
              sd => sd.groupNm === d.groupNm
            );

            // 상세 데이터가 여러 개 → 그룹
            if (d.groupCnt > 1) {
              return (
                <GroupCard
                  key={d.groupNm + idx}
                  d={d}
                  groupSubItems={groupSubItems}
                  isOpen={selectedGroup === d.groupNm}
                  onToggle={toggleGroup}
                />
              );
            }

            // 상세 데이터가 1개 → 일반
            if (d.groupCnt === 1) {
              const sd = groupSubItems[0];
              return (
                <article key={sd.itemNm} className="aq-card">
                  <div className="aq-card__head">
                    <span>{sd.itemNm}</span>
                  </div>
                  <div
                    className="aq-card__date"
                    style={{
                      color: isOverTwoHours(sd.mdatetime) ? 'red' : 'inherit',
                    }}
                  >
                    {sd.mdatetime}
                  </div>
                  <div className="aq-card__value">
                    {sd.conc}{' '}
                    <span className="aq-card__unit">{sd.itemUnit}</span>
                  </div>
                </article>
              );
            }

            return null;
          }

          // type === "2" → 일반
          return (
            <article key={d.itemNm + idx} className="aq-card">
              <div className="aq-card__head">
                <span>{d.itemNm}</span>
              </div>
              <div
                className="aq-card__date"
                style={{
                  color: isOverTwoHours(d.mdatetime) ? 'red' : 'inherit',
                }}
              >
                {d.mdatetime}
              </div>
              <div className="aq-card__value">
                {d.conc} <span className="aq-card__unit">{d.itemUnit}</span>
              </div>
            </article>
          );
        })}
      </main>
    </>
  );
}

export default Control;
