import { useState, useEffect, useRef, RefObject } from 'react';

interface UseDraggableProps {
  initialPosition?: { x: number; y: number };
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

export function useDraggable({ 
  initialPosition = { x: 0, y: 0 }, 
  bounds 
}: UseDraggableProps = {}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !elementRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      let newX = clientX - dragOffset.x;
      let newY = clientY - dragOffset.y;
      
      // Apply bounds if specified
      if (bounds) {
        const elementRect = elementRef.current.getBoundingClientRect();
        if (bounds.left !== undefined) newX = Math.max(bounds.left, newX);
        if (bounds.right !== undefined) newX = Math.min(bounds.right - elementRect.width, newX);
        if (bounds.top !== undefined) newY = Math.max(bounds.top, newY);
        if (bounds.bottom !== undefined) newY = Math.min(bounds.bottom - elementRect.height, newY);
      }
      
      setPosition({ x: newX, y: newY });
    };

    const snapToCorner = () => {
      if (!elementRef.current) return;
      
      const elementRect = elementRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Get current center position
      const centerX = position.x + elementRect.width / 2;
      const centerY = position.y + elementRect.height / 2;
      
      // Determine which corner is closest
      const isLeft = centerX < windowWidth / 2;
      const isTop = centerY < windowHeight / 2;
      
      const padding = 16;
      let newX, newY;
      
      if (isLeft && isTop) {
        // Top-left corner
        newX = padding;
        newY = padding;
      } else if (!isLeft && isTop) {
        // Top-right corner
        newX = windowWidth - elementRect.width - padding;
        newY = padding;
      } else if (isLeft && !isTop) {
        // Bottom-left corner
        newX = padding;
        newY = windowHeight - elementRect.height - padding;
      } else {
        // Bottom-right corner
        newX = windowWidth - elementRect.width - padding;
        newY = windowHeight - elementRect.height - padding;
      }
      
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      // Snap to nearest corner after dragging ends
      setTimeout(snapToCorner, 100);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset, bounds]);

  return {
    position,
    isDragging,
    elementRef,
    startDrag,
    setPosition
  };
}