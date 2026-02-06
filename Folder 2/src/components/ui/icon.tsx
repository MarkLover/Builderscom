import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

const Icon: React.FC<IconProps> = ({ name, fallback = 'CircleAlert', className = '', ...props }) => {
  const IconComponent = (LucideIcons as Record<string, React.FC<LucideProps>>)[name];

  if (!IconComponent) {
    const FallbackIcon = (LucideIcons as Record<string, React.FC<LucideProps>>)[fallback];

    if (!FallbackIcon) {
      return <span className="text-xs text-gray-400">[icon]</span>;
    }

    return <FallbackIcon className={`transition-all duration-200 ${className}`} {...props} />;
  }

  return <IconComponent className={`transition-all duration-200 ${className}`} {...props} />;
};

export default Icon;