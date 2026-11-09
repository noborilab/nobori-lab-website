# Web fonts

Latin and latin-ext subsets of the four site typefaces, self-hosted so the page
makes no request to Google Fonts. The `@font-face` rules are in `src/fonts.css`.

| Family | Files | Licence |
| --- | --- | --- |
| Cormorant Garamond (variable, 300–700, roman + italic) | `cormorant-garamond-*` | SIL Open Font License 1.1 |
| Karla (variable, 200–800, roman + italic) | `karla-*` | SIL Open Font License 1.1 |
| Josefin Sans (variable, 100–700, roman) | `josefin-sans-*` | SIL Open Font License 1.1 |
| IBM Plex Mono (400, 500, roman) | `ibm-plex-mono-*` | SIL Open Font License 1.1 |

Source: the Fontsource npm packages (`@fontsource-variable/cormorant-garamond`,
`@fontsource-variable/karla`, `@fontsource-variable/josefin-sans`,
`@fontsource/ibm-plex-mono`, all v5.3.0), which repackage the Google Fonts files.
To add a weight, style or script, copy the matching `.woff2` from the package's
`files/` folder and add its `@font-face` block to `src/fonts.css`.
