import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  onClick?: () => void;
  text?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PrintButton({ 
  onClick, 
  text = "Печать", 
  className = "",
  variant = "outline",
  size = "default"
}: PrintButtonProps) {
  const handlePrint = () => {
    if (onClick) {
      onClick();
    } else {
      window.print();
    }
  };

  return (
    <Button
      onClick={handlePrint}
      variant={variant}
      size={size}
      className={`no-print ${className}`}
      data-testid="button-print"
    >
      <Printer className="h-4 w-4 mr-2" />
      {text}
    </Button>
  );
}

export default PrintButton;