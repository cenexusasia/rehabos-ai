import React from 'react';

type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type StackAlignment = 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline';
type StackJustify =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface StackProps {
  children: React.ReactNode;
  direction?: StackDirection;
  gap?: number | string;
  align?: StackAlignment;
  justify?: StackJustify;
  wrap?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'span' | 'section' | 'article' | 'nav' | 'header' | 'footer' | 'main';
}

/**
 * Stack — a flexbox layout component for consistent vertical or horizontal spacing.
 *
 * @example
 * <Stack direction="column" gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 */
export function Stack({
  children,
  direction = 'column',
  gap = 4,
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  className,
  style,
  as: Tag = 'div',
}: StackProps) {
  const gapValue = typeof gap === 'number' ? `${gap * 4}px` : gap;

  return (
    <Tag
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap: gapValue,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
