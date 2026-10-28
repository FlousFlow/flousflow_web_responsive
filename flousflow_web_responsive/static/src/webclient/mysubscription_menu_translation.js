import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";

const userMenuRegistry = registry.category("user_menuitems");
const menuItemKey = "mysubscription_user_menu";
let patchedMenuItem;

function localizeMySubscriptionItem() {
    const menuItem = userMenuRegistry.get(menuItemKey, null);
    if (!menuItem || menuItem === patchedMenuItem) {
        return;
    }

    patchedMenuItem = (env) => {
        const item = menuItem(env);
        return item && { ...item, description: _t("My Subscription") };
    };
    userMenuRegistry.add(menuItemKey, patchedMenuItem, { force: true });
}

userMenuRegistry.addEventListener("UPDATE", localizeMySubscriptionItem);
localizeMySubscriptionItem();
