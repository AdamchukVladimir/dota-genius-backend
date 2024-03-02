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
    AND matches.didradiantwin = 'false')),

    position_1_matchescount = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero1, matches.direhero1))),
	
	position_1_matcheswin = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero1)
	AND matches.didradiantwin = 'true')
	OR
	(heroes_avg.hero_id IN (matches.direhero1)
	AND matches.didradiantwin = 'false')),
	
	position_2_matchescount = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero2, matches.direhero2))),
	
	position_2_matcheswin = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero2)
	AND matches.didradiantwin = 'true')
	OR
	(heroes_avg.hero_id IN (matches.direhero2)
	AND matches.didradiantwin = 'false')),
	
	position_3_matchescount = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero3, matches.direhero3))),
	
	position_3_matcheswin = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero3)
	AND matches.didradiantwin = 'true')
	OR
	(heroes_avg.hero_id IN (matches.direhero3)
	AND matches.didradiantwin = 'false')),
	
	position_4_matchescount = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero4, matches.direhero4))),
	
	position_4_matcheswin = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero4)
	AND matches.didradiantwin = 'true')
	OR
	(heroes_avg.hero_id IN (matches.direhero4)
	AND matches.didradiantwin = 'false')),
	
	position_5_matchescount = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero5, matches.direhero5))),
	
	position_5_matcheswin = (SELECT COUNT(*) FROM matches WHERE
    (heroes_avg.hero_id IN (matches.radianthero5)
	AND matches.didradiantwin = 'true')
	OR
	(heroes_avg.hero_id IN (matches.direhero5)
	AND matches.didradiantwin = 'false'));