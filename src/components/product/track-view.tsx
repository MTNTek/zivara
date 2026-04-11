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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  return null;
}
