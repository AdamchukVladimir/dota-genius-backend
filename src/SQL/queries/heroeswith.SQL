UPDATE heroes_with 
SET matchescount = (SELECT COUNT(*) 
                    FROM matches 
                    WHERE ((heroes_with.hero1 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5) 
                    AND heroes_with.hero2 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5))
					OR (heroes_with.hero1 IN (direhero1, direhero2, direhero3, direhero4, direhero5) 
                    AND heroes_with.hero2 IN (direhero1, direhero2, direhero3, direhero4, direhero5)))
					
                   ),
	matcheswin = (SELECT COUNT(*) 
                    FROM matches 
                    WHERE ((heroes_with.hero1 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5) 
                    AND heroes_with.hero2 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5)
					AND matches.didradiantwin = 'true')
					OR (heroes_with.hero1 IN (direhero1, direhero2, direhero3, direhero4, direhero5) 
                    AND heroes_with.hero2 IN (direhero1, direhero2, direhero3, direhero4, direhero5)
					AND matches.didradiantwin = 'false'))
					
                   ),
    radiantmatchescount = (SELECT COUNT(*) 
                           FROM matches 
                           WHERE (heroes_with.hero1 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5) 
                           AND heroes_with.hero2 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5)) 
                          ), 
    radiantmatcheswin = (SELECT COUNT(*) 
                         FROM matches 
                         WHERE (heroes_with.hero1 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5) 
                         AND heroes_with.hero2 IN (radianthero1, radianthero2, radianthero3, radianthero4, radianthero5)) 
                         AND matches.didradiantwin = 'true'
                        ),
    dirematchescount = (SELECT COUNT(*) 
                        FROM matches 
                        WHERE (heroes_with.hero1 IN (direhero1, direhero2, direhero3, direhero4, direhero5) 
                        AND heroes_with.hero2 IN (direhero1, direhero2, direhero3, direhero4, direhero5))
                       ), 
    dirematcheswin = (SELECT COUNT(*) 
                      FROM matches 
                      WHERE (heroes_with.hero1 IN (direhero1, direhero2, direhero3, direhero4, direhero5) 
                      AND heroes_with.hero2 IN (direhero1, direhero2, direhero3, direhero4, direhero5)) 
                      AND matches.didradiantwin = 'false'
                     ),
    firstbloodtime_avg = (
  SELECT AVG(matches.firstbloodtime)
  FROM matches
  WHERE (
    heroes_with.hero1 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND heroes_with.hero2 IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
  )
  OR (
    heroes_with.hero1 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND heroes_with.hero2 IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
  )
);