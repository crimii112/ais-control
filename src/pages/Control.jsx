import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { RefreshCw, X } from 'lucide-react';

import usePostRequest from '@/hooks/usePostRequest';
import Timer from '@/worker/Timer';
import GroupCard from '@/components/ui/group-card';
import SimpleTimeSeriesGraph from '@/components/ui/simple-time-series-graph';

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

  const [openedItemCd, setOpenedItemCd] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [insertIndex, setInsertIndex] = useState(null);

  const scrollPosition = useRef(0);
  const selectedItemRef = useRef(null);
  const graphRef = useRef(null);

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

      // 그래프가 열려있으면 그래프 데이터 가져와야함
      if (openedItemCd) {
        getGraphData(selectedSite.sitecd, openedItemCd);
      }
    }
    worker.postMessage(300000);

    return () => worker.terminate();
  }, [defaultSeconds, clickedTime]);

  worker.onmessage = () => {
    setDefaultSeconds(300);
    setClickedTime(moment());
  };

  // 측정소 목록 조회
  const getSiteList = async () => {
    const siteData = await postMutation.mutateAsync({
      url: '/ais/srch/datas.do',
      data: { page: 'intensive/site' },
    });

    setSiteList(siteData.rstList);
  };

  // 측정소별 관제 데이터 조회
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

  // 새로고침 클릭 핸들러
  const handleClickRefresh = () => {
    console.log('clicked refresh button');
    setDefaultSeconds(300);
    setClickedTime(moment());
  };

  // '입경제외' / '입경만' 변경 핸들러
  const handleChangeType = e => {
    if (e.target.value === '2') {
      setGraphData(null);
      setInsertIndex(null);
      selectedItemRef.current = null;
    }
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

  // 2시간 초과 여부 판단
  const isOverTwoHours = mdatetime => {
    const mdatetimeMoment = moment(mdatetime);
    const diff = moment().diff(mdatetimeMoment, 'hours');
    return diff >= 2;
  };

  /* 그래프 데이터 가져오는 함수 */
  const getGraphData = async (sitecd, itemcd) => {
    const dataRes = await postMutation.mutateAsync({
      url: '/ais/srch/datas.do',
      data: { page: 'iabnrm/selectlast72hour', sitecd: sitecd, itemcd: itemcd },
    });

    if (dataRes.rstList[0] === 'NO DATA') {
      alert('그래프를 그릴 데이터가 없습니다.');
      return;
    }

    setGraphData(dataRes.rstList);
  };

  /* 카드 헤드 클릭 시 시계열 그래프 표출하는 함수 */
  const handleClickCardHead = async (e, itemcd) => {
    setOpenedItemCd(itemcd);
    await getGraphData(selectedSite.sitecd, itemcd);

    // 클릭된 카드 요소
    let card = e.target.closest('.aq-card');
    if (card) {
      // 일반 카드 => 그룹카드 닫기
      setSelectedGroup(null);
    } else {
      // sgr-card 클릭 시 gr-card를 기준으로
      const sgrCard = e.target.closest('.sgr-card');
      if (sgrCard) {
        card = sgrCard.closest('.gr-expand')?.previousElementSibling;
      }
    }

    // 클릭된 카드 요소 저장 => resize 시 사용
    selectedItemRef.current = card;

    // 현재 줄의 첫 번째 카드 인덱스 찾기
    const grid = document.querySelector('.aq-grid');
    const cards = Array.from(grid.querySelectorAll('.aq-card, .gr-card'));

    const clickedTop = card.offsetTop;

    // 같은 줄에 있는 카드들 찾기
    const sameRowCards = cards.filter(c => {
      return c.offsetTop === clickedTop;
    });
    const firstCardOfRow = sameRowCards[0];
    const rowStartIndex = cards.indexOf(firstCardOfRow);

    setInsertIndex(rowStartIndex);
  };

  /* 그래프 데이터 변경 시 그래프 위치로 스크롤 */
  useEffect(() => {
    if (graphData && graphRef.current) {
      setTimeout(() => {
        const top =
          graphRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: top - 20,
          behavior: 'smooth',
        });
      }, 50);
    }
  }, [graphData]);

  /* 창 크기 변경 시 그래프 삽입 위치 재계산, 스크롤 위치 조정 */
  useEffect(() => {
    if (!graphData) return;

    const handleResize = () => {
      // 클릭된 카드 요소
      const card = selectedItemRef.current;
      if (!card) return;

      // 현재 줄의 첫 번째 카드 인덱스 찾기
      const grid = document.querySelector('.aq-grid');
      const cards = Array.from(grid.querySelectorAll('.aq-card, .gr-card'));

      const clickedTop = card.offsetTop;

      // 같은 줄에 있는 카드들 찾기
      const sameRowCards = cards.filter(c => {
        return c.offsetTop === clickedTop;
      });
      const firstCardOfRow = sameRowCards[0];
      const rowStartIndex = cards.indexOf(firstCardOfRow);

      setInsertIndex(rowStartIndex);

      setTimeout(() => {
        const top =
          graphRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: top - 20,
          behavior: 'smooth',
        });
      }, 50);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [graphData]);

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

      {/* 시계열 그래프 */}
      {/* {graphData && graphData.length !== 0 && (
        <section className="graph-section">
          <button
            className="graph-close-btn"
            onClick={() => setGraphData(null)}
          >
            <X />
          </button>
          <SimpleTimeSeriesGraph data={graphData} />
        </section>
      )} */}

      {/* 메인 카드 */}
      <main className="aq-grid" id="grid">
        {data[type]?.map((d, idx) => {
          // type === "1" → 입경제외
          if (type === '1') {
            const groupSubItems = subData.filter(
              sd => sd.groupNm === d.groupNm
            );

            // 상세 데이터가 여러 개 → 그룹
            if (d.groupCnt > 1) {
              return (
                <React.Fragment key={d.groupNm + idx}>
                  {/* 그래프 삽입 위치 */}
                  {graphData && idx === insertIndex && (
                    <section className="graph-section" ref={graphRef}>
                      <button
                        className="graph-close-btn"
                        onClick={() => {
                          setGraphData(null);
                          setInsertIndex(null);
                          setOpenedItemCd(null);
                          selectedItemRef.current = null;
                        }}
                      >
                        <X />
                      </button>
                      <SimpleTimeSeriesGraph data={graphData} />
                    </section>
                  )}

                  <GroupCard
                    d={d}
                    groupSubItems={groupSubItems}
                    isOpen={selectedGroup === d.groupNm}
                    onToggle={toggleGroup}
                    isOverTwoHours={isOverTwoHours}
                    handleClickCardHead={handleClickCardHead}
                  />
                </React.Fragment>
              );
            }

            // 상세 데이터가 1개 → 일반
            if (d.groupCnt === 1) {
              const sd = groupSubItems[0];
              return (
                <React.Fragment key={sd.itemNm}>
                  {graphData && idx === insertIndex && (
                    <section className="graph-section" ref={graphRef}>
                      <button
                        className="graph-close-btn"
                        onClick={() => {
                          setGraphData(null);
                          setInsertIndex(null);
                          setOpenedItemCd(null);
                          selectedItemRef.current = null;
                        }}
                      >
                        <X />
                      </button>
                      <SimpleTimeSeriesGraph data={graphData} />
                    </section>
                  )}

                  <article className="aq-card">
                    <div
                      className="aq-card__head"
                      onClick={e => handleClickCardHead(e, sd.itemCd)}
                    >
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
                </React.Fragment>
              );
            }

            return null;
          }

          // type === "2" → 입경만
          return (
            <article key={d.itemNm + idx} className="aq-card">
              <div className="aq-card__head">
                <span>{`${d.itemNm}(${d.groupNm})`}</span>
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
