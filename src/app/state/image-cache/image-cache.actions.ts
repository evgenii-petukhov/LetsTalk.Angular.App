import { createActionGroup, props } from '@ngrx/store';
import { ImageCacheEntry } from 'src/app/models/image-cache-entry';

export const imageCacheActions = createActionGroup({
    source: 'ImageCache',
    events: {
        add: props<{ image: ImageCacheEntry }>(),
    },
});
