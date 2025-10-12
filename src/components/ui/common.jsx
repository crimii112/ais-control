import { forwardRef } from 'react';
import { cn } from '@/lib/utils';


/**
 * 플렉스 레이아웃 래퍼 컴포넌트
 * @param {string} className - tailwind css 클래스 이름
 * @param {React.ReactNode} children - 자식 컴포넌트
 * @param {Object} props - 추가 속성
 * @returns {React.ReactNode} 플렉스 레이아웃 래퍼 컴포넌트
 */
const FlexRowWrapper = ({ className, children, ...props }) => {
  return (
    <div
      className={`${cn(
        'flex flex-row items-center justify-center',
        className
      )}`}
      {...props}
    >
      {children}
    </div>
  );
};
FlexRowWrapper.displayName = 'FlexRowWrapper';

const FlexColWrapper = ({ className, children, ...props }) => {
  return (
    <div
      className={`${cn(
        'flex flex-col items-center justify-center',
        className
      )}`}
      {...props}
    >
      {children}
    </div>
  );
};
FlexColWrapper.displayName = 'FlexColWrapper';


/**
 * 그리드 레이아웃 래퍼 컴포넌트
 * @param {string} className - tailwind css 클래스 이름
 * @param {React.ReactNode} children - 자식 컴포넌트
 * @param {Object} props - 추가 속성
 * @returns {React.ReactNode} 그리드 레이아웃 래퍼 컴포넌트
 */
const GridWrapper = ({ className, children, ...props }) => {
  return (
    <div className={`${cn('grid grid-cols-2', className)}`} {...props}>
      {children}
    </div>
  );
};
GridWrapper.displayName = 'GridWrapper';


/**
 * 버튼 컴포넌트
 * @param {string} className - tailwind css 클래스 이름
 * @param {React.ReactNode} children - 자식 컴포넌트
 * @param {Object} props - 추가 속성
 * @returns {React.ReactNode} 버튼 컴포넌트
 */
const Button = forwardRef(({ className, children, ...props }, ref) => (
  <button
    className={cn(
      'w-full p-1.5 border-0 rounded-sm bg-gray-200 text-gray-800 font-medium cursor-pointer whitespace-nowrap',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = 'ButtonComponent';


/**
 * 인풋 컴포넌트
 * @param {string} className - tailwind css 클래스 이름
 * @param {Object} props - 추가 속성
 * @returns {React.ReactNode} 인풋 컴포넌트
 */
const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    className={`${cn(
      'p-1 border border-gray-300 rounded-sm bg-white text-base',
      className
    )}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'InputComponent';


export {
  FlexRowWrapper,
  FlexColWrapper,
  GridWrapper,
  Button,
  Input,
};
