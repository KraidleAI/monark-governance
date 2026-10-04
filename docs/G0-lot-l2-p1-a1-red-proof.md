# G0 du lot L2 P1-a1 : déclaration red-proof (test seul)

Le lot P1-a1 n ajoute que du code de test : la place factice `test/l2-fake-place.ts` et son auto-test `test/l2-fake-place.test.ts`. Aucun code de production ne change, chaque test est donc vert à la base. La preuve suit le mode `--test-only` (RED-PROOF-TEST-ONLY-1) : chaque tueur déclaré ci-dessous, tiré seul au gel, doit faire rougir son test par une assertion.

red-proof: test-only

Tueurs déclarés (module d appui `test/l2-fake-place.ts`, importé par `test/l2-fake-place.test.ts`, MUTANTS-TEST-SUPPORT-1) :

- test/l2-fake-place.ts:31 ROR "n < 126" -> "n <= 126"
- test/l2-fake-place.ts:32 CONST "(fin ? 0x80 : 0)" -> "0x80"
- test/l2-fake-place.ts:52 CONST "masked; i++" -> "false; i++"
- test/l2-fake-place.ts:77 CONST "writeUInt16BE(code)" -> "writeUInt16BE(1000)"
- test/l2-fake-place.ts:78 CONST "muted = true" -> "muted = false"
- test/l2-fake-place.ts:18 CONST "text: 1" -> "text: 2"
- test/l2-fake-place.ts:65 CONST "writeHead(r.status" -> "writeHead(200"
- test/l2-fake-place.ts:109 CONST "allowed.includes(u.origin)" -> "true"
