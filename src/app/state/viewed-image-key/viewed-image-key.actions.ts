import { createActionGroup, props } from '@ngrx/store';

export const viewedImageKeyActions = createActionGroup({
    source: 'ViewedImageKey',
    events: {
        init: props<{ id?: string | undefined; fileStorageTypeId?: number }>(),
    },
});
