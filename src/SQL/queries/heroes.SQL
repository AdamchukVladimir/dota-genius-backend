UPDATE heroes
SET
  matchescount = 0,
  radiantmatchescount = 0,
  dirematchescount = 0,
  matcheswin = 0,
  radiantmatcheswin = 0,
  dirematcheswin = 0;

UPDATE heroes
SET
  matchescount = matchescount + (SELECT COUNT(*) FROM matches WHERE
    (heroes.hero1 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND heroes.hero2 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    )
    OR
    (heroes.hero1 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND heroes.hero2 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    )),
    
  radiantmatchescount = radiantmatchescount + (SELECT COUNT(*) FROM matches WHERE
    (heroes.hero1 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND heroes.hero2 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    )),
    
  dirematchescount = dirematchescount + (SELECT COUNT(*) FROM matches WHERE
    (heroes.hero1 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND heroes.hero2 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    )),
    
  matcheswin = matcheswin + (SELECT COUNT(*) FROM matches WHERE
    (heroes.hero1 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND heroes.hero2 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND matches.didradiantwin = 'true')
    OR
    (heroes.hero1 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND heroes.hero2 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND matches.didradiantwin = 'false')),
    
  radiantmatcheswin = radiantmatcheswin + (SELECT COUNT(*) FROM matches WHERE
    (heroes.hero1 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND heroes.hero2 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND matches.didradiantwin = 'true')),
    
  dirematcheswin = dirematcheswin + (SELECT COUNT(*) FROM matches WHERE
    (heroes.hero1 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND heroes.hero2 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND matches.didradiantwin = 'false'));