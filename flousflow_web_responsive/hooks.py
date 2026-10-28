def _align_arabic_preferences_title(env):
    if not env['res.lang'].search([('code', '=', 'ar_001'), ('active', '=', True)], limit=1):
        return

    action = env.ref('base.action_res_users_my', raise_if_not_found=False)
    if action:
        action.with_context(lang='ar_001').write({
            'name': 'تغيير التفضيلات الخاصة بي',
        })


def post_init_hook(env):
    _align_arabic_preferences_title(env)
