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
                     );