'use client';

import { useEffect } from 'react';
import { trackProductView } from './recently-viewed';

interface TrackViewProps {
  id: string;
  name: string;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string;
}

export function TrackView(props: TrackViewProps) {
  useEffect(() => {
    trackProductView(props);
  }, [props.id]);

  return null;
}
