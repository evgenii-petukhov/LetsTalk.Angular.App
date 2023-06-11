import { createActionGroup, props } from '@ngrx/store';
import { Image } from 'src/app/models/image';

export const imagesActions = createActionGroup({
    source: 'Images',
    events: {
        add: props<{ image: Image }>()
    }
});
