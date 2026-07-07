import React from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  padding?: number | string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}

const maxWidths: Record<ContainerSize, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
};

const defaultPadding = '16px';

/**
 * Container — a centered, max-width wrapper for page content.
 *
 * @example
 * <Container size="lg">
 *   <p>Centered content max 1024px wide</p>
 * </Container>
 */
export function Container({
  children,
  size = 'lg',
  padding = defaultPadding,
  className,
  style,
  as: Tag = 'div',
}: ContainerProps) {
  const paddingValue = typeof padding === 'number' ? `${padding * 4}px` : padding;

  return (
    <Tag
      className={className}
      style={{
        width: '100%',
        maxWidth: maxWidths[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: paddingValue,
        paddingRight: paddingValue,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
