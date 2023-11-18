import { createActionGroup, props } from '@ngrx/store';

export const viewedImageIdActions = createActionGroup({
    source: 'ViewedImageId',
    events: {
        init: props<{imageId: string}>(),
    }
});
