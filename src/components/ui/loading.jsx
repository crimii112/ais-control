import { FadeLoader } from 'react-spinners';
import { FlexRowWrapper } from './common';

/**
 * 로딩 컴포넌트
 * @returns {React.ReactNode}
 * @example <Loading />
 */
const Loading = () => {
  return (
    <FlexRowWrapper className="w-full py-12">
      <FadeLoader />
      <span className="text-lg font-semibold">Loading...</span>
    </FlexRowWrapper>
  );
};

export { Loading };
