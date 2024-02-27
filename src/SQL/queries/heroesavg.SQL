UPDATE heroes_avg
SET
	matches_count = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5, 
	matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5))),
	
	matches_win = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND matches.didradiantwin = 'true')
    OR
    (heroes_avg.hero_id IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND matches.didradiantwin = 'false')),
	
	radiant_matches_count = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5))),
	
	radiant_matches_win = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero1, matches.radianthero2, matches.radianthero3, matches.radianthero4, matches.radianthero5)
    AND matches.didradiantwin = 'true')),
	
	dire_matches_count = (SELECT COUNT(*) FROM matches WHERE
	(heroes_avg.hero_id IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5))),
	
	dire_matches_win = (SELECT COUNT(*) FROM matches WHERE
	(heroes_avg.hero_id IN (matches.direhero1, matches.direhero2, matches.direhero3, matches.direhero4, matches.direhero5)
    AND matches.didradiantwin = 'false'));