{
    "name": "FlousFlow Responsive",
    "summary": "FlousFlow responsive backend, navbar, home menu, and dark mode enhancements.",
    "description": """
FlousFlow Responsive
====================

Responsive Odoo 19 backend enhancements for the FlousFlow platform.

Features
--------
* Responsive backend web client layout.
* Improved navbar, burger menu, and home menu behavior.
* Share URL support in the web client.
* Light and dark mode styling.
* List, kanban, pivot, search, and core UI improvements.

This module is intended for Odoo 19 Community installations.
""",
    "category": "Themes/Backend",
    "version": "19.0.1.0.0",
    "author": "FlousFlow",
    "maintainer": "FlousFlow",
    "website": "https://github.com/FlousFlow",
    "depends": ["web", "base_setup"],
    "auto_install": False,
    "data": [
        "views/webclient_templates.xml",
    ],
    "assets": {
        "web._assets_primary_variables": [
            (
                "after",
                "web/static/src/scss/primary_variables.scss",
                "flousflow_web_responsive/static/src/**/*.variables.scss",
            ),
            (
                "before",
                "web/static/src/scss/primary_variables.scss",
                "flousflow_web_responsive/static/src/scss/primary_variables.scss",
            ),
        ],
        "web._assets_secondary_variables": [
            (
                "before",
                "web/static/src/scss/secondary_variables.scss",
                "flousflow_web_responsive/static/src/scss/secondary_variables.scss",
            ),
        ],
        "web._assets_backend_helpers": [
            (
                "before",
                "web/static/src/scss/bootstrap_overridden.scss",
                "flousflow_web_responsive/static/src/scss/bootstrap_overridden.scss",
            ),
        ],
        "web.assets_frontend": [
            "flousflow_web_responsive/static/src/webclient/home_menu/home_menu_background.scss",  # used by login page
            "flousflow_web_responsive/static/src/webclient/navbar/navbar.scss",
        ],
        "web.assets_backend": [
            "flousflow_web_responsive/static/src/webclient/**/*.scss",
            "flousflow_web_responsive/static/src/views/**/*.scss",
            "flousflow_web_responsive/static/src/core/**/*",
            "flousflow_web_responsive/static/src/webclient/**/*.js",
            (
                "after",
                "web/static/src/views/list/list_renderer.xml",
                "flousflow_web_responsive/static/src/views/list/list_renderer_desktop.xml",
            ),
            "flousflow_web_responsive/static/src/webclient/**/*.xml",
            "flousflow_web_responsive/static/src/views/**/*.js",
            "flousflow_web_responsive/static/src/views/**/*.xml",
            ("remove", "flousflow_web_responsive/static/src/views/pivot/**"),
            # Don't include dark mode files in light mode
            ("remove", "flousflow_web_responsive/static/src/**/*.dark.scss"),
        ],
        "web.assets_backend_lazy": [
            "flousflow_web_responsive/static/src/views/pivot/**",
        ],
        "web.assets_backend_lazy_dark": [
            ("include", "web.dark_mode_variables"),
            # web._assets_backend_helpers
            (
                "before",
                "flousflow_web_responsive/static/src/scss/bootstrap_overridden.scss",
                "flousflow_web_responsive/static/src/scss/bootstrap_overridden.dark.scss",
            ),
            (
                "after",
                "web/static/lib/bootstrap/scss/_functions.scss",
                "flousflow_web_responsive/static/src/scss/bs_functions_overridden.dark.scss",
            ),
        ],
        "web.assets_web": [
            (
                "replace",
                "web/static/src/main.js",
                "flousflow_web_responsive/static/src/main.js",
            ),
        ],
        # ========= Dark Mode =========
        "web.dark_mode_variables": [
            # web._assets_primary_variables
            (
                "before",
                "flousflow_web_responsive/static/src/scss/primary_variables.scss",
                "flousflow_web_responsive/static/src/scss/primary_variables.dark.scss",
            ),
            (
                "before",
                "flousflow_web_responsive/static/src/**/*.variables.scss",
                "flousflow_web_responsive/static/src/**/*.variables.dark.scss",
            ),
            # web._assets_secondary_variables
            (
                "before",
                "flousflow_web_responsive/static/src/scss/secondary_variables.scss",
                "flousflow_web_responsive/static/src/scss/secondary_variables.dark.scss",
            ),
        ],
        "web.assets_web_dark": [
            ("include", "web.dark_mode_variables"),
            # web._assets_backend_helpers
            (
                "before",
                "flousflow_web_responsive/static/src/scss/bootstrap_overridden.scss",
                "flousflow_web_responsive/static/src/scss/bootstrap_overridden.dark.scss",
            ),
            (
                "after",
                "web/static/lib/bootstrap/scss/_functions.scss",
                "flousflow_web_responsive/static/src/scss/bs_functions_overridden.dark.scss",
            ),
            # assets_backend
            "flousflow_web_responsive/static/src/**/*.dark.scss",
        ],
    },
    "images": ["static/description/icon.png"],
    "license": "LGPL-3",
}
