import cn from 'classnames';
import React from 'react';

interface LabelProps {
  className?: string;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, className }) => (
  <legend className={cn('text-orange mb-2 mt-8 font-medium uppercase', className)}>
    {children}
  </legend>
);

export default Label;
