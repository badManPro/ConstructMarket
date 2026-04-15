"use strict";
Component({
    properties: {
        item: {
            type: Object,
            value: {},
        },
        showFavorite: {
            type: Boolean,
            value: true,
        },
    },
    methods: {
        handleTap() {
            const item = this.data.item;
            if (!item?.id)
                return;
            this.triggerEvent("tapcard", { id: item.id });
        },
        handleFavoriteTap() {
            const item = this.data.item;
            if (!item?.id)
                return;
            this.triggerEvent("favorite", { id: item.id });
        },
    },
});
