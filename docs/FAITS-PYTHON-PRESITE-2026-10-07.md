# FAITS — PYTHON_PRESITE, -X presite et -E (CPython 3.14), lus sur place

- **Lu par** : MONARK (orchestrateur, `claude-opus-5-5`), navigateur interne, le 2026-10-07 à 13:10 UTC (horloge `now.mjs`).
- **Page** : https://docs.python.org/3.14/using/cmdline.html (« 1. Command line and environment — Python 3.14.8 documentation »).
- **Niveau** : [lu].

| Point | Citation (25 mots au plus) | Lecture |
|---|---|---|
| `-X presite` | « Python needs to be built in debug mode for this option to exist. » | l option n existe que dans un build debug |
| `PYTHON_PRESITE` | « Needs Python configured with the --with-pydebug build option. » | la variable n agit que dans un build debug |
| `PYTHON_PRESITE`, effet | « imported early in the interpreter lifecycle, before the site module is executed, and before the __main__ module is created » | elle tourne avant `site` et avant l entrée, d où la règle d io_guard |
| `-E` | « Ignore all PYTHON* environment variables, e.g. PYTHONPATH and PYTHONHOME, that might be set. » | sous `-E`, `PYTHON_PRESITE` est ignorée |

**Ce que cela ferme** : la demande de lecture de la mission 5 de l outil figé et de CM-5 v6.1 (B8). La limite « pas de build debug pour
mesurer » est fermée par deux voies. La source primaire dit que l option et la variable n existent que dans un build debug ; io_guard
refuse un build debug à l import (`hasattr(sys, "gettotalrefcount")`). Sous la forme `-E -S -s -B`, la variable est en outre ignorée
(`-E`).
