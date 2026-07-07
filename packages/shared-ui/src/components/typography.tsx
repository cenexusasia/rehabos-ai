import React from 'react';

type AsElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function createTypographyComponent(
  as: AsElement,
  baseStyle: React.CSSProperties,
  displayName: string,
) {
  const Component = ({ children, className, style }: TypographyProps) =>
    React.createElement(as, { className, style: { ...baseStyle, ...style } }, children);
  Component.displayName = displayName;
  return Component;
}

const defaultFontFamily =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const H1 = createTypographyComponent(
  'h1',
  {
    fontFamily: defaultFontFamily,
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  'H1',
);

export const H2 = createTypographyComponent(
  'h2',
  {
    fontFamily: defaultFontFamily,
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  'H2',
);

export const H3 = createTypographyComponent(
  'h3',
  {
    fontFamily: defaultFontFamily,
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  'H3',
);

export const P = createTypographyComponent(
  'p',
  {
    fontFamily: defaultFontFamily,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    margin: 0,
  },
  'P',
);

export const Small = createTypographyComponent(
  'span',
  {
    fontFamily: defaultFontFamily,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    margin: 0,
  },
  'Small',
);

export const Muted = createTypographyComponent(
  'span',
  {
    fontFamily: defaultFontFamily,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#64748b',
    margin: 0,
  },
  'Muted',
);
