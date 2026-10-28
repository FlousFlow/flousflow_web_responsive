import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { ActivityRenderer } from "@mail/views/web/activity/activity_renderer";

patch(ActivityRenderer.prototype, {
    get scheduleActivityLabel() {
        return _t("Schedule activity");
    },
});
