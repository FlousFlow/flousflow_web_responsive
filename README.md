# FlousFlow Responsive

Responsive Odoo 19 backend enhancements for FlousFlow. The module provides a
responsive web client layout, navbar and home-menu improvements, share URL
support, and light/dark mode assets.

## Installation

1. Add this repository to the Odoo 19 `addons_path`.
2. Restart Odoo and update the Apps list.
3. Install **FlousFlow Responsive** (`flousflow_web_responsive`).

## Technical notes

- Requires Odoo 19 Community modules `web` and `base_setup`.
- The technical module name is `flousflow_web_responsive`.
- If `ica_web_responsive` is already installed, uninstall it before installing
  this fork to avoid loading duplicate web assets and OWL templates.

## License and provenance

The upstream module declared LGPL-3 and included attribution to Agga / IdeaCode
Academy. This FlousFlow fork keeps the LGPL-3 declaration and upstream
attribution in `NOTICE`. Confirm redistribution rights before publishing it
outside the private FlousFlow organization.
